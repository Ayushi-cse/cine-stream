import React, { useState, useEffect } from 'react';
import { Film, Heart, Sparkles, Settings, Search, Menu, X, ShieldAlert } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

/**
 * Navbar Component
 * 
 * Sticky Netflix-styled top navigation bar.
 * Provides instant routing between Discovery grid and Favorites view,
 * modal triggers, and live provider status badges.
 */
export function Navbar({
  activeTab,
  onTabChange,
  favoritesCount = 0,
  onOpenMoodMatcher,
  onOpenSettings,
}) {
  const { settings } = useSettings();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        height: 'var(--navbar-height)',
        backgroundColor: isScrolled ? 'rgba(20, 20, 20, 0.95)' : 'rgba(20, 20, 20, 0.75)',
        backdropFilter: 'blur(12px)',
        borderBottom: isScrolled ? '1px solid var(--border-subtle)' : '1px solid transparent',
        transition: 'all 200ms ease',
      }}
    >
      <div
        className="app-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
        }}
      >
        {/* Brand Logo & Main Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <button
            type="button"
            onClick={() => onTabChange('discover')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
            aria-label="Cine-Stream Home"
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'var(--brand-primary)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(229, 9, 20, 0.4)',
              }}
            >
              <Film size={18} color="#fff" />
            </div>
            <span
              className="font-brand"
              style={{
                fontSize: '1.75rem',
                color: 'var(--brand-primary)',
                letterSpacing: '0.04em',
                lineHeight: 1,
              }}
            >
              CINE-STREAM
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex" style={{ alignItems: 'center', gap: '1.25rem' }}>
            <button
              type="button"
              onClick={() => onTabChange('discover')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'discover' ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: activeTab === 'discover' ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'color var(--transition-fast)',
                borderBottom: activeTab === 'discover' ? '2px solid var(--brand-primary)' : '2px solid transparent',
                padding: '0.4rem 0',
              }}
            >
              Discover
            </button>

            <button
              type="button"
              onClick={() => onTabChange('favorites')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'none',
                border: 'none',
                color: activeTab === 'favorites' ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: activeTab === 'favorites' ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'color var(--transition-fast)',
                borderBottom: activeTab === 'favorites' ? '2px solid var(--brand-primary)' : '2px solid transparent',
                padding: '0.4rem 0',
              }}
            >
              <span>My Favorites</span>
              {favoritesCount > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--brand-primary)',
                    color: '#fff',
                    borderRadius: 'var(--radius-full)',
                    padding: '1px 6px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}
                >
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenMoodMatcher}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'color var(--transition-fast)',
                padding: '0.4rem 0',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <Sparkles size={14} style={{ color: '#E50914' }} />
              <span>AI Mood Matcher</span>
            </button>
          </nav>
        </div>

        {/* Right Action Icons & Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Active Data Provider Pill */}
          <div
            onClick={onOpenSettings}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '0.725rem',
              color: 'var(--text-secondary)',
            }}
            title="Click to configure API credentials"
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: settings.provider === 'tmdb' ? '#46D369' : '#FFA500',
              }}
            />
            <span className="hidden sm:inline font-mono">
              {settings.provider.toUpperCase()}
            </span>
          </div>

          {/* Settings Trigger */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="btn btn-ghost btn-icon"
            style={{ borderRadius: '50%' }}
            aria-label="Settings"
            title="API Key Settings"
          >
            <Settings size={18} />
          </button>

          {/* Mobile Navigation Hamburger */}
          <button
            type="button"
            className="md:hidden btn btn-ghost btn-icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden"
          style={{
            backgroundColor: '#181818',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '1rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <button
            type="button"
            onClick={() => {
              onTabChange('discover');
              setIsMobileMenuOpen(false);
            }}
            style={{
              textAlign: 'left',
              padding: '0.5rem 0',
              color: activeTab === 'discover' ? 'var(--brand-primary)' : '#fff',
              fontWeight: 600,
            }}
          >
            Discover Movies
          </button>

          <button
            type="button"
            onClick={() => {
              onTabChange('favorites');
              setIsMobileMenuOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0',
              color: activeTab === 'favorites' ? 'var(--brand-primary)' : '#fff',
              fontWeight: 600,
            }}
          >
            <span>My Favorites</span>
            {favoritesCount > 0 && (
              <span className="badge badge-primary">{favoritesCount}</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenMoodMatcher();
              setIsMobileMenuOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0',
              color: '#fff',
              fontWeight: 600,
            }}
          >
            <Sparkles size={16} style={{ color: '#E50914' }} />
            <span>AI Mood Matcher</span>
          </button>
        </div>
      )}
    </header>
  );
}

export default Navbar;
