import React, { createContext, useContext, useState, useEffect } from 'react';
import tmdbService from '../services/tmdbService';
import omdbService from '../services/omdbService';
import geminiService from '../services/geminiService';

const SETTINGS_STORAGE_KEY = 'cinestream_user_settings';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }
    return {
      provider: 'tmdb', // 'tmdb' | 'omdb' | 'demo'
      tmdbApiKey: import.meta.env.VITE_TMDB_API_KEY || '',
      omdbApiKey: import.meta.env.VITE_OMDB_API_KEY || '',
      geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
      enableNetworkInspector: true,
    };
  });

  // Sync settings with singleton service instances
  useEffect(() => {
    tmdbService.setApiKey(settings.tmdbApiKey);
    omdbService.setApiKey(settings.omdbApiKey);
    geminiService.setApiKey(settings.geminiApiKey);

    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (err) {
      console.error('Failed to persist settings:', err);
    }
  }, [settings]);

  const updateSettings = (partial) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const getActiveMediaService = () => {
    if (settings.provider === 'omdb') {
      return omdbService;
    }
    // TMDB service automatically handles falling back to mockData when no key or blocked
    return tmdbService;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        activeService: getActiveMediaService(),
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

export default SettingsContext;
