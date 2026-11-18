/**
 * Cine-Stream API Client
 * 
 * Lightweight, robust HTTP client abstraction designed to emulate Axios semantics
 * (automated JSON serialization, URL query serialization, timeout guards, and
 * standardized error payloads) while remaining zero-dependency and browser-native.
 * 
 * Also dispatches network telemetry events so the in-app Network Inspector can
 * showcase debouncing latency and infinite scroll page hydration for the 3-minute QA demo.
 */

// Event listener registry for live network monitoring (used by QA Network Inspector)
const networkListeners = new Set();

export const subscribeToNetworkActivity = (callback) => {
  networkListeners.add(callback);
  return () => networkListeners.delete(callback);
};

const notifyNetworkActivity = (entry) => {
  networkListeners.forEach((cb) => {
    try {
      cb(entry);
    } catch (err) {
      console.error('Error in network listener callback:', err);
    }
  });
};

/**
 * Serializes an object into a URL search params string, safely ignoring undefined/null.
 */
const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Standardized HTTP request handler with timeout and error mapping.
 */
export async function httpRequest(url, options = {}) {
  const {
    method = 'GET',
    headers = {},
    params,
    body,
    timeout = 10000,
    label = 'HTTP'
  } = options;

  const fullUrl = `${url}${buildQueryString(params)}`;
  const startTime = performance.now();
  const requestId = Math.random().toString(36).substring(2, 9);

  // Notify inspector that request has initiated
  notifyNetworkActivity({
    id: requestId,
    timestamp: new Date().toLocaleTimeString(),
    method,
    url: fullUrl,
    label,
    status: 'PENDING',
    duration: 0,
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const config = {
      method,
      headers: {
        'Accept': 'application/json',
        ...headers,
      },
      signal: controller.signal,
    };

    if (body && method !== 'GET' && method !== 'HEAD') {
      config.body = typeof body === 'string' ? body : JSON.stringify(body);
      config.headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(fullUrl, config);
    clearTimeout(timeoutId);

    const duration = Math.round(performance.now() - startTime);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { status_message: response.statusText };
      }

      const errorMessage = errorData.status_message || errorData.message || `Request failed with status ${response.status}`;
      
      notifyNetworkActivity({
        id: requestId,
        timestamp: new Date().toLocaleTimeString(),
        method,
        url: fullUrl,
        label,
        status: response.status,
        duration,
        error: errorMessage,
      });

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    const data = await response.json();

    notifyNetworkActivity({
      id: requestId,
      timestamp: new Date().toLocaleTimeString(),
      method,
      url: fullUrl,
      label,
      status: response.status,
      duration,
    });

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    const duration = Math.round(performance.now() - startTime);

    const isAbort = err.name === 'AbortError';
    const message = isAbort ? `Request timed out after ${timeout}ms` : err.message;

    notifyNetworkActivity({
      id: requestId,
      timestamp: new Date().toLocaleTimeString(),
      method,
      url: fullUrl,
      label,
      status: isAbort ? 'TIMEOUT' : 'FAILED',
      duration,
      error: message,
    });

    throw err;
  }
}

/**
 * Axios-compatible client interface for seamless drop-in semantics.
 */
export const apiClient = {
  get: (url, config = {}) => httpRequest(url, { ...config, method: 'GET' }),
  post: (url, body, config = {}) => httpRequest(url, { ...config, method: 'POST', body }),
  put: (url, body, config = {}) => httpRequest(url, { ...config, method: 'PUT', body }),
  delete: (url, config = {}) => httpRequest(url, { ...config, method: 'DELETE' }),
};

export default apiClient;
