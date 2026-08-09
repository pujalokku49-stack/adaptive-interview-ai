# Helix — Adaptive Interview Intelligence

YC-style enterprise AI interview platform UI (React + Vite + Tailwind + Framer Motion).

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router
- Framer Motion
- Lucide Icons
- Recharts

## Run

```bash
npm install
npm run dev
```

## Design language

**Helix** uses a teal signal + copper trust palette on deep slate — not OpenAI purple, not Vercel black-and-white. Typography: Outfit (display) + Source Sans 3 (body).

## Routes

| Path | Page |
|------|------|
| `/` | Landing |
| `/dashboard` | Mission Control |
| `/interview` | Interview Chamber |
| `/knowledge` | Knowledge Graph |
| `/curriculum` | 31-Day Curriculum |
| `/debrief` | Performance Debrief |
| `/dna` | Candidate DNA |
| `/settings` | Settings |
| `*` | 404 |

## API integration

Set `VITE_API_URL` and use `src/lib/api.ts` + `endpoints`. Pages currently consume `src/data/mock.ts` with shapes matching `src/types`.

### Shortcuts

- `⌘K` / `Ctrl+K` — Command palette
- `⌘D` / `Ctrl+D` — Toggle theme
- `⌘I` / `Ctrl+I` — Interview Chamber
