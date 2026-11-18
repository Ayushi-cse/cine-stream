/**
 * Google Gemini AI "Mood Matcher" Service
 * 
 * Satisfies Sprint Phase 3:
 * "A user submits a contextual string (e.g., 'I am feeling sad but want an action movie').
 * Pass this string as a prompt to the Google Gemini API, instructing it to return a single Movie Title string.
 * Capture the LLM's response, silently pass it into your TMDB search function, and render the resulting media object."
 */

import apiClient from './apiClient';

// Smart contextual mood heuristic fallback when no LLM API key is provided
const FALLBACK_MOOD_MAP = [
  { match: /sad.*action|action.*sad|revenge/i, title: 'John Wick' },
  { match: /nostalg.*90s|90s/i, title: 'The Matrix' },
  { match: /feel.*good|wholesome|heartwarming|happy/i, title: 'Paddington 2' },
  { match: /cry|sad|emotional|tearjerker/i, title: 'The Shawshank Redemption' },
  { match: /cyberpunk|neon|dystop/i, title: 'Blade Runner 2049' },
  { match: /mind.*fuck|twist|trippy|complex|existential/i, title: 'Inception' },
  { match: /space|cosmos|sci-fi|universe/i, title: 'Interstellar' },
  { match: /laugh|comedy|funny|hilarious/i, title: 'The Grand Budapest Hotel' },
  { match: /thrill|suspense|tense|anxious/i, title: 'Parasite' },
  { match: /intense|music|drum|ambition/i, title: 'Whiplash' },
  { match: /romance|love|heartbreak/i, title: 'La La Land' },
  { match: /superhero|comic|multiverse/i, title: 'Spider-Man: Across the Spider-Verse' },
  { match: /desert|sand|epic|war/i, title: 'Dune: Part Two' },
  { match: /alien|contact|first contact/i, title: 'Arrival' },
];

/**
 * Sanitizes LLM string output into a clean search query.
 * Removes wrapping quotes, markdown asterisks, numeric bullets, and trailing punctuation.
 */
export function sanitizeMovieTitle(raw) {
  if (!raw) return '';
  return raw
    .trim()
    .replace(/^["'`]|["'`]$/g, '')     // Strip enclosing quotation marks
    .replace(/\*\*(.*?)\*\*/g, '$1')   // Strip markdown bold
    .replace(/^\d+[\.\)]\s*/, '')      // Strip numbered prefixes like "1. "
    .replace(/^(Movie Title|Title|Recommendation):\s*/i, '') // Strip meta prefixes
    .replace(/[.;:!?]+$/, '')          // Strip trailing punctuation
    .trim();
}

export class GeminiService {
  constructor(apiKey = '') {
    this.apiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  hasValidKey() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 15);
  }

  /**
   * Prompts Gemini 1.5 Flash to recommend exactly ONE movie title based on user's mood.
   */
  async matchMoodToMovie(userMood) {
    if (!userMood || !userMood.trim()) {
      throw new Error('Please describe your mood or viewing vibe.');
    }

    const cleanMood = userMood.trim();

    // If no Gemini key is active, utilize the smart contextual heuristic fallback
    if (!this.hasValidKey()) {
      await new Promise((r) => setTimeout(r, 600)); // Simulate realistic network roundtrip
      
      const matched = FALLBACK_MOOD_MAP.find((entry) => entry.match.test(cleanMood));
      if (matched) {
        return {
          title: matched.title,
          isAiGenerated: false,
          source: 'Curated Heuristic Engine (Add Gemini API key in Settings for live LLM)',
        };
      }

      // Default high-sentiment title
      return {
        title: 'Everything Everywhere All at Once',
        isAiGenerated: false,
        source: 'Curated Heuristic Engine (Add Gemini API key in Settings for live LLM)',
      };
    }

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
      
      const prompt = `Suggest ONE movie based on this mood: "${cleanMood}". Return ONLY the movie title as a plaintext string. Do not include quotes, markdown formatting, explanations, or punctuation.`;

      const payload = {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 30,
        }
      };

      const response = await apiClient.post(endpoint, payload, {
        label: 'Gemini AI Mood Matcher',
      });

      const candidate = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidate) {
        throw new Error('Gemini API returned an empty completion.');
      }

      const sanitized = sanitizeMovieTitle(candidate);

      return {
        title: sanitized,
        isAiGenerated: true,
        source: 'Google Gemini 1.5 Flash',
      };
    } catch (error) {
      console.warn('[Gemini Service] API call failed, falling back to heuristic:', error.message);
      
      // Graceful fallback to heuristic
      const matched = FALLBACK_MOOD_MAP.find((entry) => entry.match.test(cleanMood));
      return {
        title: matched ? matched.title : 'Interstellar',
        isAiGenerated: false,
        source: 'Fallback Heuristic (API Error: ' + error.message + ')',
      };
    }
  }
}

export const geminiService = new GeminiService();
export default geminiService;
