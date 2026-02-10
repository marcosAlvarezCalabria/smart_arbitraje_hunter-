# smart-arbitrage-app

Monorepo MVP for analyzing Amazon ES ASIN opportunities using Keepa data.

## Stack
- Backend: Node.js + TypeScript + Fastify
- Frontend: React + Vite + TypeScript + Tailwind
- Architecture: Hexagonal (domain/application/infra)
- Testing: Vitest for domain and mapping logic

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create backend env file:
   ```bash
   cp backend/.env.example backend/.env
   ```
3. Add your `KEEPA_API_KEY` in `backend/.env`.

## Run in development
Open two terminals from repo root:

Terminal 1:
```bash
npm run dev:backend
```

Terminal 2:
```bash
npm run dev:frontend
```

Backend runs on `http://localhost:3001`, frontend on `http://localhost:5173`.

## Scripts
- `npm run dev:backend`
- `npm run dev:frontend`
- `npm run build`
- `npm run test`

## API
### Health
```bash
curl http://localhost:3001/health
```

### Opportunities
```bash
curl -X POST http://localhost:3001/opportunities \
  -H 'Content-Type: application/json' \
  -d '{
    "asins": ["B07PGL2N7J", "B0B1Q2W3E4"],
    "marketplace": "ES",
    "options": {
      "historyDays": 90,
      "forceUpdateHours": 12
    }
  }'
```

The response contains sorted opportunities and warnings when partial failures occur.
