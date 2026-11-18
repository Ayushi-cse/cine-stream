/**
 * OMDB API Service (Alternative Provider)
 * 
 * Provided per Sprint Phase 1 guidelines:
 * "If TMDB is blocked by your ISP in India, you are authorized to use the OMDB API at omdbapi.com as an alternative"
 * 
 * Normalizes OMDB payload shapes into Cine-Stream's unified media schema.
 */

import apiClient from './apiClient';
import { getMockPagedMovies, searchMockMovies } from './mockData';

const OMDB_BASE = 'https://www.omdbapi.com';

export class OmdbService {
  constructor(apiKey = '') {
    this.apiKey = apiKey || import.meta.env.VITE_OMDB_API_KEY || '';
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  hasValidKey() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 3);
  }

  normalizeMovie(item) {
    return {
      id: item.imdbID || Math.random().toString(36).substring(2, 9),
      title: item.Title,
      release_date: item.Year ? `${item.Year}-01-01` : 'N/A',
      poster_path: item.Poster && item.Poster !== 'N/A' ? item.Poster : null,
      backdrop_path: null,
      vote_average: item.imdbRating ? parseFloat(item.imdbRating) : 7.2,
      vote_count: 1000,
      overview: item.Plot || 'No overview available for this title.',
      genre_ids: [],
    };
  }

  async getPopular(page = 1) {
    // OMDB does not have a native "popular" endpoint, so we query top cinema classics
    return this.searchMovies('Avengers', page);
  }

  async searchMovies(query, page = 1) {
    if (!query || !query.trim()) {
      return getMockPagedMovies(page);
    }

    if (!this.hasValidKey()) {
      return searchMockMovies(query, page);
    }

    try {
      const response = await apiClient.get(OMDB_BASE, {
        params: {
          apikey: this.apiKey,
          s: query.trim(),
          type: 'movie',
          page,
        },
        label: `OMDB Search: "${query.substring(0, 15)}" (p.${page})`,
      });

      if (response.data.Response === 'False') {
        return {
          page,
          results: [],
          total_pages: 0,
          total_results: 0,
          error: response.data.Error,
        };
      }

      const results = (response.data.Search || []).map(this.normalizeMovie);
      const totalResults = parseInt(response.data.totalResults, 10) || results.length;
      const totalPages = Math.ceil(totalResults / 10);

      return {
        page,
        results,
        total_pages: totalPages,
        total_results: totalResults,
      };
    } catch (error) {
      console.warn('[OMDB Service] Search failed:', error.message);
      return searchMockMovies(query, page);
    }
  }

  async getMovieDetails(imdbId) {
    if (!this.hasValidKey()) return null;

    try {
      const response = await apiClient.get(OMDB_BASE, {
        params: {
          apikey: this.apiKey,
          i: imdbId,
          plot: 'full',
        },
        label: `OMDB Details (${imdbId})`,
      });

      if (response.data.Response === 'False') return null;
      return this.normalizeMovie(response.data);
    } catch {
      return null;
    }
  }
}

export const omdbService = new OmdbService();
export default omdbService;
