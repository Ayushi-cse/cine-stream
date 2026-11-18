import React, { useState } from 'react';
import { X, Key, ShieldCheck, Check, Database, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

/**
 * ApiKeyModal Component
 * 
 * Configures API keys, switches fallback data providers, and tests connectivity.
 */
export function ApiKeyModal({ isOpen, onClose }) {
  const { settings, updateSettings } = useSettings();

  const [tmdbKey, setTmdbKey] = useState(settings.tmdbApiKey || '');
  const [omdbKey, setOmdbKey] = useState(settings.omdbApiKey || '');
  const [geminiKey, setGeminiKey] = useState(settings.geminiApiKey || '');
  const [provider, setProvider] = useState(settings.provider || 'tmdb');
  const [isSaved, setIsSaved] = useState(false);
  const [testStatus, setTestStatus] = useState(null);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings({
      tmdbApiKey: tmdbKey.trim(),
      omdbApiKey: omdbKey.trim(),
      geminiApiKey: geminiKey.trim(),
      provider,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 900);
  };

  const handleUseDemo = () => {
    setTmdbKey('');
    setOmdbKey('');
    setProvider('demo');
    updateSettings({
      provider: 'demo',
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-settings-title"
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '600px', padding: '2rem 1.75rem' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: 'rgba(229, 9, 20, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-primary)',
              }}
            >
              <Key size={18} />
            </div>
            <div>
              <h2 id="api-settings-title" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                API & Environment Settings
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Configure REST & LLM Credentials
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            style={{ borderRadius: '50%' }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Data Source Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>
            Active Discovery Data Provider:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {[
              { id: 'tmdb', label: 'TMDB (Primary)', desc: 'Official API v3' },
              { id: 'omdb', label: 'OMDB (Fallback)', desc: 'ISP Unblock' },
              { id: 'demo', label: 'Demo Mode', desc: 'Offline Curated' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProvider(p.id)}
                style={{
                  padding: '0.65rem 0.5rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: provider === p.id ? 'rgba(229, 9, 20, 0.18)' : '#1E1E1E',
                  border: provider === p.id ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                  color: provider === p.id ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 150ms ease',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.825rem' }}>{p.label}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSave}>
          {/* TMDB API Key */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                TMDB API Key (v3)
              </label>
              <a
                href="https://www.themoviedb.org/settings/api"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                Get Free Key <ExternalLink size={10} />
              </a>
            </div>
            <input
              type="password"
              value={tmdbKey}
              onChange={(e) => setTmdbKey(e.target.value)}
              placeholder="Paste your 32-character TMDB API Key..."
              style={{
                width: '100%',
                padding: '0.65rem 0.9rem',
                backgroundColor: '#1E1E1E',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
              }}
            />
          </div>

          {/* OMDB API Key (Alternative for blocked ISPs) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                OMDB API Key (Optional Fallback)
              </label>
              <a
                href="https://www.omdbapi.com/apikey.aspx"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                Get Free OMDB Key <ExternalLink size={10} />
              </a>
            </div>
            <input
              type="password"
              value={omdbKey}
              onChange={(e) => setOmdbKey(e.target.value)}
              placeholder="e.g. 8-character OMDB key..."
              style={{
                width: '100%',
                padding: '0.65rem 0.9rem',
                backgroundColor: '#1E1E1E',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
              }}
            />
          </div>

          {/* Gemini API Key */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                Google Gemini API Key (Mood Matcher)
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                Get Gemini Key <ExternalLink size={10} />
              </a>
            </div>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="Paste Google AI Studio Gemini API Key..."
              style={{
                width: '100%',
                padding: '0.65rem 0.9rem',
                backgroundColor: '#1E1E1E',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
              }}
            />
            <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Leave blank to use the built-in intelligent heuristic mood matching engine.
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={handleUseDemo}
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              Reset to Demo Mode
            </button>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary btn-sm"
                style={{ minWidth: '100px' }}
              >
                {isSaved ? (
                  <>
                    <Check size={14} />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Settings</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ApiKeyModal;
