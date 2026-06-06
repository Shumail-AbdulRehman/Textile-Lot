# Textile Lot & Serial Number Management System

A production-ready MERN stack application for generating textile lot serial numbers, assigning roll numbers, tracing individual serials, and exporting serial data to Excel or CSV.

## Folder Structure

```text
.
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── models
│   │   ├── routes
│   │   ├── utils
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend
│   ├── src
│   │   ├── api
│   │   ├── components
│   │   ├── layout
│   │   ├── pages
│   │   ├── theme
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── package.json
```

## Requirements

- Node.js 18+
- Local MongoDB instance
- npm

## Setup

Install backend dependencies:

```bash
cd backend
npm install
cp .env.example .env
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
cp .env.example .env
```

Start MongoDB locally, then run both apps in separate terminals.

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Default URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

## Heroku Backend Deployment

The root `package.json` is configured for backend-only Heroku deployment:

- `npm start` runs `backend/src/server.js`.
- `postinstall` installs backend production dependencies.
- `Procfile` declares the web dyno command.

Set these Heroku config vars:

```bash
heroku config:set MONGO_URI="your-mongodb-atlas-uri"
heroku config:set CLIENT_ORIGIN="your-frontend-url"
```

Deploy from the repository root. Heroku will use the root `package.json` and run the backend from `backend/`.

## API Endpoints

- `POST /api/lots/generate` creates a lot and bulk inserts serials.
- `GET /api/lots` returns all lots.
- `GET /api/lots/:id` returns one lot with serial counts.
- `PUT /api/lots/:id` updates a lot. Date or yard changes regenerate serials and are blocked if rolls are already assigned.
- `DELETE /api/lots/:id` deletes a lot and its related serials.
- `GET /api/serials` returns paginated serials with search and sorting.
- `GET /api/serials/:id` returns serial details by Mongo id or serial number.
- `PUT /api/serials/:id/assign-roll` assigns a roll number.
- `GET /api/export/excel` downloads `serials-export.xlsx`.
- `GET /api/export/csv` downloads `serials-export.csv`.
- `GET /api/dashboard/summary` returns dashboard totals.

## Serial Generation

Input date `2026-06-03` creates lot code `LOT-03062026`.

For `yard = 1000`, generated serials are:

```text
LOT-03062026-0001
LOT-03062026-0002
LOT-03062026-0003
...
LOT-03062026-1000
```

The backend uses `String(sequence).padStart(4, '0')` and `Serial.insertMany()` for bulk insertion. The yard value is capped at 10,000 per request.

## Database Collections

### lots

- `lotCode`
- `date`
- `yard`
- `meter`
- `createdAt`
- `updatedAt`

### serials

- `serialNumber`
- `lotId`
- `lotCode`
- `date`
- `yard`
- `meter`
- `rollNumber`
- `status`
- `createdAt`
- `updatedAt`

Indexes are defined for `serialNumber`, `lotCode`, and `date`. `serialNumber` and `lotCode` are unique to prevent duplicate generated serials for the required format.
