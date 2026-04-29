# ChipVerse

A unified, futuristic VLSI / Semiconductor learning platform inspired by TryHackMe. Built with **React 19 + Vite 7 + TypeScript + Tailwind v4**, with 8 themed domain roadmaps, gamified XP / streak / rank tracking, an animated landing page, and a full login + register experience.

> No backend required. Progress is persisted to `localStorage`.

---

## Quick start (VS Code)

### 1. Prerequisites

- **Node.js 20 or newer** ([download](https://nodejs.org))
- **npm** (bundled with Node), or `pnpm` / `yarn` if you prefer
- **VS Code** with the recommended extensions:
  - ESLint
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets

### 2. Install dependencies

Open a terminal in this folder and run:

```bash
npm install
```

### 3. Start the dev server

```bash
npm run dev
```

Vite will open `http://localhost:5173/` in your browser automatically. Edit any file in `src/` and the page hot-reloads instantly.

### 4. Production build

```bash
npm run build      # outputs to ./dist
npm run preview    # serves ./dist locally on http://localhost:4173
```

---

## Hosting the production build

The built `dist/` folder is a fully-static site. Drop it on any static host:

| Host | One-liner |
|------|-----------|
| **Vercel** | `npx vercel --prod` from the project root |
| **Netlify** | drag-and-drop `dist/` at app.netlify.com/drop |
| **GitHub Pages** | push `dist/` to a `gh-pages` branch |
| **Nginx / Apache** | copy `dist/` into your web root |
| **Cloudflare Pages** | connect the repo, build = `npm run build`, output = `dist` |

> Because the app uses client-side routing, configure your host to fall back to `index.html` for unknown paths (Netlify: `_redirects` with `/* /index.html 200`; Vercel handles this automatically).

---

## Project layout

```
chipverse/
├── index.html             # Vite entry HTML
├── package.json           # dependencies + scripts
├── vite.config.ts         # dev server on :5173, alias @ -> ./src
├── tsconfig.json          # TypeScript config
├── public/                # static assets (favicon, opengraph image)
└── src/
    ├── main.tsx           # React 19 createRoot entry
    ├── index.css          # Tailwind v4 + Google Fonts + theme tokens
    ├── App.tsx            # wouter router + persistent <Navbar />
    ├── components/        # ParticleCanvas, CircuitBackground, RoadmapPage, etc.
    ├── pages/             # Landing, Domains, Dashboard, Login, paths/*
    └── lib/
        ├── themes.ts      # 8 domain palettes (RTL, Verification, PD, …)
        ├── data.ts        # ROADMAPS (8 × 12 levels) + DOMAIN_LIST
        ├── user.ts        # useUser() hook with localStorage persistence
        ├── ranks.ts       # rank ladder
        └── utils.ts       # cn() classname helper
```

## Routes

| Path | Page |
|------|------|
| `/` | Landing |
| `/domains` | Domain selector |
| `/dashboard` | XP / streak / continue learning |
| `/login` | Login + Register (futuristic auth UI) |
| `/path/rtl` … `/path/research` | The 8 domain roadmaps |

## Adding a new domain

1. Add an entry to `DOMAIN_THEMES` in `src/lib/themes.ts` (id, name, primary/secondary/glow, gradient, lucide icon).
2. Add a `ROADMAPS[id]` array in `src/lib/data.ts` (12 levels recommended).
3. Add the domain to `DOMAIN_LIST` in `src/lib/data.ts` (so it shows on `/domains`).
4. Create `src/pages/paths/<Name>Path.tsx` — a one-line wrapper:
   ```tsx
   import RoadmapPage from "@/components/RoadmapPage";
   export default function MyPath() { return <RoadmapPage domainId="my-id" />; }
   ```
5. Register the route in `src/App.tsx`.

## Tech stack

- **React 19** + **Vite 7** — fast dev server, hot reload
- **TypeScript** — strict typing across the codebase
- **Tailwind CSS v4** (via `@tailwindcss/vite`) — utility-first styling
- **wouter** — tiny client-side router
- **lucide-react** — icon set
- **framer-motion** — animations
- **localStorage** — user progress persistence (key: `chipverse:user:v1`)

## License

Personal / educational use.
