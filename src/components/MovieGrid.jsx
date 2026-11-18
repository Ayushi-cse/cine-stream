import React, { useMemo } from 'react';
import MovieCard from './MovieCard';
import SkeletonCard from './SkeletonCard';
import { Film, AlertCircle } from 'lucide-react';

/**
 * MovieGrid Component
 * 
 * Renders the responsive CSS grid layout of movie cards.
 * 
 * Performance Architecture:
 * - Employs memoized Map deduplication to guarantee unique React key mappings
 *   even when TMDB page slices return overlapping records.
 * - Injects the invisible sentinel element observed by useInfiniteScroll.
 */
export function MovieGrid({
  movies = [],
  isLoading = false,
  isFetchingNextPage = false,
  isFavorite,
  onToggleFavorite,
  onSelectMovie,
  sentinelRef,
  hasMore = true,
  searchQuery = '',
}) {
  // Deduplicate movies by ID using Map to preserve order and prevent duplicate key crashes
  const uniqueMovies = useMemo(() => {
    const map = new Map();
    movies.forEach((movie) => {
      if (movie && movie.id) {
        map.set(String(movie.id), movie);
      }
    });
    return Array.from(map.values());
  }, [movies]);

  if (isLoading && uniqueMovies.length === 0) {
    return (
      <div className="movie-grid" role="status" aria-label="Loading movies">
        {Array.from({ length: 12 }).map((_, index) => (
          <SkeletonCard key={`initial-skeleton-${index}`} />
        ))}
      </div>
    );
  }

  if (!isLoading && uniqueMovies.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 1.5rem',
          textAlign: 'center',
          backgroundColor: 'rgba(24, 24, 24, 0.4)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-subtle)',
          margin: '2rem 0',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(229, 9, 20, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand-primary)',
            marginBottom: '1rem',
          }}
        >
          <Film size={28} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          No Media Objects Found
        </h3>
        <p style={{ color: 'var(--text-muted)', maxWidth: '420px', fontSize: '0.925rem' }}>
          {searchQuery
            ? `No movies matched the query "${searchQuery}". Try searching for a director, franchise, or another title.`
            : 'No movies are currently available in this view.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* High-Fidelity Responsive CSS Grid */}
      <div className="movie-grid" role="feed" aria-busy={isFetchingNextPage}>
        {uniqueMovies.map((movie) => (
          <MovieCard
            key={String(movie.id)}
            movie={movie}
            isFavorite={isFavorite ? isFavorite(movie.id) : false}
            onToggleFavorite={onToggleFavorite}
            onSelectMovie={onSelectMovie}
          />
        ))}

        {/* Append shimmering skeleton cards while fetching page N+1 */}
        {isFetchingNextPage &&
          Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={`next-page-skeleton-${i}`} />
          ))}
      </div>

      {/* 
        Phase 2 Infinite Scroll Sentinel
        Invisible element attached to IntersectionObserver at bottom of DOM grid
      */}
      {hasMore ? (
        <div
          ref={sentinelRef}
          style={{
            height: '40px',
            margin: '2rem 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
          }}
          aria-hidden="true"
        >
          {isFetchingNextPage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid rgba(229, 9, 20, 0.25)',
                  borderTopColor: 'var(--brand-primary)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span>Hydrating page data...</span>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem 1.5rem',
            color: 'var(--text-dim)',
            fontSize: '0.85rem',
          }}
        >
          <span>— End of Catalog —</span>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default MovieGrid;
