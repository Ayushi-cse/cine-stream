import { useState, useEffect } from 'react';
import { subscribeToNetworkActivity } from '../services/apiClient';

/**
 * useNetworkActivity Hook
 * 
 * Provides live telemetry of HTTP network requests dispatched by the app.
 * Powers the on-screen QA Demonstration Network Inspector.
 */
export function useNetworkActivity(maxEntries = 12) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToNetworkActivity((newEntry) => {
      setLogs((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === newEntry.id);
        if (existingIndex >= 0) {
          // Update in-place (e.g. from PENDING to 200 OK)
          const updated = [...prev];
          updated[existingIndex] = newEntry;
          return updated;
        } else {
          return [newEntry, ...prev.slice(0, maxEntries - 1)];
        }
      });
    });

    return unsubscribe;
  }, [maxEntries]);

  const clearLogs = () => setLogs([]);

  return { logs, clearLogs };
}

export default useNetworkActivity;
