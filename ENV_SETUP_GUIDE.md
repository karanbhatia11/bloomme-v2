# Environment Configuration Guide

This guide explains how to properly configure your local and production environments. **Follow this and you'll never have port/API URL issues again.**

---

## 🚀 Quick Start

### Running Locally (3 Terminals)

**Terminal 1 — Backend**
```bash
cd backend
npm run dev    # Runs on http://localhost:5000
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm run dev    # Runs on http://localhost:3000
# Uses .env.local automatically (NEXT_PUBLIC_API_URL=http://localhost:5000)
```

**Terminal 3 — Admin Portal**
```bash
cd admin-portal
npm run dev    # Runs on http://localhost:9000
# Uses .env.local automatically (BACKEND_URL=http://localhost:5000)
```

✅ **Everything works because they all use `http://localhost:5000` for backend**

---

### Running with Docker (Production)

```bash
docker-compose up --build
```

Services map to:
- Frontend: http://localhost:5001 (via Nginx)
- Backend: http://localhost:5002 (via Nginx)
- Admin: http://localhost:5003 (via Nginx)
- All traffic goes through Nginx which routes internally

✅ **Everything works because Nginx handles routing + services use `http://backend:5000` internally**

---

## 📁 Environment Files Structure

### Backend (`backend/`)

| File | Usage | When to Use |
|------|-------|-----------|
| `.env` | Local dev (3 terminals) | `npm run dev` locally |
| `.env.docker` | Docker Compose | `docker-compose up` |
| `.env.production` | EC2 Production | Deployed on EC2 |

**Key difference:**
- `.env` → `PORT=5001` (local, avoids macOS port conflicts), points to `32.236.8.241:5433` (your dev database)
- `.env.docker` → `PORT=5000`, points to `db:5432` (Docker internal network)
- `.env.production` → `PORT=5000`, points to production database

### Frontend (`frontend/`)

| File | Usage | When to Use |
|------|-------|-----------|
| `.env.development` | Local dev (3 terminals) | `npm run dev` locally |
| `.env.docker` | Docker Compose | `docker-compose up` |
| `.env.production` | Production build | Deployed to production |

**Key variables:**
```
NEXT_PUBLIC_API_URL=http://localhost:5001      # .env.development (local)
NEXT_PUBLIC_API_URL=http://backend:5000        # .env.docker
NEXT_PUBLIC_API_URL=https://bloomme.co.in      # .env.production
```

### Admin Portal (`admin-portal/`)

| File | Usage | When to Use |
|------|-------|-----------|
| `.env` | Local dev (3 terminals) | `npm run dev` locally |
| `.env.docker` | Docker Compose | `docker-compose up` |
| `.env.production` | EC2 Production | Deployed on EC2 |

**Key variables:**
```
BACKEND_URL=http://localhost:5001              # .env (local)
BACKEND_URL=http://backend:5000                # .env.docker
BACKEND_URL=http://backend:5000                # .env.production (Docker containers)
```

---

## 🔧 Configuration Reference

### Local Development (3 Terminals)

```
┌────────────────────┬─────────┬──────────────────────────────────┐
│     Service        │  Port   │        Backend URL               │
├────────────────────┼─────────┼──────────────────────────────────┤
│ Frontend           │  3000/2 │ http://localhost:5001            │
│ Backend            │  5001   │ (this is the backend itself)     │
│ Admin Portal       │  9000   │ http://localhost:5001            │
│ PostgreSQL (your)  │  5433   │ 32.236.8.241:5433              │
└────────────────────┴─────────┴──────────────────────────────────┘

Note: Frontend may use port 3002 if 3000 is in use.
Backend uses 5001 (not 5000) to avoid macOS Control Center conflicts.
```

### Docker Compose

```
┌────────────────────┬──────────────┬────────────────┬──────────────────────────┐
│     Service        │ Internal:Port│  External:Port │   Backend URL            │
├────────────────────┼──────────────┼────────────────┼──────────────────────────┤
│ Frontend           │ :3000        │ :5001          │ http://backend:5000      │
│ Backend            │ :5000        │ :5002          │ (this is the backend)    │
│ Admin Portal       │ :9000        │ :5003          │ http://backend:5000      │
│ PostgreSQL         │ :5432        │ :5433          │ db:5432 (internal)       │
│ Nginx              │ :80, :443    │ :80, :443      │ Routes all traffic       │
└────────────────────┴──────────────┴────────────────┴──────────────────────────┘
```

### Production (EC2)

```
┌────────────────────┬──────────────┬────────────────────────────┐
│     Service        │ Internal:Port │   Backend URL              │
├────────────────────┼──────────────┼────────────────────────────┤
│ Frontend           │ :3000        │ http://backend:5000        │
│ Backend            │ :5000        │ (this is the backend)      │
│ Admin Portal       │ :9000        │ http://backend:5000        │
│ PostgreSQL         │ :5432        │ localhost:5432 (Docker)    │
│ Nginx              │ :80, :443    │ Routes all traffic         │
└────────────────────┴──────────────┴────────────────────────────┘

External URLs (via Nginx + SSL):
- https://bloomme.co.in → Frontend
- https://bloomme.co.in/api/* → Backend
- https://bloomme.co.in/admin/* → Admin Portal
```

---

## 🐛 Troubleshooting

### Problem: Admin portal can't load data locally

**Check:** Are you running `npm run dev` in 3 terminals?

1. Verify backend is on port 5000:
   ```bash
   lsof -i :5000
   # Should show backend running
   ```

2. Verify admin portal reads `.env.local`:
   ```bash
   cd admin-portal
   grep BACKEND_URL .env.local
   # Should show: BACKEND_URL=http://localhost:5000
   ```

3. Test the connection:
   ```bash
   curl http://localhost:5000/api/health
   # Should return something (not "cannot connect")
   ```

### Problem: Docker compose fails

**Check:** Are you running `docker-compose up --build`?

1. Verify all services are running:
   ```bash
   docker-compose ps
   # All should say "Up"
   ```

2. Check logs:
   ```bash
   docker-compose logs admin-portal
   # Should show BACKEND_URL=http://backend:5000
   ```

3. Test from host:
   ```bash
   curl http://localhost:5002/api/health
   # Should work
   ```

### Problem: Production site shows admin errors

**Check:** Is `.env.production` configured on your EC2 instance?

1. SSH into EC2 and verify:
   ```bash
   cat /path/to/backend/.env.production
   # Should have production database credentials
   ```

2. Restart services:
   ```bash
   docker-compose up --build -d
   ```

---

## ✅ Verification Checklist

- [ ] Backend `.env` has `PORT=5000`
- [ ] Frontend `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:5000`
- [ ] Admin `.env.local` has `BACKEND_URL=http://localhost:5000`
- [ ] Docker-compose uses `.env.docker` for backend
- [ ] Docker-compose frontend env has `NEXT_PUBLIC_API_URL=http://backend:5000`
- [ ] Production `.env.production` files exist on EC2
- [ ] Nginx config routes `/api/*` to backend
- [ ] Nginx config routes `/admin/*` to admin-portal
- [ ] All databases are reachable from their respective services

---

## 📝 File Contents Reference

### backend/.env (Local Dev)
```env
PORT=5000
DATABASE_URL=postgresql://bloomme_user:bloomme_secure_password_change_this@32.236.8.241:5433/bloomme_db
JWT_SECRET=local_dev_secret_key
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
RAZORPAY_KEY_ID=rzp_live_SZjf3QjriE0xWX
RAZORPAY_KEY_SECRET=9hrlvxYOnV4grGdKvvx3x6yr
RESEND_API_KEY=re_RmE99tmx_gwNNXL26sNPTWjpavTPVhSig
RESEND_FROM_EMAIL=Info@bloomme.co.in
```

### backend/.env.docker (Docker Compose)
```env
PORT=5000
DATABASE_URL=postgresql://bloomme_user:bloomme_secure_password_change_this@db:5432/bloomme_db
JWT_SECRET=local_dev_secret_key
NODE_ENV=development
FRONTEND_URL=http://localhost:5001
RAZORPAY_KEY_ID=rzp_live_SZjf3QjriE0xWX
RAZORPAY_KEY_SECRET=9hrlvxYOnV4grGdKvvx3x6yr
RESEND_API_KEY=re_RmE99tmx_gwNNXL26sNPTWjpavTPVhSig
RESEND_FROM_EMAIL=Info@bloomme.co.in
```

### frontend/.env.local (Local Dev)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_SZjf3QjriE0xWX
```

### frontend/.env.docker (Docker Compose)
```env
NEXT_PUBLIC_API_URL=http://backend:5000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_SZjf3QjriE0xWX
```

### admin-portal/.env.local (Local Dev)
```env
ADMIN_PORT=9000
BACKEND_URL=http://localhost:5000
JWT_SECRET=admin-secret-key-change-in-production
```

### admin-portal/.env.docker (Docker Compose)
```env
ADMIN_PORT=9000
BACKEND_URL=http://backend:5000
JWT_SECRET=admin-secret-key-change-in-production
```

---

## 🚀 Next Steps

1. **For local dev:** Just run `npm run dev` in 3 terminals — they'll auto-load `.env.local` files
2. **For Docker:** Run `docker-compose up --build` — it'll use `.env.docker` files
3. **For production:** Copy `.env.production` files to EC2 and update with real credentials

That's it! 🎉
