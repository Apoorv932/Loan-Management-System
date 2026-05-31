# Loan Management System

A full‑stack MERN (MongoDB, Express, React/Next.js) loan management platform.

## Architecture Overview

```mermaid
graph TD
  subgraph Frontend
    UI[Next.js (client)] --> API[REST API Calls]
  end
  subgraph Backend
    API --> Auth[Auth Router]
    API --> Borrower[Borrower Router]
    API --> Dashboard[Dashboard Router]
    API --> Payment[Payment Service]
    Auth --> DB[(MongoDB)]
    Borrower --> DB
    Dashboard --> DB
    Payment --> DB
  end
  DB -->|Mongoose Models| Models[Loan, Payment, User...]
```

### Folder Structure

```
.
├─ client/
│   ├─ app/            # Next.js app router pages
│   ├─ components/     # UI components
│   └─ ...
├─ server/
│   ├─ src/
│   │   ├─ config/     # env.ts, db.ts
│   │   ├─ middleware/ # upload, error handling, CORS
│   │   ├─ models/     # Mongoose schemas (Loan, Payment, User)
│   │   ├─ routes/     # auth.routes.ts, borrower.routes.ts, …
│   │   ├─ services/   # business logic (loanCalculator, payment)
│   │   ├─ app.ts      # Express app setup
│   │   └─ server.ts   # Bootstrap
│   └─ .env            # environment variables
├─ README.md
└─ .gitignore
```

## Key Environment Variables (`server/.env`)

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | JWT validity period |
| `SERVER_URL` | Base URL used to build file URLs (e.g., salary‑slip links) |
| `CLIENT_URL` | Front‑end URL for CORS |
| `PORT` | Port for the Express server |

## Setup & Run

```bash
# Install dependencies
npm install
npm install --prefix server
npm install --prefix client

# Copy env files
cp server/.env.example server/.env
cp client/.env.example client/.env.local

# Start MongoDB (Docker)
docker compose up -d mongo

# Seed test data
npm run seed   # defined in server/package.json

# Development server (both client & server)
npm run dev
```

## Features

- Role‑based authentication (Admin, Sales, Sanction, Disbursement, Collection, Borrower)
- Loan lifecycle: **Applied → Approved → Disbursed → Repayment → Closed**
- Salary‑slip upload with Cloudinary fallback and proper URL generation
- Payment recording with automatic loan balance updates; balances less than ₹1 are treated as zero
- Dynamic tenure input (no 365‑day hard limit)

## Common Commands

| Command | Purpose |
|---------|----------|
| `npm run dev` | Starts both client and server in watch mode |
| `npm run build` | Builds the Next.js client for production |
| `npm run seed` | Populates the database with demo users |
| `npm run lint` | Runs ESLint checks |

---  

*Feel free to adjust the architecture diagram or folder tree as the project evolves.*


Phase 1 foundation for the MERN + Next.js Loan Management System assignment.

## Tech Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS
- Backend: Node.js, Express.js, TypeScript
- Database: MongoDB, Mongoose
- Auth: JWT, bcrypt

## Setup

1. Install dependencies:

   ```bash
   npm install
   npm install --prefix server
   npm install --prefix client
   ```

2. Create environment files:

   ```bash
   cp .env.example server/.env
   cp .env.example client/.env.local
   ```

3. Start MongoDB.

   If Docker is available:

   ```bash
   docker compose up -d mongo
   ```

   Or run a local MongoDB server on `mongodb://127.0.0.1:27017`.

4. Seed test accounts:

   ```bash
   npm run seed
   ```

5. Start development servers:

   ```bash
   npm run dev
   ```

## Seeded Credentials

All seeded accounts use password `Password@123`.

| Role | Email |
| --- | --- |
| Admin | admin@lms.local |
| Sales | sales@lms.local |
| Sanction | sanction@lms.local |
| Disbursement | disbursement@lms.local |
| Collection | collection@lms.local |
| Borrower | borrower@lms.local |
