# Requisition

Full-stack requisition and inventory management project split into a Laravel API backend and a Next.js frontend. Use this README to get both parts running locally.

## Project structure
- `requisition-backend/` – Laravel 10 API, authentication via Sanctum, database migrations and queue-ready stack.
- `requisition-frontend/` – Next.js 14 client that consumes the backend API.

## Prerequisites
- PHP 8.1+, Composer, and a MySQL-compatible database
- Node.js 18+ with npm or Yarn
- Recommended: Redis for queues / caching if you enable those drivers

## Backend setup (`requisition-backend`)
1) Copy env file: `cp .env.example .env` and set `APP_URL`, database credentials, and any Pusher/Soketi details you use.
2) Install dependencies: `composer install`.
3) Generate app key: `php artisan key:generate`.
4) Run migrations (and seed if desired): `php artisan migrate`.
5) Start the API: `php artisan serve` (defaults to http://localhost:8000).

## Frontend setup (`requisition-frontend`)
1) Copy env file: `cp .env.example .env.local` and set `NEXT_PUBLIC_BACKEND_URL` to the backend URL (e.g., http://localhost:8000).
2) Install dependencies: `npm install` (or `yarn install`).
3) Start the dev server: `npm run dev` (defaults to http://localhost:3000).
4) For production, build and start: `npm run build` then `npm run start`.

## Development flow
- Start the backend API first, then the frontend so it can reach the configured `NEXT_PUBLIC_BACKEND_URL`.
- API docs and admin generators come from the Laravel stack (InfyOm, Swagger) included in the backend dependencies.
