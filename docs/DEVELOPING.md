# The development workflow

This document provides instructions for setting up the development environment, running tests, and building the application for production.

## Prerequisites

- Node.js (version 18 or higher is recommended)
- npm (usually comes with Node.js)

While you can install Node.js and npm directly, it is highly recommended to use a version manager. A version manager makes it easy to install and switch between different Node.js versions on your system and helps avoid potential permission issues.

- **For macOS, Linux, or WSL:** Use [nvm (Node Version Manager)](https://github.com/nvm-sh/nvm).
- **For Windows:** Use [nvm-for-windows](https://github.com/coreybutler/nvm-windows).

After installing a version manager, you can install the recommended Node.js version by running a command like `nvm install --lts`.

## Installation

To get started, clone the repository and install the project dependencies:

```bash
git clone <repository-url>
cd geotools
npm install
```

## Running the Development Server

To start the Vite development server with hot-reloading:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` by default.

## Testing

This project uses Vitest for comprehensive unit and component testing with **183 total tests** achieving **98.5% coverage**.

### Test Structure
- **Unit Tests (Server)**: Core logic testing without browser dependencies
  - `src/lib/coordinates.test.ts` - Original coordinate validation (80 tests)
  - `src/lib/coordinates.polar.test.ts` - Polar region handling (11 tests)
  - `src/lib/enhanced-coordinates.test.ts` - Enhanced parsing system (69 tests)
  - `src/index.test.ts` - Basic module tests (3 tests)
  - `src/demo.spec.ts` - Demo functionality (1 test)

- **Component Tests (Browser)**: UI component testing in Chromium environment
  - `src/components/PointList.simple.svelte.test.ts` - PointList component (13 tests)
  - `src/components/Map.svelte.test.ts` - Map component (4 tests)
  - `src/routes/page.svelte.test.ts` - Main page integration (2 tests)

### Running Tests

To run tests in watch mode:
```bash
npm run test:unit
```

To run all tests once:
```bash
npm test
```

To run only server-side tests:
```bash
npm run test:unit -- --reporter=verbose src/lib/
```

To run only component tests:
```bash
npm run test:unit -- --reporter=verbose src/components/
```

### Test Coverage Areas
- **Enhanced Coordinate Parsing**: Universal format support, intelligent pairing strategies
- **Precision Mathematics**: Exact rational number storage and conversion
- **Validation Logic**: Range checking, cardinal direction handling, error cases
- **UI Components**: Interactive elements, state management, user interactions
- **Integration**: End-to-end coordinate input workflows

## Code Quality & Type Checking

This project uses TypeScript with strict type checking and Svelte component validation.

To run type checking:
```bash
npm run check
```

To run linting:
```bash
npm run lint
```

To format code:
```bash
npm run format
```

## Building for Production

To create a production-ready build of the application:

```bash
npm run build
```

The output will be in the `.svelte-kit/output/` directory. This static output can be served by any web server.

To preview the production build locally:
```bash
npm run preview
```

### Build Verification
The production build process includes:
- TypeScript compilation with strict type checking
- Svelte component compilation and optimization
- Asset bundling and optimization
- CSS processing and minification
- Automatic code splitting for optimal loading

### Deployment Notes
The application is built as a static site and can be deployed to:
- Static hosting services (Netlify, Vercel, GitHub Pages)
- CDN platforms
- Traditional web servers
- Container platforms

No server-side runtime is required.
