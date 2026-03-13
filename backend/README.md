# Cyber7 Backend

Express API with MongoDB auth and ConnectWise-backed alerts.

## Setup

1. **MongoDB**  
   Run MongoDB locally or set `MONGODB_URI` (e.g. Atlas connection string).

2. **Environment**  
   Copy `.env.example` to `../.env` (project root) and set:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - ConnectWise vars: `CW_BASE_URL`, `CW_COMPANY_ID`, `CW_PUBLIC_KEY`, `CW_PRIVATE_KEY`, `CW_CLIENT_ID`

3. **Install and run**

   ```bash
   cd backend
   npm install
   npm start
   ```

   Server runs at `http://localhost:3001` (or `BACKEND_PORT`).

## API

- **POST /auth/register** – Register. Body: `{ email, password, role?, companyId? }`. `companyId` required if `role === 'user'`.
- **POST /auth/login** – Login. Body: `{ email, password }`. Returns `{ token, user }`.
- **GET /auth/me** – Current user (header: `Authorization: Bearer <token>`).
- **GET /alerts** – Alerts from ConnectWise. Header: `Authorization: Bearer <token>`. **Admin**: all companies. **User**: only alerts for their `companyId` (ConnectWise company identifier).

## Frontend

In project root `.env` set:

- `EXPO_PUBLIC_API_URL=http://localhost:3001`  
  (or your backend URL so the app calls this API for login and alerts.)
