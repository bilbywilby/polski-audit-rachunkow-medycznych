# BillGuard

[![Deploy to Cloudflare]([![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/bilbywilby/polski-audit-rachunkow-medycznych))](https://deploy.workers.cloudflare.com/)

A modern full-stack web application built on Cloudflare Workers and Pages. Features a responsive React frontend with Tailwind CSS and shadcn/ui components, powered by a Hono-based API backend running on Workers. Includes state management, theming, error reporting, and seamless deployment to Cloudflare's global edge network.

## Features

- **Full-Stack Architecture**: React + Vite frontend with Hono API on Cloudflare Workers
- **Modern UI**: shadcn/ui components, Tailwind CSS with custom gradients and animations
- **Data Management**: TanStack Query for caching, mutations, and optimistic updates
- **Theming**: Dark/light mode with automatic system preference detection
- **Sidebar Layout**: Collapsible responsive sidebar with search and navigation
- **Error Handling**: Global error boundaries and client-side error reporting to API
- **Developer Experience**: Hot reload, TypeScript, ESLint, and Bun scripts
- **Edge Deployment**: Zero-config deployment to Cloudflare with SPA routing and CORS
- **Performance**: Optimized for edge computing with Workers KV/Durable Objects ready

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, Lucide icons, Framer Motion
- **State & Data**: TanStack Query, Zustand, React Hook Form, Zod validation
- **Backend**: Hono (routing), Cloudflare Workers
- **UI Components**: Radix UI primitives, Headless UI, DND Kit
- **Utilities**: Sonner (toasts), Date-fns, Recharts, Immer
- **Dev Tools**: Bun, ESLint, Wrangler, Cloudflare Vite plugin

## Quick Start

1. **Clone the repository**:
   ```
   git clone <your-repo-url>
   cd billguard-pa-zlslkeekk1e2vx01xewu9
   ```

2. **Install dependencies** (using Bun):
   ```
   bun install
   ```

3. **Run in development**:
   ```
   bun dev
   ```
   - Frontend: http://localhost:3000 (or `$PORT`)
   - API: http://localhost:3000/api/*

4. **Type generation** (for Workers env):
   ```
   bun cf-typegen
   ```

## Development

- **Scripts**:
  | Command | Description |
  |---------|-------------|
  | `bun dev` | Start dev server with hot reload |
  | `bun build` | Build for production |
  | `bun lint` | Run ESLint |
  | `bun preview` | Preview production build locally |
  | `bun deploy` | Build and deploy to Cloudflare |

- **Folder Structure**:
  ```
  src/          # React app source
  worker/       # Hono API routes (edit userRoutes.ts)
  shared/       # Shared types/utils (if needed)
  ```

- **API Development**: Add routes in `worker/userRoutes.ts`. Core middleware (CORS, logging, error handling) is pre-configured in `worker/index.ts`.

- **Frontend Routing**: Uses React Router. Edit `src/main.tsx`.

- **Custom Styling**: Extend Tailwind in `tailwind.config.js` and `src/index.css`.

- **Environment**: Uses `import.meta.env.DEV` for dev/prod splits.

## Deployment

Deploy to Cloudflare Workers/Pages with one command:

```
bun deploy
```

This builds the frontend assets and deploys the Worker. Your app will be live at `https://<your-worker>.<subdomain>.workers.dev`.

For custom domains or advanced config, edit `wrangler.jsonc`.

[![Deploy to Cloudflare]([![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/bilbywilby/polski-audit-rachunkow-medycznych))](https://deploy.workers.cloudflare.com/)

**Post-Deploy**:
- Assets served via Cloudflare Pages integration
- API routes: `/api/*`
- SPA fallback for client-side routing

## Adding Routes

**Frontend**: Update `src/main.tsx` router.

**Backend** (`worker/userRoutes.ts`):
```ts
import { Hono } from "hono";
import { Env } from './core-utils';

export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/example', (c) => c.json({ message: 'Hello from Worker!' }));
}
```

## Customization

- **Remove Demo Sidebar**: Delete `src/components/app-sidebar.tsx` and don't use `AppLayout`.
- **shadcn/ui**: Run `bunx shadcn-ui@latest add <component>` to add new components.
- **Workers Bindings**: Extend `Env` in `worker/core-utils.ts` for KV, DO, R2, etc.

## License

MIT License. See [LICENSE](LICENSE) for details.