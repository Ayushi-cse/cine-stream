import React, { useState } from 'react';
import { Activity, ChevronDown, ChevronUp, Trash2, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import useNetworkActivity from '../hooks/useNetworkActivity';

/**
 * NetworkInspector Component
 * 
 * Floating telemetry HUD for verifying and recording QA demonstrations:
 * - Proves that keystrokes do NOT fire HTTP requests until 500ms debounce expires.
 * - Proves that Infinite Scroll triggers on-demand pagination fetches automatically.
 */
export function NetworkInspector() {
  const [isOpen, setIsOpen] = useState(false);
  const { logs, clearLogs } = useNetworkActivity(12);

  return (
    <aside className="network-inspector" aria-label="Network Activity Telemetry">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.45rem 0.85rem',
            backgroundColor: '#1C1C1C',
            border: '1.5px solid rgba(229, 9, 20, 0.4)',
            borderRadius: 'var(--radius-full)',
            color: '#FFFFFF',
            fontSize: '0.75rem',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8)',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#262626';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1C1C1C';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Activity size={14} style={{ color: '#E50914' }} />
          <span>Network Inspector</span>
          <span
            style={{
              backgroundColor: 'var(--brand-primary)',
              color: '#fff',
              borderRadius: '9999px',
              padding: '1px 6px',
              fontSize: '0.7rem',
              fontWeight: 700,
            }}
          >
            {logs.length}
          </span>
        </button>
      )}

      {/* Expanded Telemetry Drawer */}
      {isOpen && (
        <div
          style={{
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: '440px',
            backgroundColor: '#161616',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--border-medium)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '0.65rem 0.9rem',
              backgroundColor: '#1F1F1F',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={15} style={{ color: '#E50914' }} />
              <strong style={{ fontSize: '0.8rem', color: '#fff', letterSpacing: '0.02em' }}>
                QA Network Telemetry
              </strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={clearLogs}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                }}
                title="Clear entries"
              >
                <Trash2 size={13} />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                }}
                title="Collapse"
              >
                <ChevronDown size={16} />
              </button>
            </div>
          </div>

          {/* Log Stream */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
            }}
          >
            {logs.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                No HTTP activity recorded yet. Type in search or scroll to trigger fetches.
              </div>
            ) : (
              logs.map((log) => {
                const isPending = log.status === 'PENDING';
                const isOk = typeof log.status === 'number' && log.status >= 200 && log.status < 300;

                return (
                  <div
                    key={log.id}
                    style={{
                      padding: '0.45rem 0.6rem',
                      backgroundColor: '#1E1E1E',
                      borderRadius: '4px',
                      borderLeft: `3px solid ${
                        isPending ? '#FFA500' : isOk ? '#46D369' : '#E50914'
                      }`,
                      fontSize: '0.725rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{log.label}</span>
                      <span
                        style={{
                          fontSize: '0.675rem',
                          color: isPending ? '#FFA500' : isOk ? '#46D369' : '#E50914',
                          fontWeight: 700,
                        }}
                      >
                        {isPending ? 'PENDING' : `${log.status} (${log.duration}ms)`}
                      </span>
                    </div>

                    <div
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.675rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={log.url}
                    >
                      {log.method} {log.url.split('.org/3')[1] || log.url.split('omdbapi.com')[1] || log.url}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Legend */}
          <div
            style={{
              padding: '0.4rem 0.75rem',
              backgroundColor: '#141414',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.675rem',
              color: 'var(--text-muted)',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>500ms Debounce Shield</span>
            <span>DOM IntersectionObserver</span>
          </div>
        </div>
      )}
    </aside>
  );
}

export default NetworkInspector;
