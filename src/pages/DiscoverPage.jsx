import React, { useState, useEffect, useCallback, useRef } from 'react';
import HeroBanner from '../components/HeroBanner';
import SearchBar from '../components/SearchBar';
import MovieGrid from '../components/MovieGrid';
import { useDebounce } from '../hooks/useDebounce';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useSettings } from '../context/SettingsContext';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * DiscoverPage Component
 * 
 * Central media discovery view fulfilling Phase 1, 2, and 3 deliverables:
 * - Popular movies fetch and CSS Grid layout
 * - 500ms debounced search component
 * - IntersectionObserver infinite scroll appending Page N+1
 * - AI Mood Matcher integration and spotlight handoff
 */
export function DiscoverPage({
  isFavorite,
  onToggleFavorite,
  onSelectMovie,
  onOpenMoodMatcher,
  onOpenSettings,
  aiMatchedMovie,
  onClearAiMatch,
}) {
  const { activeService, settings } = useSettings();

  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Search input state
  const [searchInput, setSearchInput] = useState('');
  // 500ms debounce hook
  const { debouncedValue: debouncedQuery, isDebouncing } = useDebounce(searchInput, 500);

  // Top featured spotlight item
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [isAiCurated, setIsAiCurated] = useState(false);

  /**
   * Primary fetcher for Popular or Search payloads.
   * Handles deduplication and pagination state hydration.
   */
  const loadMovies = useCallback(
    async (pageToLoad = 1, append = false, query = '') => {
      if (append) {
        setIsFetchingNextPage(true);
      } else {
        setIsLoading(true);
        setErrorMessage(null);
      }

      try {
        let payload;
        if (query && query.trim()) {
          payload = await activeService.searchMovies(query, pageToLoad);
        } else {
          payload = await activeService.getPopular(pageToLoad);
        }

        const newResults = payload.results || [];
        const reportedTotalPages = payload.total_pages || 1;

        setTotalPages(reportedTotalPages);
        setPage(pageToLoad);

        setMovies((prev) => {
          if (!append) return newResults;

          // Merge & deduplicate by ID to prevent duplicate React keys
          const existingIds = new Set(prev.map((m) => String(m.id)));
          const uniqueIncoming = newResults.filter((m) => !existingIds.has(String(m.id)));
          return [...prev, ...uniqueIncoming];
        });

        // Set top movie as featured banner if loading fresh popular list
        if (!append && pageToLoad === 1 && newResults.length > 0 && !query) {
          setFeaturedMovie(newResults[0]);
          setIsAiCurated(false);
        }
      } catch (err) {
        console.error('[DiscoverPage] Data fetch failed:', err);
        setErrorMessage(err.message || 'Unable to load media payload.');
      } finally {
        setIsLoading(false);
        setIsFetchingNextPage(false);
      }
    },
    [activeService]
  );

  // Listen to debounced search query changes
  useEffect(() => {
    // Whenever debounced query updates, reset pagination and fetch page 1
    loadMovies(1, false, debouncedQuery);
  }, [debouncedQuery, loadMovies]);

  // Handle external AI Mood Match handoff
  useEffect(() => {
    if (aiMatchedMovie) {
      setFeaturedMovie(aiMatchedMovie);
      setIsAiCurated(true);
      setSearchInput(aiMatchedMovie.title);
    }
  }, [aiMatchedMovie]);

  /**
   * Infinite Scroll Trigger:
   * Called by IntersectionObserver sentinel when user scrolls to bottom of grid.
   */
  const handleLoadNextPage = useCallback(() => {
    if (!isLoading && !isFetchingNextPage && page < totalPages) {
      loadMovies(page + 1, true, debouncedQuery);
    }
  }, [isLoading, isFetchingNextPage, page, totalPages, loadMovies, debouncedQuery]);

  // Hook up native IntersectionObserver
  const { sentinelRef } = useInfiniteScroll({
    onIntersect: handleLoadNextPage,
    isLoading: isLoading || isFetchingNextPage,
    hasMore: page < totalPages,
    rootMargin: '300px',
  });

  return (
    <div className="main-content">
      <div className="app-container">
        {/* API Key Notice Banner if user hasn't added TMDB key yet */}
        {!settings.tmdbApiKey && settings.provider === 'tmdb' && (
          <div
            style={{
              marginBottom: '1.75rem',
              padding: '0.85rem 1.25rem',
              backgroundColor: 'rgba(229, 9, 20, 0.1)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(229, 9, 20, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              color: '#FFFFFF',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sparkles size={16} style={{ color: 'var(--brand-primary)' }} />
              <span>
                Running in <strong>Smart Hybrid Mode</strong> with high-fidelity curated movies. Add your free TMDB API key to query the full 1,000,000+ title catalog.
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenSettings}
              className="btn btn-primary btn-sm"
            >
              Add TMDB Key
            </button>
          </div>
        )}

        {/* Hero Spotlight Banner */}
        {featuredMovie && !debouncedQuery && (
          <HeroBanner
            featuredMovie={featuredMovie}
            isFavorite={isFavorite(featuredMovie.id)}
            onToggleFavorite={onToggleFavorite}
            onSelectMovie={onSelectMovie}
            onOpenMoodMatcher={onOpenMoodMatcher}
            isAiCurated={isAiCurated}
          />
        )}

        {/* Debounced Search Component */}
        <section style={{ marginBottom: '2rem' }}>
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            onClear={() => setSearchInput('')}
            isDebouncing={isDebouncing}
            isSearching={isLoading && Boolean(debouncedQuery)}
            onOpenMoodMatcher={onOpenMoodMatcher}
          />
        </section>

        {/* Discovery Grid Header & Count */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>
              {debouncedQuery
                ? `Search Results for "${debouncedQuery}"`
                : isAiCurated
                ? 'AI Spotlight Discovery'
                : 'Popular & Trending Releases'}
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              {debouncedQuery
                ? `Showing matching titles from ${settings.provider.toUpperCase()} API`
                : 'Dynamic on-demand grid hydrated via native IntersectionObserver'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => loadMovies(1, false, debouncedQuery)}
              className="btn btn-ghost btn-sm"
              title="Refresh payload"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Error Notification if Request Blocked */}
        {errorMessage && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#ff6b6b',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.875rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* High-Fidelity CSS Grid with Infinite Scroll Sentinel */}
        <MovieGrid
          movies={movies}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onSelectMovie={onSelectMovie}
          sentinelRef={sentinelRef}
          hasMore={page < totalPages}
          searchQuery={debouncedQuery}
        />
      </div>
    </div>
  );
}

export default DiscoverPage;
