import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import DiscoverPage from './pages/DiscoverPage';
import FavoritesPage from './pages/FavoritesPage';
import MovieModal from './components/MovieModal';
import MoodMatcherModal from './components/MoodMatcherModal';
import ApiKeyModal from './components/ApiKeyModal';
import NetworkInspector from './components/NetworkInspector';
import { useFavorites } from './hooks/useFavorites';
import { useSettings } from './context/SettingsContext';

const appBasePath = import.meta.env.BASE_URL;
const isFavoritesPath = () =>
  window.location.pathname.endsWith('/favorites') || window.location.hash === '#/favorites';
const getTabUrl = (tab) => {
  if (appBasePath !== '/') {
    return tab === 'favorites' ? `${appBasePath}#/favorites` : appBasePath;
  }
  return tab === 'favorites' ? '/favorites' : '/';
};

/**
 * Cine-Stream Main Application Component
 * 
 * Central controller coordinating:
 * - SPA routing (/discover vs /favorites) with browser history synchronization
 * - LocalStorage state persistence for movie favorites
 * - Modal overlays (Metadata dialog, AI Mood Matcher, API Settings)
 * - Live QA telemetry inspector
 */
export function App() {
  const { activeService, settings } = useSettings();
  const { favorites, isFavorite, toggleFavorite, clearFavorites, favoritesCount } = useFavorites();

  // Navigation state: 'discover' | 'favorites'
  const [currentTab, setCurrentTab] = useState(() => {
    return isFavoritesPath() ? 'favorites' : 'discover';
  });

  // Modal states
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isMoodMatcherOpen, setIsMoodMatcherOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // AI Mood Match handoff item
  const [aiMatchedMovie, setAiMatchedMovie] = useState(null);

  // Synchronize browser history / URL with active tab
  useEffect(() => {
    const handlePopState = () => {
      setCurrentTab(isFavoritesPath() ? 'favorites' : 'discover');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTabChange = (newTab) => {
    setCurrentTab(newTab);
    window.history.pushState(null, '', getTabUrl(newTab));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Phase 3 Handoff Bridge:
   * Called by MoodMatcherModal when LLM suggests a title.
   * Performs silent lookup against active media service.
   */
  const handleApplyMovieSearch = useCallback(
    async (movieTitle, previewOnly = false) => {
      try {
        const payload = await activeService.searchMovies(movieTitle, 1);
        const topResult = payload.results?.[0];

        if (topResult) {
          if (!previewOnly) {
            setAiMatchedMovie(topResult);
            setCurrentTab('discover');
            window.history.pushState(null, '', getTabUrl('discover'));
          }
          return topResult;
        }
        return null;
      } catch (err) {
        console.error('Silent handoff search failed:', err);
        return null;
      }
    },
    [activeService]
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky Header Navigation */}
      <Navbar
        activeTab={currentTab}
        onTabChange={handleTabChange}
        favoritesCount={favoritesCount}
        onOpenMoodMatcher={() => setIsMoodMatcherOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main View Router */}
      <main style={{ flex: '1 0 auto' }}>
        {currentTab === 'discover' ? (
          <DiscoverPage
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            onSelectMovie={setSelectedMovie}
            onOpenMoodMatcher={() => setIsMoodMatcherOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            aiMatchedMovie={aiMatchedMovie}
            onClearAiMatch={() => setAiMatchedMovie(null)}
          />
        ) : (
          <FavoritesPage
            favorites={favorites}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            onSelectMovie={setSelectedMovie}
            onClearFavorites={clearFavorites}
            onNavigateDiscover={() => handleTabChange('discover')}
          />
        )}
      </main>

      {/* Detailed Movie Modal */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          isFavorite={isFavorite(selectedMovie.id)}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {/* AI Mood Matcher Dialog (Phase 3) */}
      <MoodMatcherModal
        isOpen={isMoodMatcherOpen}
        onClose={() => setIsMoodMatcherOpen(false)}
        onApplyMovieSearch={handleApplyMovieSearch}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        onSelectMovie={setSelectedMovie}
      />

      {/* API Key & Provider Settings Dialog */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* QA Demonstration Network Inspector HUD */}
      {settings.enableNetworkInspector && <NetworkInspector />}

      {/* Minimal Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '2.5rem 1.5rem',
          backgroundColor: '#0F0F0F',
          marginTop: 'auto',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
        }}
      >
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--brand-primary)', letterSpacing: '0.05em' }}>CINE-STREAM</span>
            <span>•</span>
            <span>Sprint 08 Residency Scope</span>
            <span>•</span>
            <span>TMDB REST API Explorer</span>
          </div>
          <p style={{ maxWidth: '600px', lineHeight: 1.5, color: 'var(--text-dim)', fontSize: '0.75rem' }}>
            Architected with native IntersectionObserver infinite hydration, 500ms input debouncing,
            localStorage favorites persistence, and Google Gemini LLM contextual mood routing.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
