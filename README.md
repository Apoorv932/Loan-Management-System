# Loan Management System

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
