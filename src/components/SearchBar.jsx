import React from 'react';
import { Search, X, Clock, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

/**
 * SearchBar Component
 * 
 * Provides debounced search input interface with visual feedback indicators.
 * Demonstrates 500ms debouncing window in real-time.
 */
export function SearchBar({
  value = '',
  onChange,
  onClear,
  isDebouncing = false,
  isSearching = false,
  onOpenMoodMatcher,
}) {
  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClear();
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto 2rem' }}>
      {/* Input Outer Container */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#1E1E1E',
          borderRadius: 'var(--radius-full)',
          border: '1.5px solid var(--border-subtle)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          transition: 'all var(--transition-fast)',
          padding: '0.4rem 0.6rem 0.4rem 1.25rem',
        }}
      >
        {/* Search Icon or Loading Spinner */}
        <div style={{ display: 'flex', alignItems: 'center', color: isSearching ? 'var(--brand-primary)' : 'var(--text-muted)', marginRight: '0.75rem' }}>
          {isSearching ? (
            <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <Search size={20} />
          )}
        </div>

        {/* Search Input Field */}
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Search movies, franchises, or directors..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#FFFFFF',
            fontSize: '1rem',
            padding: '0.5rem 0',
          }}
          aria-label="Search movies"
        />

        {/* Clear Button */}
        {value && (
          <button
            type="button"
            onClick={onClear}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              marginRight: '0.5rem',
              transition: 'color var(--transition-fast)',
            }}
            title="Clear search (Esc)"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}

        {/* AI Mood Matcher Shortcut Trigger */}
        <button
          type="button"
          onClick={onOpenMoodMatcher}
          className="btn btn-secondary"
          style={{
            borderRadius: 'var(--radius-full)',
            padding: '0.5rem 0.95rem',
            fontSize: '0.825rem',
            gap: '0.4rem',
            border: '1px solid rgba(229, 9, 20, 0.3)',
            background: 'linear-gradient(135deg, rgba(229,9,20,0.15), rgba(40,40,40,0.7))',
          }}
          title="Try AI Mood Matcher"
        >
          <Sparkles size={14} style={{ color: '#E50914' }} />
          <span className="hidden sm:inline">AI Mood</span>
        </button>
      </div>

      {/* Debounce Telemetry Badge & Quick Suggestion Chips */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '0.75rem',
          padding: '0 0.5rem',
          fontSize: '0.775rem',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        {/* Debounce Status Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {isDebouncing ? (
            <span className="debounce-indicator">
              <Clock size={12} />
              <span>Debounce Active (Waiting 500ms pause...)</span>
            </span>
          ) : value ? (
            <span className="debounce-indicator synced">
              <CheckCircle2 size={12} />
              <span>Request Dispatched</span>
            </span>
          ) : (
            <span>Type to search (500ms throttled)</span>
          )}
        </div>

        {/* Quick Suggestion Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--text-dim)' }}>Try:</span>
          {['Dune', 'Batman', 'Interstellar', 'Avengers'].map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => onChange(sample)}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-secondary)',
                padding: '0.15rem 0.55rem',
                fontSize: '0.725rem',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(229, 9, 20, 0.2)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {sample}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SearchBar;
