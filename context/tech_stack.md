# Tech Stack — HealthCentria

Binding for all development. Do not introduce other runtimes, languages, or databases without updating this file.

## Runtime / Language
- Runtime: Node.js (LTS)
- Language: JavaScript 

## Backend (`apps/server`)
- Framework: Express `^4.21.2`
- ODM: Mongoose `^8.9.0`
- Validation: Zod `^3.23.8`
- Middleware in use: cors, helmet, morgan, dotenv
- Entry: `apps/server/src/index.ts` -> `app.ts`
- Scripts: `dev` (tsx watch), `build` (tsc), `start` (node dist/index.js)

## Database
- MongoDB Atlas (cloud)
- Access via Mongoose only, no native driver directly
- Connection string via `.env` (`apps/server/.env`, see `.env.example`)

## Frontend (`apps/web`)
- Not specified by user yet — currently: React `^18.3.1` + Vite `^6.0.3` + TanStack Router `^1.95.1`
- Confirm if this stays or should change to plain JS/Express views.

## Constraints
1. Backend stays Node.js + Express only.
2. Database stays MongoDB Atlas onlydonx
3. No Python, PHP, MySQL/Postgres, or other ORM unless this file is updated.
4. All new backend deps must work with Node.js + ESM (`"type": "module"`).
