# Local Testing Checklist

Follow these steps exactly to verify your local setup works. 

---

## 🚀 Step 1: Start Backend (Terminal 1)

```bash
cd backend
npm run dev
```

**Expected output:**
```
> backend@1.0.0 dev
> nodemon --exec tsx src/index.ts

Successfully connected to the PostgreSQL database!
Server is running on http://localhost:5000
```

**Check:**
- [ ] Backend starts without errors
- [ ] Database connects successfully (check for "Successfully connected to the PostgreSQL database!")
- [ ] Server running on `http://localhost:5000`

**Test backend health:**
```bash
# In a new terminal
curl http://localhost:5000/api/health
# Should return something (or 404 is fine - means backend is responding)
```

---

## 🚀 Step 2: Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

**Expected output:**
```
> frontend@15.0.0 dev
> next dev

  ▲ Next.js 15.0.0
  - ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

**Check:**
- [ ] Frontend starts without errors
- [ ] Shows "ready started server on ... :3000"
- [ ] No "NEXT_PUBLIC_API_URL" warnings

**Test frontend:**
```bash
# Open in browser
http://localhost:3000
# Should load the homepage without errors
```

---

## 🚀 Step 3: Start Admin Portal (Terminal 3)

```bash
cd admin-portal
npm run dev
```

**Expected output:**
```
> admin-portal@1.0.0 dev
> tsx watch src/index.ts

Server is running on http://localhost:9000
```

**Check:**
- [ ] Admin portal starts without errors
- [ ] Shows "Server is running on http://localhost:9000"
- [ ] Logs show `BACKEND_URL=http://localhost:5000`

---

## 🧪 Step 4: Test API Communication

### 4a. Backend → Can it start?
```bash
# Check if backend is listening on 5000
lsof -i :5000
# Should show node/tsx process
```

### 4b. Frontend → Can it talk to backend?
```bash
# Frontend makes API calls via rewrite rule
# Open browser console at http://localhost:3000
# Go to Network tab, then try logging in or signing up
# Should see requests to http://localhost:3000/api/...
# Check the response - should not be 500 or CORS error
```

### 4c. Admin Portal → Can it talk to backend?
```bash
# Test admin login endpoint
curl -X POST http://localhost:9000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"rushilpartner@gmail.com","password":"gauravpartner"}'

# Expected response:
# {"success":true,"token":"eyJhbGc..."}
```

### 4d. Admin Portal → Can it fetch page content?
```bash
# First, get a token from login above, then use it:
TOKEN="your_token_from_above"

curl http://localhost:9000/api/admin/page-content/home \
  -H "Authorization: Bearer $TOKEN"

# Expected: Should return page content or 200 response
# If you get "Cannot reach backend" → backend URL is wrong
```

---

## ✅ Test Admin Panel in Browser

1. **Open admin login:**
   ```
   http://localhost:9000
   ```

2. **Log in with:**
   - Username: `rushilpartner@gmail.com`
   - Password: `gauravpartner`

3. **Check each tab loads:**
   - [ ] Dashboard tab loads (shows stats, user count, etc.)
   - [ ] Content Manager tab loads (shows page content editor)
   - [ ] Users tab loads (shows user list)
   - [ ] Orders tab loads (shows orders)
   - [ ] Subscriptions tab loads (shows subscriptions)

4. **If any tab fails to load:**
   - Check browser Network tab for 404 or 500 errors
   - Check terminal 1 (backend) for error logs
   - Check terminal 3 (admin portal) for error logs

---

## 🔍 Debugging Guide

### Problem: Backend won't start

```bash
# Check if port 5000 is already in use
lsof -i :5000

# If it is, kill it:
kill -9 <PID>

# Then try again:
npm run dev
```

### Problem: Frontend shows API errors

```bash
# Check what API URL it's using
# In browser console (F12):
console.log(process.env.NEXT_PUBLIC_API_URL)
# Should output: http://localhost:5000

# If it's undefined or wrong:
# 1. Make sure .env.local exists in frontend/
# 2. Restart frontend with Ctrl+C and npm run dev again
# 3. Check that .env.local has: NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Problem: Admin portal can't reach backend

```bash
# Check what backend URL it's using
# Look at terminal 3 logs, should show:
# BACKEND_URL=http://localhost:5000

# Test connection manually:
curl http://localhost:5000/api/health
# If this fails, backend isn't running

# If backend IS running but admin can't reach it:
# Check .env.local in admin-portal/:
cat admin-portal/.env.local
# Should have: BACKEND_URL=http://localhost:5000
```

### Problem: 404 or 500 errors in admin panel

```bash
# Check backend logs (Terminal 1)
# Look for errors like:
# - "Cannot POST /api/admin/..."
# - Database connection errors
# - Auth errors (401, 403)

# If you see JWT/auth errors:
# Check that JWT_SECRET matches in:
# - backend/.env (JWT_SECRET=local_dev_secret_key)
# - admin-portal/.env.local (JWT_SECRET=admin-secret-key-change-in-production)

# Note: They don't have to match because admin portal has its own JWT!
# Admin portal issues its own tokens, not using backend JWT
```

---

## 📋 Final Verification

After all 3 services are running, check this table:

| Check | Status | How to Verify |
|-------|--------|---------------|
| Backend running on :5000 | [ ] | `curl http://localhost:5000/api/health` |
| Frontend running on :3000 | [ ] | Open `http://localhost:3000` in browser |
| Admin running on :9000 | [ ] | Open `http://localhost:9000` in browser |
| Frontend can call backend | [ ] | Browser Network tab should show `/api/*` requests |
| Admin login works | [ ] | Can login with credentials |
| Admin Dashboard loads | [ ] | Dashboard shows stats |
| Admin can fetch content | [ ] | Content Manager tab loads data |
| No CORS errors | [ ] | Browser console should be clean |
| No "Cannot reach backend" errors | [ ] | Admin logs should not show connection errors |

---

## ✨ If Everything Passes

Congratulations! Your local setup is solid. You can now:

1. **Make changes** to any service
2. **Changes auto-reload** (thanks to `npm run dev`)
3. **No more port/API URL debugging** needed
4. **Deploy to production** using the `.env.production` files with confidence

If anything fails, come back to this checklist and we'll diagnose it.
