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

This project uses Vitest for unit and component testing.

To run tests in watch mode:

```bash
npm run test:unit
```

To run all tests once:

```bash
npm test
```

## Building for Production

To create a production-ready build of the application:

```bash
npm run build
```

The output will be in the `build/` directory. This static output can be served by any web server.
