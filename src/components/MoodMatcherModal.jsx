import React, { useState } from 'react';
import { X, Sparkles, ArrowRight, Loader2, Film, Check, AlertCircle } from 'lucide-react';
import geminiService from '../services/geminiService';
import MovieCard from './MovieCard';

const PRESET_MOODS = [
  'I am feeling sad but want an action movie',
  'Cyberpunk thriller with dark rain aesthetic',
  'Feel-good nostalgic comedy from the 90s',
  'Mind-bending space sci-fi with philosophical questions',
  'High-stakes psychological mystery with plot twists',
  'Wholesome and heartwarming family animated night',
];

/**
 * MoodMatcherModal Component
 * 
 * Satisfies Sprint Phase 3:
 * Executes the LLM contextual prompt -> Movie Title string -> TMDB Search handoff.
 */
export function MoodMatcherModal({
  isOpen,
  onClose,
  onApplyMovieSearch,
  isFavorite,
  onToggleFavorite,
  onSelectMovie,
}) {
  const [moodInput, setMoodInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [llmResult, setLlmResult] = useState(null);
  const [matchedMovie, setMatchedMovie] = useState(null);

  if (!isOpen) return null;

  const handleMatch = async (moodToUse) => {
    const targetMood = moodToUse || moodInput;
    if (!targetMood || !targetMood.trim()) {
      setError('Please describe your current mood or desired cinema vibe.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLlmResult(null);
    setMatchedMovie(null);

    try {
      // Step 1: Prompt Gemini LLM for a single movie title based on mood
      const aiResponse = await geminiService.matchMoodToMovie(targetMood);
      setLlmResult(aiResponse);

      // Step 2: Handoff LLM title to TMDB search function
      if (onApplyMovieSearch) {
        const movie = await onApplyMovieSearch(aiResponse.title, true);
        if (movie) {
          setMatchedMovie(movie);
        }
      }
    } catch (err) {
      console.error('[Mood Matcher] Processing failed:', err);
      setError(err.message || 'Failed to match mood. Please verify network or API keys.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (preset) => {
    setMoodInput(preset);
    handleMatch(preset);
  };

  const handleApplyToGrid = () => {
    if (llmResult?.title && onApplyMovieSearch) {
      onApplyMovieSearch(llmResult.title, false);
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mood-matcher-title"
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', padding: '2rem 1.75rem' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #E50914, #B80710)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(229, 9, 20, 0.4)',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h2 id="mood-matcher-title" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff' }}>
                AI "Mood Matcher" Explorer
              </h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                Phase 3 LLM Prompt Engineering & Silent TMDB Search Handoff
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
            <X size={20} />
          </button>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleMatch();
          }}
          style={{ marginBottom: '1.5rem' }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              value={moodInput}
              onChange={(e) => {
                setMoodInput(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. I am feeling sad but want an action movie..."
              style={{
                width: '100%',
                padding: '0.85rem 3.5rem 0.85rem 1.15rem',
                backgroundColor: '#1E1E1E',
                border: '1.5px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: '#FFFFFF',
                fontSize: '0.95rem',
                outline: 'none',
              }}
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading || !moodInput.trim()}
              className="btn btn-primary"
              style={{
                position: 'absolute',
                right: '6px',
                padding: '0.5rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
              }}
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <ArrowRight size={16} />
              )}
            </button>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ff6b6b', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* Preset Quick Chips */}
        <div style={{ marginBottom: '1.75rem' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
            Or pick an instant mood prompt:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {PRESET_MOODS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                disabled={isLoading}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-secondary)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(229, 9, 20, 0.2)';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.borderColor = 'rgba(229, 9, 20, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                }}
              >
                "{preset}"
              </button>
            ))}
          </div>
        </div>

        {/* Handoff Pipeline Result */}
        {isLoading && (
          <div
            style={{
              padding: '2.5rem 1rem',
              textAlign: 'center',
              backgroundColor: 'rgba(20, 20, 20, 0.5)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-subtle)',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid rgba(229, 9, 20, 0.2)',
                borderTopColor: 'var(--brand-primary)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 1rem',
              }}
            />
            <p style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>
              Querying LLM & Sanitizing Recommendation...
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Handoff: Prompt → Movie Title → TMDB Search /search/movie
            </p>
          </div>
        )}

        {llmResult && !isLoading && (
          <div
            style={{
              backgroundColor: '#191919',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid rgba(229, 9, 20, 0.4)',
              padding: '1.25rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            }}
          >
            {/* Handoff Trace Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '0.85rem',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '1rem',
                fontSize: '0.75rem',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>LLM Engine: </span>
                <strong style={{ color: 'var(--brand-primary)' }}>{llmResult.source}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Sanitized Output: </span>
                <strong style={{ color: '#fff' }}>"{llmResult.title}"</strong>
              </div>
            </div>

            {/* Matched Movie Preview */}
            {matchedMovie ? (
              <div>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  <div style={{ width: '90px', flexShrink: 0 }}>
                    <MovieCard
                      movie={matchedMovie}
                      isFavorite={isFavorite ? isFavorite(matchedMovie.id) : false}
                      onToggleFavorite={onToggleFavorite}
                      onSelectMovie={onSelectMovie}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                        TMDB Payload Resolved
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        Rating: {matchedMovie.vote_average ? matchedMovie.vote_average.toFixed(1) : 'NR'}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.4rem' }}>
                      {matchedMovie.title}
                    </h3>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {matchedMovie.overview}
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onSelectMovie(matchedMovie)}
                  >
                    View Details
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleApplyToGrid}
                  >
                    <Check size={14} />
                    <span>Apply to Discovery Grid</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  LLM suggested <strong>"{llmResult.title}"</strong>. Click below to view related results on the main grid.
                </p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '0.75rem' }}
                  onClick={handleApplyToGrid}
                >
                  Search on Main Grid
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MoodMatcherModal;
