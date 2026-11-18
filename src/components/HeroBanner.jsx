import React from 'react';
import { Play, Info, Heart, Star, Sparkles } from 'lucide-react';
import { getBackdropUrl } from '../services/tmdbService';

/**
 * HeroBanner Component
 * 
 * Featured cinematic spotlight hero module inspired by Netflix.
 * Employs gradient masking and high-contrast typography.
 */
export function HeroBanner({
  featuredMovie,
  isFavorite,
  onToggleFavorite,
  onSelectMovie,
  onOpenMoodMatcher,
  isAiCurated = false,
}) {
  if (!featuredMovie) return null;

  const backdropSrc = getBackdropUrl(featuredMovie.backdrop_path, 'original') ||
    getBackdropUrl(featuredMovie.poster_path, 'w1280');

  const releaseYear = featuredMovie.release_date
    ? featuredMovie.release_date.substring(0, 4)
    : '2024';

  const rating = typeof featuredMovie.vote_average === 'number'
    ? featuredMovie.vote_average.toFixed(1)
    : '8.4';

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '480px',
        maxHeight: '620px',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        marginBottom: '2.5rem',
        backgroundColor: '#121212',
        border: isAiCurated ? '1.5px solid rgba(229, 9, 20, 0.4)' : '1px solid var(--border-subtle)',
        boxShadow: isAiCurated
          ? '0 0 30px rgba(229, 9, 20, 0.25)'
          : '0 20px 40px rgba(0, 0, 0, 0.8)',
      }}
      aria-label={`Featured: ${featuredMovie.title}`}
    >
      {/* Background Backdrop Image */}
      {backdropSrc && (
        <img
          src={backdropSrc}
          alt={featuredMovie.title}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 20%',
            filter: 'brightness(0.65)',
          }}
        />
      )}

      {/* Cinematic Gradient Overlays */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(14,14,14,0.95) 0%, rgba(14,14,14,0.7) 45%, rgba(14,14,14,0.2) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '180px',
          background: 'linear-gradient(to top, #141414 0%, transparent 100%)',
        }}
      />

      {/* Hero Content Information */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          padding: '3rem 2.5rem',
          maxWidth: '680px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: '480px',
        }}
      >
        {/* Curated or Spotlight Badge */}
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {isAiCurated ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'rgba(229, 9, 20, 0.25)',
                color: '#FFFFFF',
                border: '1px solid var(--brand-primary)',
                padding: '0.3rem 0.8rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              <Sparkles size={13} style={{ color: '#E50914' }} />
              AI Mood Spotlight Pick
            </span>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'var(--text-secondary)',
                padding: '0.25rem 0.7rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              ★ Featured Premier
            </span>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              color: 'var(--rating-high)',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            <Star size={14} fill="currentColor" />
            <span>{rating} Score</span>
          </div>

          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>•</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{releaseYear}</span>
        </div>

        {/* Cinematic Title */}
        <h1
          className="font-brand"
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            lineHeight: 1.05,
            marginBottom: '1rem',
            textShadow: '0 4px 12px rgba(0,0,0,0.8)',
          }}
        >
          {featuredMovie.title}
        </h1>

        {/* Plot Synopsis */}
        <p
          style={{
            fontSize: '0.975rem',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            marginBottom: '1.75rem',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textShadow: '0 2px 6px rgba(0,0,0,0.8)',
          }}
        >
          {featuredMovie.overview}
        </p>

        {/* Action Button Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onSelectMovie(featuredMovie)}
            style={{ padding: '0.75rem 1.6rem', fontSize: '1rem' }}
          >
            <Info size={18} />
            <span>Explore Overview</span>
          </button>

          <button
            type="button"
            className={`btn ${isFavorite ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onToggleFavorite(featuredMovie)}
            style={{
              padding: '0.75rem 1.4rem',
              fontSize: '1rem',
              backgroundColor: isFavorite ? 'rgba(229, 9, 20, 0.85)' : undefined,
            }}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
            <span>{isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={onOpenMoodMatcher}
            style={{
              padding: '0.75rem 1rem',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Sparkles size={16} style={{ color: '#E50914' }} />
            <span>Match by Mood</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
