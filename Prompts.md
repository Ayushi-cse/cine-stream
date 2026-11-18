# Cine-Stream AI Pair-Programming Log (`Prompts.md`)

> **Assignment Compliance**: This document fulfills the Sprint 08 *"Learn, Don't Copy" Mandate*. It records the AI pair-programming dialogues, architectural investigations, prompt engineering iterations, and debugging traces conducted during the construction of the Cine-Stream media explorer.

---

## Session 1: Debouncing vs. Throttling for REST Search Inputs

### Context & Engineering Goal
When building the search component consuming `/search/movie`, naive `onChange` event listeners dispatch an HTTP request for every character keystroke. For a 10-character query like `"Spider-Man"`, this floods the TMDB backend with 10 requests, risks HTTP 429 rate limits, and creates race conditions where earlier slow requests resolve after later faster requests.

### Engineering Prompt
> *"Explain the algorithmic and UX differences between Debouncing and Throttling for a media search input. Why is debouncing with a 500ms inactivity window preferred over throttling here, and how should cleanup be handled in a React custom hook to cancel dangling timers?"*

### Synthesis & Architectural Decision
- **Throttling**: Guarantees execution at regular intervals (e.g., once every 500ms). If a user types `"Spider-Man"` over 1.2 seconds, throttling would execute at 0ms, 500ms, and 1000ms (3 partial fetches).
- **Debouncing**: Postpones execution until a period of silence occurs. Each keystroke clears the previous timeout and restarts the 500ms countdown. When the user stops typing, exactly **one** targeted request is dispatched.
- **Implementation**: Created `useDebounce(value, 500)`. Inside `useEffect`, `clearTimeout(timerId)` is returned as cleanup. This guarantees that unmounting or subsequent keystrokes invalidate stale timers before state mutation occurs.

---

## Session 2: Infinite Scroll & DOM Memory Leak Mitigation

### Context & Engineering Goal
Standard pagination interrupts immersion, while naive infinite scroll causes DOM bloat and event-loop thrashing if driven by `window.addEventListener('scroll', ...)`.

### Engineering Prompt
> *"What causes memory leaks and performance degradation when users scroll through 5,000 items in a Single Page Application? Compare native IntersectionObserver with traditional window scroll listeners. How does attaching an observer to an invisible sentinel div at the bottom prevent layout thrashing?"*

### Synthesis & Architectural Decision
1. **Event Loop Overhead**: Traditional scroll listeners fire on every pixel scroll (60–120Hz), triggering synchronous layout recalibration (`offsetHeight`, `scrollTop`).
2. **IntersectionObserver**: Runs asynchronously off the main rendering thread. The browser notifies the observer only when the threshold or `rootMargin` boundary is crossed.
3. **Guard Clauses**: Added `isLoading || isFetchingNextPage` and `page >= totalPages` guards. Without these, rapid scrolling could fire duplicate requests for the same page.
4. **Key Stability**: Deduplicated items via a memoized `Map(movie.id -> movie)` in `MovieGrid.jsx` to prevent React key collision warnings when TMDB returns overlapping boundary items.

---

## Session 3: React 18 StrictMode Double-Mount Loop

### Context & Issue Encountered
In development mode, React 18 mounts components twice to verify side-effect idempotency. Initially, an unmemoized fetch trigger was causing duplicate page 1 requests in the console.

### Debugging Prompt
> *"In React 18, why does useEffect with an empty dependency array mount twice, and how can we design our data-fetching architecture to be strictly idempotent without relying on mutable window flags?"*

### Synthesis & Resolution
- Sprint FAQ #5 explicitly notes: `useEffect(() => { fetchMovies() }, [])`.
- We ensured that `loadMovies` is wrapped in `useCallback` and accepts explicit parameters (`pageToLoad`, `append`, `query`). Storing page and search query in cleanly separated state machines prevented volatile re-triggering.

---

## Session 4: Null Poster Asset Fallback Strategy

### Context & Technical Requirement
TMDB media payloads frequently return `"poster_path": null` for upcoming, indie, or localized entries (e.g., *Gladiator II* early records). If unhandled, this leads to broken `<img>` tags (`https://image.tmdb.org/t/p/w500/null`), causing the CSS grid to collapse and increasing Cumulative Layout Shift (CLS).

### Engineering Prompt
> *"Design a robust fallback mechanism for TMDB media objects missing poster assets. How can we combine fixed aspect-ratio containers, native lazy loading, and an SVG fallback asset to ensure zero layout shift?"*

### Synthesis & Resolution
- **Aspect Ratio**: Container styled with `aspect-ratio: 2 / 3` so space is reserved prior to image load.
- **Asset Fallback**: Created `public/placeholder-poster.svg` featuring a film reel icon and branded typography. In `getPosterUrl()`, null/empty paths immediately return this vector fallback.
- **Lazy Loading**: `loading="lazy"` and `decoding="async"` applied to all `<img>` nodes so offscreen images do not consume network bandwidth until approaching the viewport.

---

## Session 5: AI "Mood Matcher" Prompt Engineering & Silent Handoff

### Context & Requirement (Phase 3)
Users provide contextual sentiment (e.g., *"I am feeling sad but want an action movie"*). We need a Large Language Model (Google Gemini 1.5 Flash) to translate this into a clean movie title string, then silently query TMDB's `/search/movie` endpoint.

### Prompt Iteration 1 (Naive)
```
Suggest a movie for: "I am feeling sad but want an action movie"
```
*LLM Output*:
> "Sure! Based on your mood, I recommend **John Wick (2014)**. It's an intense action movie about a retired hitman seeking revenge after suffering a heartbreaking personal loss..."
*Problem*: Contains conversational filler, bold asterisks, year parenthesis, and synopsis. Passing this string to TMDB `/search/movie?query=Sure! Based on your mood...` returned 0 results.

### Prompt Iteration 2 (Targeted Plaintext Constraint)
```
Suggest ONE movie based on this mood: "${userMood}". Return ONLY the movie title as a plaintext string. Do not include quotes, markdown formatting, explanations, or punctuation.
```
*LLM Output*:
> `John Wick`

### Sanitization Pipeline (`sanitizeMovieTitle`)
Added client-side defensive regex cleanup in `geminiService.js`:
- Strips surrounding quotes (`"`, `'`)
- Strips markdown asterisks (`**`)
- Strips leading numbers (`1. `)
- Strips trailing punctuation (`.`, `!`)

The sanitized title is passed directly into `activeService.searchMovies(sanitizedTitle, 1)`, and the top matched TMDB record is spotlighted in the Hero banner and discovery grid.

---

## Session 6: Cross-Region ISP Resilience (India TMDB Block)

### Context & Requirement
The sprint brief authorized:
> *(NOTE: If TMDB is blocked by your ISP in India, you are authorized to use the OMDB API at omdbapi.com as an alternative)*

### Engineering Solution
1. Architected an abstraction layer (`SettingsContext` + `activeService`).
2. Implemented `omdbService.js` that normalizes OMDB payloads into the same unified movie schema.
3. Created `mockData.js` featuring 40+ curated top titles with valid CDN imagery so the app runs out-of-the-box with zero initial setup.
4. Added an on-screen **Settings Modal** where any evaluator can enter their TMDB or OMDB key, or toggle between providers with 1 click.

---

*Document finalized for Sprint 08 Cine-Stream repository submission.*
