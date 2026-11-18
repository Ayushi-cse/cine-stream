import React, { useEffect } from 'react';
import { X, Heart, Star, Calendar, Film, ExternalLink } from 'lucide-react';
import { getBackdropUrl, getPosterUrl } from '../services/tmdbService';

/**
 * MovieModal Component
 * 
 * Accessible dialog component presenting comprehensive movie metadata,
 * backdrop visuals, and favorites toggling.
 */
export function MovieModal({ movie, onClose, isFavorite, onToggleFavorite }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  if (!movie) return null;

  const backdropSrc = getBackdropUrl(movie.backdrop_path, 'w1280');
  const posterSrc = getPosterUrl(movie.poster_path, 'w500');

  const releaseYear = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';
  const rating = typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : 'NR';

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="movie-dialog-title"
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ overflow: 'hidden' }}
      >
        {/* Backdrop Visual Container */}
        <div style={{ position: 'relative', width: '100%', height: '320px', backgroundColor: '#111' }}>
          {backdropSrc ? (
            <img
              src={backdropSrc}
              alt={movie.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <img
              src={posterSrc}
              alt={movie.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(10px) brightness(0.4)' }}
            />
          )}

          {/* Gradients */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, var(--bg-surface) 0%, rgba(24,24,24,0.4) 60%, rgba(0,0,0,0.7) 100%)',
            }}
          />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(20, 20, 20, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              transition: 'background 150ms ease',
            }}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>

          {/* Modal Header Overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '24px',
              right: '24px',
              zIndex: 5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  color: 'var(--rating-high)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                <Star size={14} fill="currentColor" />
                {rating} / 10
              </span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{releaseYear}</span>
            </div>

            <h2
              id="movie-dialog-title"
              style={{
                fontSize: '1.85rem',
                fontWeight: 700,
                color: '#fff',
                lineHeight: 1.2,
                textShadow: '0 2px 8px rgba(0,0,0,0.8)',
              }}
            >
              {movie.title}
            </h2>
          </div>
        </div>

        {/* Modal Body Details */}
        <div style={{ padding: '1.75rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn ${isFavorite ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => onToggleFavorite(movie)}
              style={{
                padding: '0.6rem 1.25rem',
                backgroundColor: isFavorite ? 'var(--brand-primary)' : undefined,
              }}
            >
              <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
              <span>{isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}</span>
            </button>

            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              TMDB Reference ID: #{movie.id}
            </span>
          </div>

          {/* Plot Synopsis */}
          <div>
            <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Storyline Overview
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.65 }}>
              {movie.overview || 'No extended overview is available for this title.'}
            </p>
          </div>

          {/* Metadata Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Release Date</span>
              <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{movie.release_date || 'N/A'}</strong>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Audience Score</span>
              <strong style={{ fontSize: '0.9rem', color: 'var(--rating-high)' }}>{rating} / 10</strong>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Total Votes</span>
              <strong style={{ fontSize: '0.9rem', color: '#fff' }}>
                {movie.vote_count ? movie.vote_count.toLocaleString() : 'N/A'}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieModal;
