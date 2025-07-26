# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start Vite development server at http://localhost:5173
- `npm run build` - Build for production (outputs to `build/` directory)
- `npm run preview` - Preview production build
- `npm run test` - Run all tests once
- `npm run test:unit` - Run tests in watch mode
- `npm run check` - Type check with svelte-check
- `npm run lint` - Check code style with Prettier and ESLint
- `npm run format` - Format code with Prettier

## Architecture

This is a SvelteKit application using Svelte 5 and OpenLayers for interactive mapping functionality. The core architecture consists of:

### State Management
- Global state managed through `src/lib/global-data.svelte.ts` using Svelte 5's `$state` runes
- Shared `Point[]` array accessible across components via the `globals` object

### Key Components
- `Map.svelte` - OpenLayers integration with OSM tiles, vector layers for markers, and optional grid overlay
- `PointList.svelte` - Sidebar component for coordinate input/display with format switching (decimal/DMS)
- `ErrorMessage.svelte` - Shared error display component

### Core Libraries
- `coordinates.ts` - Coordinate validation and formatting utilities (decimal degrees ↔ DMS conversion)
- `grid-layer-control.ts` - Custom OpenLayers control for toggling grid overlay
- `types.ts` - TypeScript definitions for Point, LatLon, and CoordinateFormat

### Data Flow
1. User clicks map → creates marker → adds to global points array
2. User enters coordinates in sidebar → validates → adds to both local and global state
3. Both actions trigger reactive updates across Map and PointList components

### Coordinate Handling
- Supports decimal degrees and degrees-minutes-seconds (DMS) input/display
- Latitude/longitude swapping functionality for correcting reversed coordinates
- Clipboard integration for bulk coordinate paste operations
- Cardinal direction display (N/S/E/W) as optional format

### Testing
- Uses Vitest for unit testing with browser testing support via `@vitest/browser`
- Component tests use `vitest-browser-svelte` for Svelte 5 compatibility
- Test files follow `*.test.ts` and `*.spec.ts` patterns

## Development Process

- Please keep the task list updated in the @docs\TASKS.md file as we work.