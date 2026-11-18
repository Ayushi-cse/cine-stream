import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'cinestream_favorites';

/**
 * useFavorites Hook
 * 
 * Manages the user's saved favorites list with persistent localStorage synchronization.
 * Stores full movie payloads so favorites can be browsed instantly offline without
 * redundant API calls.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const persisted = localStorage.getItem(STORAGE_KEY);
      return persisted ? JSON.parse(persisted) : [];
    } catch (err) {
      console.error('Failed to parse favorites from localStorage:', err);
      return [];
    }
  });

  // Persist updates to localStorage whenever favorites array mutates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (err) {
      console.error('Failed to persist favorites to localStorage:', err);
    }
  }, [favorites]);

  // Synchronize across browser tabs or windows via the storage event
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setFavorites(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Error synchronizing favorites cross-tab:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const isFavorite = useCallback(
    (movieId) => {
      if (!movieId) return false;
      return favorites.some((item) => String(item.id) === String(movieId));
    },
    [favorites]
  );

  const toggleFavorite = useCallback((movie) => {
    if (!movie || !movie.id) return;

    setFavorites((prev) => {
      const exists = prev.some((item) => String(item.id) === String(movie.id));
      if (exists) {
        return prev.filter((item) => String(item.id) !== String(movie.id));
      } else {
        // Store full sanitized movie item payload
        const cleaned = {
          id: movie.id,
          title: movie.title || 'Untitled',
          poster_path: movie.poster_path || null,
          backdrop_path: movie.backdrop_path || null,
          vote_average: movie.vote_average || 0,
          release_date: movie.release_date || 'N/A',
          overview: movie.overview || '',
          genre_ids: movie.genre_ids || [],
          savedAt: new Date().toISOString(),
        };
        return [cleaned, ...prev];
      }
    });
  }, []);

  const removeFavorite = useCallback((movieId) => {
    setFavorites((prev) => prev.filter((item) => String(item.id) !== String(movieId)));
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    clearFavorites,
    favoritesCount: favorites.length,
  };
}

export default useFavorites;
