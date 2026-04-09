# CLAUDE.md — Repository Guide for AI Assistants

## Overview

This repository contains two distinct projects:

1. **Static CV website** (root level) — A vanilla HTML/CSS/JS portfolio for Charles Bertrand, a Wealth Management Advisor (Conseiller en Gestion de Patrimoine) based in Lyon. Hosted at https://charlo69-brt.github.io/charlesbertrand/
2. **PatriSim** (`simulator/`) — A Next.js 14 wealth management simulation application for financial advisors, running entirely client-side with no backend.

---

## Repository Structure

```
charlesbertrand/
├── CLAUDE.md                   # This file
├── README.md                   # Portfolio project overview (French)
├── index.html                  # Static CV website
├── index.html.pdf              # PDF export of CV
├── IMG_0542.png                # Profile photo
└── simulator/                  # Next.js app (PatriSim)
    ├── src/
    │   ├── app/                # Next.js App Router pages
    │   │   ├── layout.tsx
    │   │   ├── page.tsx        # Dashboard
    │   │   ├── clients/        # Client management routes
    │   │   │   ├── page.tsx
    │   │   │   ├── nouveau/    # Create client
    │   │   │   └── [id]/       # Client-specific modules
    │   │   │       ├── bilan/
    │   │   │       ├── fiscalite/
    │   │   │       ├── investissements/
    │   │   │       ├── retraite/
    │   │   │       └── succession/
    │   │   └── parametres/     # Settings / export-import
    │   ├── components/
    │   │   ├── layout/         # Shell, Sidebar, Header, ClientSubNav
    │   │   ├── ui/             # Reusable primitives (Button, Card, Input…)
    │   │   ├── bilan/          # Wealth statement forms & dashboard
    │   │   ├── charts/         # Recharts visualizations
    │   │   ├── fiscalite/      # Tax simulators (IR, IFI, RCM comparator)
    │   │   ├── investissements/ # Investment calculators (AV, PER, SCPI…)
    │   │   ├── retraite/       # Retirement planning
    │   │   ├── succession/     # Estate planning & démembrement
    │   │   └── clients/        # Client-specific UI components
    │   ├── hooks/              # Custom React hooks
    │   ├── lib/
    │   │   ├── types.ts        # All TypeScript interfaces
    │   │   ├── constants.ts    # French tax rates & brackets (LdF 2026)
    │   │   ├── utils.ts        # Formatting, age calculation, label helpers
    │   │   ├── storage.ts      # localStorage abstraction + export/import
    │   │   └── calculs/        # Pure financial calculation modules
    └── package.json
```

---

## Tech Stack (PatriSim)

| Layer | Technology |
|---|---|
| Framework | Next.js 14.2.35 (App Router) |
| UI library | React 18 |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 3.4 |
| Charts | Recharts 3.8 |
| Persistence | Browser `localStorage` only — no backend |
| Linting | ESLint with `next/core-web-vitals` + `next/typescript` |

---

## Development Workflow

All commands run from the `simulator/` directory:

```bash
cd simulator

npm run dev      # Dev server at http://localhost:3000
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # Run ESLint
```

Node.js 18+ required (LTS recommended for Next.js 14 compatibility).

There are **no tests** configured — no Jest, Vitest, or testing library is installed.

---

## Code Conventions

### File & Folder Naming
- **Components:** `PascalCase.tsx` — e.g., `BilanDashboard.tsx`, `ClientCard.tsx`
- **Hooks:** `use[Name].ts` — e.g., `useClients.ts`, `useAutoSave.ts`
- **Utilities/libs:** `camelCase.ts` — e.g., `utils.ts`, `storage.ts`
- **Calculation modules:** `kebab-case.ts` — e.g., `impot-revenu.ts`, `assurance-vie.ts`

### TypeScript
- Strict mode is enabled; avoid `any`
- All domain types live in `lib/types.ts` — add new interfaces there
- Props interfaces use a `Props` suffix: `ButtonProps`, `CardProps`
- Constants use `UPPER_SNAKE_CASE`: `BAREME_IR_2026`, `PASS_2026`
- Import path alias `@/*` maps to `src/*` — use it for all cross-directory imports

### React Patterns
- All interactive components carry `'use client'` at the top
- Server-side layout files use the Next.js metadata API
- Use `useCallback` for functions passed as props or used in effect dependencies
- State management is via React hooks + `localStorage` (no Redux/Zustand)

### Styling
- Tailwind utility classes only — avoid custom CSS except for cases not handled by Tailwind (currently only in `globals.css`)
- Color palette: blue primary `#1E3A8A` / light blue `#EEF2FF` / green accent `#22C55E`
- Responsive design is mobile-first; use `lg:` prefix for desktop-specific rules

### Comments
- Self-documenting code is preferred — avoid unnecessary comments
- Use section headers in constant files: `// ============ SECTION NAME ============`

---

## Domain Knowledge

PatriSim implements **French wealth management (CGP)** calculations. Key concepts:

### Tax Modules in `lib/calculs/`
| Module | What it calculates |
|---|---|
| `impot-revenu.ts` | Income tax (IR) with quotient familial |
| `quotient-familial.ts` | Tax shares by marital status & dependants |
| `ifi.ts` | IFI (real estate wealth tax, threshold €800k) |
| `prelevements-sociaux.ts` | Social contributions on capital income |
| `assurance-vie.ts` | Life insurance projections & taxation |
| `per.ts` | PER retirement savings deduction |
| `scpi.ts` | Real estate fund (SCPI) dividend tax |
| `pinel.ts` | Pinel housing tax credit (6/9/12 yr) |
| `deficit-foncier.ts` | Rental deficit deduction (max €10,700/yr) |
| `retraite.ts` | Pension estimate with partial/full rate |
| `succession.ts` | Inheritance tax with per-beneficiary brackets |
| `demembrement.ts` | Naked ownership valuation (Article 669 CGI) |
| `comparateur-rcm.ts` | PFU (31.4%) vs standard IR comparison |

### Tax Year
All constants in `lib/constants.ts` are updated to **Loi de Finances 2026 & LFSS 2026**. Key values:
- Income tax brackets: 0% / 11% / 30% / 41% / 45%
- IFI threshold: €800,000
- PASS 2026: €48,060
- Retirement age: 64, requiring 172 quarters for full rate

When updating tax constants, always reference the official LdF (Loi de Finances) year and update the file-level comment.

---

## Data Persistence

- All data is stored in the browser's `localStorage` under the key `'cgp-simulator-data'`
- **No data is ever sent to a server** — this is a local-only tool
- `lib/storage.ts` exposes `loadData()`, `saveData()`, `exportData()`, `importData()`
- The settings page (`/parametres`) allows JSON export/import for backup/migration
- A migration framework exists in `storage.ts` for future schema version upgrades — use it when changing the data structure

---

## UI Component Patterns

Reusable primitives are in `components/ui/`. Before building a new component, check if one of these covers the need:

| Component | Use case |
|---|---|
| `Button` | Variants: `primary`, `secondary`, `danger`, `ghost` |
| `Card` | Container with optional header and action slot |
| `Input` | Labelled text input wrapper |
| `NumberInput` | Currency/number input with formatting |
| `Select` | Dropdown select |
| `Modal` | Dialog with overlay |
| `Tabs` | Tab navigation container |
| `Badge` | Status labels |
| `EmptyState` | Empty list / zero-data state |

---

## Adding a New Module

1. **Calculation logic** → add a new file in `lib/calculs/[module-name].ts`
2. **Types** → extend `lib/types.ts` with relevant interfaces
3. **Constants** → add any fixed values to `lib/constants.ts` with LdF year annotation
4. **Component** → create `components/[module]/[ModuleName]Simulator.tsx`
5. **Route** → add a page under `src/app/clients/[id]/[module]/page.tsx`
6. **Navigation** → add the route to `components/layout/ClientSubNav.tsx`

---

## Static CV Website (root)

The `index.html` file is a standalone, self-contained portfolio. It uses:
- Vanilla HTML, CSS, and JavaScript (no build step)
- Animated effects: golden particles background, typewriter headline, 3D card tilt, scroll counters, skill bars
- Published to GitHub Pages (`main` branch)

To edit the CV, modify `index.html` directly — no compilation or bundling needed.

---

## Git Conventions

- Commit messages follow the **Conventional Commits** format: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`
- Feature branches: `claude/[description]-[hash]` for AI-generated branches
- Main branch: `main` (GitHub Pages deployment source)
- Development branches are rebased or merged into `main` directly

---

## Privacy & Security Notes

- No authentication system — local-only tool
- No API keys or secrets required at runtime
- `.gitignore` excludes `.env*.local` (future-proofing)
- Client financial data is sensitive: do not add analytics, logging, or any external API calls that could expose data
