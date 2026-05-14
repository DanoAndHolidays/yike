# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**一刻短剧 (Yike)** - A TikTok-like short drama SPA built with Vue 3. Features vertical swipe video playback, drama following mode, likes/collections with local persistence. Backend API is provided by Apifox (external service, may be unavailable).

## Tech Stack

- **Framework**: Vue 3 (Composition API) + Vite 7
- **State Management**: Pinia 3 with persistedstate plugin
- **UI Components**: Element Plus 2
- **Video Player**: Video.js 8 (loaded via CDN, not bundled)
- **Styling**: SCSS with custom variables
- **Build**: Vite with manual chunk splitting for vendor libs

## Common Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (http://localhost:5173)
pnpm build            # Production build to dist/
pnpm build:analyze    # Build with bundle analyzer
pnpm preview          # Preview production build
pnpm test             # Run Vitest tests
pnpm lint             # ESLint with auto-fix
pnpm format           # Prettier format
```

## Architecture

### Dual-Framework Entry Points

The project has two separate frontend apps:
1. **Vue app** (`/`) - Main short drama player app
2. **React app** (`/src-react/`) - Secondary React app (has its own index.html at `src-react/index.html`)

Both are built via Vite's multi-entry configuration (`rollupOptions.input`).

### Video Playback System

The core video system is in `src/views/Home/`:
- `Video.vue` - Container managing vertical scroll/swipe between videos
- `PlayBar.vue` - Individual video player component using Video.js
- `utils/handleVideo.js` - Video queue manager (maintains 5-video queue)

**Video Queue Strategy**: Maintains 5 videos in memory. When user swipes, the queue shifts and loads new videos. Videos are fetched sequentially (see optimization opportunities below).

**Two Play Modes**:
- Random mode (`/`) - Random drama feed
- Follow-drama mode (`/play/:vid/:eid`) - Sequential episodes of a specific drama

### Pinia Stores (`src/stores/`)

| Store | Purpose |
|-------|---------|
| `useDramaStore.js` | Likes, collections, watch records. Uses `DramaManager` class |
| `useDramaInfo.js` | Drama metadata cache |
| `user.js` | User login state, mute settings |
| `app.js` | App-level state (isReady, etc.) |

**DramaManager** (`dramaManager.js`) handles serialization of `Set`/`Map` for localStorage persistence since Pinia's persistedstate plugin cannot serialize these natively.

### API Layer (`src/apis/`)

- `play.js` - Video URLs, random drama list, episode list
- `category.js` - Category data
- `login.js` - Authentication
- `file.js` - File upload

### Routing (`src/router/index.js`)

Lazy-loaded routes with `beforeEach` guard for login check on `/mine`.

## Key Patterns

### Video Player Initialization
Video.js is loaded via CDN (`index.html`). Initialize in `onMounted`:
```javascript
if (typeof window.videojs === 'undefined') {
    console.error('video.js not loaded')
    return
}
player = window.videojs(videoRef.value, options, callback)
```

### SCSS Variables
All SCSS files auto-import `var.scss` variables via Vite's `additionalData` config. Available variables include colors (`$primary-color`, `$text-color-1`, etc.), sizes (`$tab-bar-height`), and the TikTok-style background color.

### Element Plus Auto-Import
Components and icons are auto-imported via `unplugin-vue-components`. No manual import needed.

## Known Optimization Opportunities

1. **Video URL Loading** (`handleVideo.js:52-66`) - Uses `while` loop with `await` inside, loading videos sequentially. Should use `Promise.all` for parallel loading.

2. **Video Player Memory Leak** (`PlayBar.vue`) - `onBeforeUnmount` does not call `player.dispose()`. Players accumulate when swiping through videos.

3. **Scroll Performance** (`Video.vue`) - Uses `scrollTo` with `scrollTop` which triggers reflow. Should use `transform: translateY()` for GPU acceleration.

4. **Static Video List** - The "friend" avatar list in `PlayBar.vue:72-101` is hardcoded mock data.

## File Naming Conventions

- Vue components: PascalCase (e.g., `PlayBar.vue`, `NavBar.vue`)
- Composables/stores: camelCase with `use` prefix (e.g., `useDramaStore.js`)
- Utils: camelCase (e.g., `handleVideo.js`, `message.ts`)
- SCSS partials: underscore prefix but in `styles/` folder auto-imported

## SCSS Structure

```
src/styles/
├── var.scss     # Variables (colors, sizes) - auto-imported
├── main.scss    # Global styles
└── play.scss    # Video player styles
```

## Build Output

Production build goes to `dist/`. Base path is `/yike/` (GitHub Pages deployment). Vendor chunks are split: `element-components`, `element-utils`, `element-core`, `vue-chunks`, `vue-ecosystem`, `lodash-utils`, `axios-http`, `video-player`, `video-utils`, `vendor-other`.

## Backend (Optional)

`server/` contains an Express backend. To run locally:
```bash
cd server && pnpm install && pnpm dev
```

The frontend can work standalone without the backend (uses Apifox API).
