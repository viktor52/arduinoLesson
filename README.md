# ArduinoLearn — Arduino Learning Platform

A full-stack web application that teaches Arduino programming through curated coding assignments. Combines the interactive learning of Codecademy, the challenge format of LeetCode, and the coding workspace of Replit — focused entirely on Arduino.

![Dashboard Screenshot](./docs/screenshots/dashboard.png)
![Workspace Screenshot](./docs/screenshots/workspace.png)

## Features

- **User Authentication** — Register, login, logout, profile management with JWT
- **Assignment Catalog** — 100 pre-built assignments (10 per difficulty level, 1–10)
- **Coding Workspace** — Split-screen layout with Monaco Editor (C++/Arduino syntax)
- **Code Review** — Checks required variables and functions in student code
- **Progressive Hints** — Built-in hints that get more helpful without revealing solutions
- **Gamification** — XP, levels, streaks, achievements, and leaderboard
- **Assignment History** — Search, filter, sort, redo, bookmark, and favorite
- **Admin Dashboard** — User management, analytics, catalog seeding
- **Daily Challenges** — Fresh assignment every day from the catalog
- **Dark Mode** — Beautiful glassmorphism UI with Arduino green accents

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Monaco Editor, Framer Motion, Axios |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT, bcrypt |
| Deployment | Docker, Docker Compose |

## Project Structure

```
arduinoClass/
├── client/          # React frontend (Vite)
├── server/          # Express backend
├── shared/          # Shared TypeScript types
├── prisma/          # Database schema
├── docker/          # Dockerfiles and nginx config
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or use Docker)

## Installation

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd arduinoClass
npm install
```

### 2. Environment variables

Copy the example env file and configure:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://arduino:arduino123@localhost:5432/arduino_learning` |
| `JWT_SECRET` | Secret for JWT signing | `your-secret-key` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `PORT` | Server port | `3001` |

### 3. Database setup

Start PostgreSQL (via Docker or local install):

```bash
docker compose up postgres -d
```

Run Prisma migrations:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

The seed creates 100 catalog assignment templates, demo users, and achievements.

### 4. Start development

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Health check: http://localhost:3001/api/health

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Demo Student | demo@arduino.dev | demo12345 |
| Admin | admin@arduino.dev | admin12345 |

## Docker Commands

```bash
docker compose up -d          # Start full stack (http://localhost:8080)
docker compose up --build -d  # Rebuild after code changes
docker compose down           # Stop services
docker compose logs -f server # View server logs
```

## API Documentation

Base URL: `/api`

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/assignment/generate` | Pick assignment from catalog |
| POST | `/submission/review` | Check code against test variables |
| POST | `/hint` | Get progressive hint |
| GET | `/assignment/catalog/list` | Browse catalog |

## License

MIT
