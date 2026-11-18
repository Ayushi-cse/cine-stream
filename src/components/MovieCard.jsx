import React, { useState } from 'react';
import { Heart, Star, Film } from 'lucide-react';
import { getPosterUrl } from '../services/tmdbService';

/**
 * MovieCard Component
 * 
 * Renders individual movie card in the discovery grid.
 * 
 * Performance & Architecture Features:
 * - Native lazy loading (loading="lazy") to defer image downloads until viewport intersection.
 * - Graceful SVG fallback asset if poster_path is null or fails to load.
 * - Aspect ratio 2:3 container preventing Cumulative Layout Shift (CLS).
 * - Heart button dispatching persistence action into favorites state.
 */
export function MovieCard({ movie, isFavorite, onToggleFavorite, onSelectMovie }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!movie) return null;

  // Extract release year from "YYYY-MM-DD" string
  const releaseYear = movie.release_date
    ? movie.release_date.substring(0, 4)
    : 'N/A';

  const rating = typeof movie.vote_average === 'number'
    ? movie.vote_average.toFixed(1)
    : 'NR';

  // Determine rating tier color
  const numericRating = parseFloat(rating);
  let ratingClass = 'rating-low';
  if (!isNaN(numericRating)) {
    if (numericRating >= 7.5) ratingClass = 'rating-high';
    else if (numericRating >= 6.0) ratingClass = 'rating-mid';
  }

  // Handle fallback poster
  const posterSrc = imageError || !movie.poster_path
    ? '/placeholder-poster.svg'
    : getPosterUrl(movie.poster_path, 'w500');

  const handleHeartClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(movie);
  };

  const handleCardClick = () => {
    if (onSelectMovie) {
      onSelectMovie(movie);
    }
  };

  return (
    <div
      className="movie-card group cursor-pointer"
      onClick={handleCardClick}
      role="article"
      aria-label={`${movie.title} (${releaseYear})`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Poster Image Container */}
      <div className="poster-container">
        {/* Heart Favorite Action Button */}
        <button
          type="button"
          onClick={handleHeartClick}
          className={`heart-btn ${isFavorite ? 'active' : ''}`}
          aria-label={isFavorite ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={18} />
        </button>

        {/* Shimmer Placeholder while loading */}
        {!imageLoaded && !imageError && (
          <div className="skeleton-box" style={{ position: 'absolute', inset: 0 }} />
        )}

        {/* Media Image with Native Lazy Loading */}
        <img
          src={posterSrc}
          alt={`Poster for ${movie.title}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          className={`poster-image ${imageLoaded ? 'loaded' : ''}`}
        />

        {/* Quick View Hover Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '1rem 0.75rem',
            background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)',
            opacity: 0,
            transition: 'opacity 200ms ease',
            pointerEvents: 'none',
          }}
          className="group-hover:opacity-100 hidden sm:block"
        >
          <p style={{ fontSize: '0.75rem', color: '#dedede', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {movie.overview || 'Click to view full plot and production details.'}
          </p>
        </div>
      </div>

      {/* Card Metadata */}
      <div className="card-content">
        <h3 className="card-title" title={movie.title}>
          {movie.title}
        </h3>

        <div className="card-footer">
          <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {releaseYear}
          </span>

          <div className={`rating-badge ${ratingClass}`}>
            <Star size={12} fill="currentColor" />
            <span>{rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;
