import React, { useState, useMemo } from 'react';
import MovieCard from '../components/MovieCard';
import { Heart, Trash2, Search, ArrowLeft, SlidersHorizontal } from 'lucide-react';

/**
 * FavoritesPage Component
 * 
 * Dedicated view rendering the user's persisted favorites array.
 * Fulfills Phase 2 State Persistence requirement.
 */
export function FavoritesPage({
  favorites = [],
  isFavorite,
  onToggleFavorite,
  onSelectMovie,
  onClearFavorites,
  onNavigateDiscover,
}) {
  const [filterQuery, setFilterQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'rating' | 'year' | 'title'

  // Filter and sort the in-memory persisted favorites
  const processedFavorites = useMemo(() => {
    let result = [...favorites];

    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          (m.title && m.title.toLowerCase().includes(q)) ||
          (m.overview && m.overview.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.vote_average || 0) - (a.vote_average || 0);
      }
      if (sortBy === 'year') {
        const yearA = a.release_date ? parseInt(a.release_date.substring(0, 4), 10) : 0;
        const yearB = b.release_date ? parseInt(b.release_date.substring(0, 4), 10) : 0;
        return yearB - yearA;
      }
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      // 'recent' by default (order preserved in state)
      return 0;
    });

    return result;
  }, [favorites, filterQuery, sortBy]);

  return (
    <div className="main-content">
      <div className="app-container">
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(229, 9, 20, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brand-primary)',
                }}
              >
                <Heart size={16} fill="currentColor" />
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff' }}>
                My Favorites Watchlist
              </h1>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              State persisted in localStorage ({favorites.length} saved titles)
            </p>
          </div>

          {favorites.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={onClearFavorites}
                className="btn btn-secondary btn-sm"
                style={{ color: '#ff6b6b', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              >
                <Trash2 size={14} />
                <span>Clear All</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter & Sort Controls */}
        {favorites.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '2rem',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            {/* Search within favorites */}
            <div
              style={{
                position: 'relative',
                flex: '1 1 240px',
                maxWidth: '400px',
              }}
            >
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter saved favorites..."
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                  backgroundColor: '#1E1E1E',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Sort Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  backgroundColor: '#1E1E1E',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.825rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="recent">Recently Added</option>
                <option value="rating">Highest Rated</option>
                <option value="year">Release Year (Newest)</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>
        )}

        {/* Empty State */}
        {favorites.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '5rem 1.5rem',
              backgroundColor: 'rgba(24, 24, 24, 0.4)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-subtle)',
            }}
          >
            <div
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                backgroundColor: 'rgba(229, 9, 20, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                color: 'var(--brand-primary)',
              }}
            >
              <Heart size={32} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
              Your Watchlist is Empty
            </h3>

            <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 1.5rem', fontSize: '0.925rem', lineHeight: 1.5 }}>
              Click the heart icon on any movie poster to save it to your local offline-synced favorites list.
            </p>

            <button
              type="button"
              onClick={onNavigateDiscover}
              className="btn btn-primary"
            >
              <ArrowLeft size={16} />
              <span>Explore Discover Feed</span>
            </button>
          </div>
        ) : processedFavorites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            No favorites match the filter "{filterQuery}".
          </div>
        ) : (
          /* High-Fidelity CSS Grid for Favorites */
          <div className="movie-grid">
            {processedFavorites.map((movie) => (
              <MovieCard
                key={String(movie.id)}
                movie={movie}
                isFavorite={isFavorite ? isFavorite(movie.id) : true}
                onToggleFavorite={onToggleFavorite}
                onSelectMovie={onSelectMovie}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FavoritesPage;
