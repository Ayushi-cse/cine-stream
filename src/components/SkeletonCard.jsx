import React from 'react';

/**
 * SkeletonCard Component
 * 
 * Renders shimmering placeholder cards during initial page loads
 * and bottom infinite scroll page hydration, maintaining exact aspect ratios
 * to prevent layout jumping (Cumulative Layout Shift).
 */
export function SkeletonCard() {
  return (
    <div className="movie-card" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="poster-container">
        <div className="skeleton-box" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="card-content">
        <div className="skeleton-box" style={{ width: '85%', height: '18px', marginBottom: '8px' }} />
        <div className="skeleton-box" style={{ width: '55%', height: '14px', marginBottom: '12px' }} />
        <div className="card-footer" style={{ marginTop: 'auto' }}>
          <div className="skeleton-box" style={{ width: '40px', height: '16px' }} />
          <div className="skeleton-box" style={{ width: '45px', height: '20px', borderRadius: '4px' }} />
        </div>
      </div>
    </div>
  );
}

export default SkeletonCard;
