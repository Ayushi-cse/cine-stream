/**
 * TMDB (The Movie Database) API Service
 * 
 * Provides methods for consuming TMDB REST v3 endpoints:
 * - /movie/popular (Popular movies discovery)
 * - /search/movie (Debounced query matching)
 * - /movie/{id} (Detailed movie metadata & credits)
 * - /genre/movie/list (Genre taxonomy)
 * 
 * Handles CDN image URL construction and null poster asset fallbacks.
 */

import apiClient from './apiClient';
import { getMockPagedMovies, searchMockMovies, MOCK_GENRES } from './mockData';

const DEFAULT_TMDB_BASE = 'https://api.themoviedb.org/3';
const DEFAULT_IMAGE_BASE = 'https://image.tmdb.org/t/p';

/**
 * Resolves poster image URL with graceful SVG fallback for null paths.
 * Satisfies Sprint FAQ #4 & #12.
 */
export function getPosterUrl(posterPath, size = 'w500') {
  if (!posterPath) {
    return '/placeholder-poster.svg';
  }
  // OMDB or external absolute URLs
  if (posterPath.startsWith('http://') || posterPath.startsWith('https://')) {
    return posterPath;
  }
  const imageBase = import.meta.env.VITE_TMDB_IMAGE_BASE || DEFAULT_IMAGE_BASE;
  const cleanPath = posterPath.startsWith('/') ? posterPath : `/${posterPath}`;
  return `${imageBase}/${size}${cleanPath}`;
}

/**
 * Resolves backdrop cinematic image URL
 */
export function getBackdropUrl(backdropPath, size = 'w1280') {
  if (!backdropPath) return null;
  if (backdropPath.startsWith('http://') || backdropPath.startsWith('https://')) {
    return backdropPath;
  }
  const imageBase = import.meta.env.VITE_TMDB_IMAGE_BASE || DEFAULT_IMAGE_BASE;
  const cleanPath = backdropPath.startsWith('/') ? backdropPath : `/${backdropPath}`;
  return `${imageBase}/${size}${cleanPath}`;
}

export class TmdbService {
  constructor(apiKey = '', baseUrl = DEFAULT_TMDB_BASE) {
    this.apiKey = apiKey || import.meta.env.VITE_TMDB_API_KEY || '';
    this.baseUrl = baseUrl || import.meta.env.VITE_TMDB_BASE_URL || DEFAULT_TMDB_BASE;
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  hasValidKey() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 10);
  }

  /**
   * Fetches popular movies with pagination.
   * Falls back gracefully to mock catalog if no key is present or on network error.
   */
  async getPopular(page = 1) {
    if (!this.hasValidKey()) {
      return getMockPagedMovies(page);
    }

    try {
      const response = await apiClient.get(`${this.baseUrl}/movie/popular`, {
        params: {
          api_key: this.apiKey,
          page,
          language: 'en-US',
          include_adult: false,
        },
        label: `TMDB Popular (Page ${page})`,
      });

      return response.data;
    } catch (error) {
      console.warn(`[TMDB Service] Failed to fetch popular movies on page ${page}:`, error.message);
      // If network fails (e.g., ISP blocked in India), fall back gracefully to mock data
      return getMockPagedMovies(page);
    }
  }

  /**
   * Searches movies by debounced text query.
   */
  async searchMovies(query, page = 1) {
    if (!query || !query.trim()) {
      return this.getPopular(page);
    }

    if (!this.hasValidKey()) {
      return searchMockMovies(query, page);
    }

    try {
      const response = await apiClient.get(`${this.baseUrl}/search/movie`, {
        params: {
          api_key: this.apiKey,
          query: query.trim(),
          page,
          language: 'en-US',
          include_adult: false,
        },
        label: `TMDB Search: "${query.substring(0, 15)}" (p.${page})`,
      });

      return response.data;
    } catch (error) {
      console.warn(`[TMDB Service] Search failed for query "${query}":`, error.message);
      return searchMockMovies(query, page);
    }
  }

  /**
   * Fetches detailed movie metadata
   */
  async getMovieDetails(movieId) {
    if (!this.hasValidKey()) {
      return null;
    }

    try {
      const response = await apiClient.get(`${this.baseUrl}/movie/${movieId}`, {
        params: {
          api_key: this.apiKey,
          append_to_response: 'credits,videos',
        },
        label: `TMDB Details (ID: ${movieId})`,
      });

      return response.data;
    } catch (error) {
      console.warn(`[TMDB Service] Failed to fetch details for movie ${movieId}:`, error.message);
      return null;
    }
  }

  /**
   * Fetches official genre list
   */
  async getGenres() {
    if (!this.hasValidKey()) {
      return MOCK_GENRES;
    }

    try {
      const response = await apiClient.get(`${this.baseUrl}/genre/movie/list`, {
        params: {
          api_key: this.apiKey,
          language: 'en-US',
        },
        label: 'TMDB Genres',
      });

      return response.data.genres || MOCK_GENRES;
    } catch {
      return MOCK_GENRES;
    }
  }
}

export const tmdbService = new TmdbService();
export default tmdbService;
