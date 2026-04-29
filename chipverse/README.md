# ⚡ ChipVerse — Full-Stack Setup Guide

ChipVerse is a VLSI learning platform. This monorepo contains the **React frontend** and the **Node.js/Express backend** with full SSO (Google, LinkedIn, Mobile OTP).

---

## 📁 Project Structure

```
chipverse/
├── package.json            ← Root monorepo scripts
├── frontend/               ← Vite + React + TypeScript
│   ├── src/
│   │   ├── lib/
│   │   │   ├── api.ts      ← Backend API client (NEW)
│   │   │   └── user.ts     ← Auth hook (connects to backend)
│   │   ├── pages/
│   │   │   └── AuthCallback.tsx  ← Handles OAuth redirects
│   │   └── App.tsx
│   └── .env.example
└── backend/                ← Express + Prisma + PostgreSQL
    ├── src/
    │   ├── config/
    │   │   ├── env.ts          ← Environment config
    │   │   ├── prisma.ts       ← DB client
    │   │   └── passport.ts     ← Google + LinkedIn OAuth strategies
    │   ├── controllers/
    │   │   ├── auth.controller.ts
    │   │   └── user.controller.ts
    │   ├── middleware/
    │   │   ├── auth.middleware.ts   ← JWT verification
    │   │   ├── error.middleware.ts
    │   │   └── rateLimit.middleware.ts
    │   ├── routes/
    │   │   ├── auth.routes.ts
    │   │   └── user.routes.ts
    │   ├── services/
    │   │   ├── auth.service.ts  ← Email + OAuth + OTP logic
    │   │   ├── otp.service.ts   ← Twilio Verify
    │   │   └── user.service.ts  ← Progress + XP
    │   ├── utils/
    │   │   ├── jwt.ts
    │   │   ├── logger.ts
    │   │   └── response.ts
    │   ├── app.ts
    │   └── index.ts
    ├── prisma/
    │   ├── schema.prisma   ← Full DB schema
    │   └── seed.ts         ← Demo data
    └── .env.example
```

---

## 🚀 Quick Start (VS Code)

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (local or cloud e.g. Supabase, Neon)
- npm 9+

---

### Step 1 — Clone & Install

```bash
# Install all dependencies (root + both workspaces)
npm install
```

---

### Step 2 — Set up Backend Environment

```bash
cd backend
cp .env.example .env
# Edit .env and fill in your values (see section below)
```

---

### Step 3 — Set up Database

```bash
cd backend

# Push schema to your PostgreSQL database
npm run db:push

# Seed with demo users
npm run db:seed
```

Demo credentials after seed:
- `demo@chipverse.io` / `Demo@123`
- `admin@chipverse.io` / `Admin@123`

---

### Step 4 — Set up Frontend Environment

```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api (default, no change needed locally)
```

---

### Step 5 — Run Both Servers

```bash
# From the root directory — runs both concurrently
npm run dev
```

- **Frontend**: http://localhost:5173  
- **Backend**: http://localhost:5000  
- **Health check**: http://localhost:5000/health

---

## 🔑 Environment Variables

### Backend `.env`

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Min 32-char random string for access tokens |
| `JWT_REFRESH_SECRET` | Another random string for refresh tokens |
| `GOOGLE_CLIENT_ID` | From [Google Cloud Console](https://console.cloud.google.com) |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `LINKEDIN_CLIENT_ID` | From [LinkedIn Developers](https://www.linkedin.com/developers) |
| `LINKEDIN_CLIENT_SECRET` | From LinkedIn Developers |
| `TWILIO_ACCOUNT_SID` | From [Twilio Console](https://console.twilio.com) |
| `TWILIO_AUTH_TOKEN` | From Twilio Console |
| `TWILIO_VERIFY_SERVICE_SID` | Create a **Verify Service** in Twilio → Copy SID |

---

## 🔐 Setting Up OAuth Providers

### Google OAuth

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create project → **APIs & Services** → **Credentials**
3. Create **OAuth 2.0 Client ID** (Web application)
4. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
5. Copy Client ID and Client Secret to `.env`

### LinkedIn OAuth

1. Go to [linkedin.com/developers](https://www.linkedin.com/developers/apps)
2. Create app → **Auth** tab
3. Add redirect URL: `http://localhost:5000/api/auth/linkedin/callback`
4. Request `r_emailaddress` and `r_liteprofile` permissions
5. Copy Client ID and Secret to `.env`

### Twilio OTP

1. Sign up at [twilio.com](https://www.twilio.com)
2. Go to **Verify** → **Services** → Create new service (name it "ChipVerse")
3. Copy the **Service SID** (starts with `VA...`)
4. Copy Account SID and Auth Token from dashboard
5. Add all three to `.env`

---

## 📡 API Reference

### Auth Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Email + password registration |
| POST | `/api/auth/login` | Email + password login |
| POST | `/api/auth/otp/send` | Send OTP to phone |
| POST | `/api/auth/otp/verify` | Verify OTP + login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout + revoke token |
| GET  | `/api/auth/me` | Get current user |
| GET  | `/api/auth/google` | Start Google OAuth |
| GET  | `/api/auth/google/callback` | Google OAuth callback |
| GET  | `/api/auth/linkedin` | Start LinkedIn OAuth |
| GET  | `/api/auth/linkedin/callback` | LinkedIn OAuth callback |

### User Endpoints (requires JWT)

| Method | Path | Description |
|---|---|---|
| GET  | `/api/user/profile` | Get profile + progress |
| POST | `/api/user/progress` | Mark level complete |
| PATCH| `/api/user/domain` | Set current domain |

---

## 🏗️ Deployment

### Backend (Railway / Render / Fly.io)

```bash
cd backend
npm run build
npm start
```

Set production env variables in your hosting dashboard.

### Frontend (Vercel / Netlify)

```bash
cd frontend
npm run build
# Deploy the dist/ folder
```

Set `VITE_API_URL=https://your-backend.railway.app/api` in Vercel environment.

---

## 🛡️ Security Features

- **JWT rotation** — refresh tokens are single-use (rotated on each refresh)
- **httpOnly cookies** — tokens stored in httpOnly cookies, not localStorage
- **Rate limiting** — strict limits on auth and OTP endpoints
- **Helmet** — security headers on all responses
- **CORS** — only allows your frontend origin
- **Bcrypt** — passwords hashed with 12 salt rounds
- **Zod validation** — all inputs validated before hitting database
