# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` (runs on port 8080)
- **Build for production**: `npm run build`
- **Build for development**: `npm run build:dev`
- **Lint code**: `npm run lint`
- **Preview production build**: `npm run preview`

## Architecture Overview

This is a React TypeScript application built with Vite that displays a gallery of SVG images of capybaras dancing frevo - a benchmark for evaluating large language models. The app fetches SVG files from GitHub repositories and displays them in a responsive gallery.

### Key Technologies
- **Vite**: Build tool and development server
- **React 18**: UI framework with hooks
- **TypeScript**: Type safety
- **shadcn/ui**: UI component library built on Radix UI
- **Tailwind CSS**: Styling framework
- **React Router**: Client-side routing
- **TanStack Query**: Data fetching and caching
- **React Helmet Async**: Meta tag management

### Project Structure
- `src/pages/`: Route components (Index, NotFound)
- `src/components/ui/`: shadcn/ui components
- `src/components/gallery/`: Gallery-specific components
- `src/lib/`: Utilities (mainly `utils.ts` for class merging)
- `src/hooks/`: Custom React hooks
- `public/assets/`: Static SVG files

### Core Functionality
The main feature is `GithubSvgGallery` component that:
- Accepts URL parameters: `repo` (owner/repo), `path` (folder path), `branch` (optional)
- Fetches SVG files from GitHub API
- Displays them in a responsive grid with hover effects
- Default repository: `filipecalegario/capivara-benchmark`
- Default path: `public/assets`

### Styling System
- Uses Tailwind CSS with custom HSL color variables
- Follows shadcn/ui design patterns
- Responsive design with mobile-first approach
- Dark/light theme support via `next-themes`

### State Management
- TanStack Query for server state and caching
- URL parameters for application state
- No global state management library needed

### Path Aliases
- `@/` maps to `src/` directory for cleaner imports

## Key Files to Understand
- `src/pages/Index.tsx`: Main page with gallery component and URL parameter handling
- `src/components/gallery/GithubSvgGallery.tsx`: Core gallery logic and GitHub API integration
- `src/App.tsx`: Application setup with providers and routing
- `vite.config.ts`: Build configuration with path aliases