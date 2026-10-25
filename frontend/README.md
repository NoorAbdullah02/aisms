# AISMS Frontend

React 19 + Vite + TypeScript SPA.

## Stack

- **Routing:** React Router 7
- **Data fetching:** TanStack Query + Axios (auto access-token refresh on 401)
- **State:** Zustand (persisted auth session)
- **Styling:** TailwindCSS with a custom design token set (`tailwind.config.ts`)
- **3D / motion:** React Three Fiber + drei (landing page hero), GSAP + ScrollTrigger (scroll reveals), Framer Motion available for component-level motion
- **Charts:** Recharts
- **Forms:** react-hook-form

## Scripts

- `npm run dev` — start Vite dev server on `:5173`, proxying `/api` to `http://localhost:4000`
- `npm run build` — type-check then build to `dist/`
- `npm run preview` — preview the production build locally

## Structure

```
src/
├── components/
│   ├── layout/AppLayout.tsx    # sidebar shell for the authenticated app
│   ├── three/HeroScene.tsx     # Three.js knowledge-graph hero
│   └── ui/                     # PageHeader, StatCard, Table, Modal
├── lib/
│   ├── api.ts                  # Axios instance + refresh-token interceptor
│   └── types.ts                # shared API response types
├── pages/                      # one file per route
├── routes/ProtectedRoute.tsx   # auth + role guard
└── store/authStore.ts          # Zustand auth store
```

Run the backend first (`npm run dev:backend` from the repo root, or `npm run dev` at the root to run both), then `npm run dev` here — or just `npm run dev` from the repo root to run both together.
