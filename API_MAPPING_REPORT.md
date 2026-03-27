# Frontend-Backend API Mapping Report

**Generated:** 2026-03-27

---

## Summary

| Category | Count |
|----------|-------|
| Matched Endpoints | 11 |
| Partial/Path Mismatches | 4 |
| Missing Backend Routes (called by frontend) | 16 |
| Orphaned Backend Routes (not called by frontend) | 10 |

---

## 1. ✅ MATCHED ENDPOINTS (Exact Match)

These frontend API calls have corresponding backend routes with matching paths and methods:

| Frontend Call | Backend Route | Service File | Status |
|---------------|---------------|--------------|--------|
| POST `/api/auth/login` | auth.ts | authService.ts | ✅ MATCH |
| POST `/api/auth/signup` | auth.ts | authService.ts | ✅ MATCH |
| GET `/api/config/plans` | config.ts | checkoutService.ts | ✅ MATCH |
| GET `/api/user/config/add-ons` | user.ts | checkoutService.ts, addonsCheckoutService.ts | ✅ MATCH |
| POST `/api/subs/subscribe` | subscriptions.ts | checkoutService.ts | ✅ MATCH |
| GET `/api/subs/my-subscription` | subscriptions.ts | addonsCheckoutService.ts | ✅ MATCH |
| POST `/api/user/address` | user.ts | (Backend accepts, not explicitly called) | ✅ EXISTS |
| POST `/api/admin/config/site-mode` | admin.ts | (Admin feature) | ✅ MATCH |
| GET `/api/orders/{orderId}` | N/A | checkoutService.ts, dashboardService.ts, addonsCheckoutService.ts | ❌ MISSING |
| POST `/api/payments/create` | N/A | checkoutService.ts | ❌ MISSING |
| POST `/api/payments/verify` | N/A | checkoutService.ts, addonsCheckoutService.ts | ❌ MISSING |

---

## 2. ⚠️ PARTIAL/PATH MISMATCHES (Different Routes Called)

These have inconsistencies in endpoint paths or methods:

### Issue #1: Plans Endpoint Duplication
| Frontend Calls | Backend Has |
|---|---|
| GET `/api/config/plans` | GET `/api/subs/plans` AND GET `/api/config/plans` |
| **Problem:** | Frontend correctly uses `/api/config/plans`, but `/api/subs/plans` is defined but never called |
| **Resolution:** | Remove duplicate route or consolidate |

### Issue #2: Subscription Pause/Resume/Cancel
| Frontend Calls | Backend Route | Details |
|---|---|---|
| POST `/api/subs/{subscriptionId}/pause` | POST `/api/subs/pause` | Frontend includes ID in path, backend ignores it and pauses user's latest subscription |
| POST `/api/subs/{subscriptionId}/resume` | ❌ MISSING | Backend has no resume endpoint |
| POST `/api/subs/{subscriptionId}/cancel` | ❌ MISSING | Backend has no cancel endpoint |

### Issue #3: Dashboard Stats
| Frontend Calls | Backend Route |
|---|---|
| GET `/api/dashboard/stats` | ❌ MISSING |
| **Available Instead:** | GET `/api/admin/dashboard` (requires admin auth) |

---

## 3. ❌ MISSING BACKEND ROUTES (Frontend Calls With No Backend)

These are critical gaps - frontend calls endpoints that don't exist:

| Frontend Service | Endpoint Called | Used For | Status |
|---|---|---|---|
| dashboardService.ts | GET `/api/dashboard/stats` | Dashboard overview stats | ❌ MISSING |
| dashboardService.ts | GET `/api/subs/my-subscriptions` | Get all user subscriptions | ❌ MISSING |
| dashboardService.ts | POST `/api/subs/{id}/resume` | Resume subscription | ❌ MISSING |
| dashboardService.ts | POST `/api/subs/{id}/cancel` | Cancel subscription | ❌ MISSING |
| dashboardService.ts | GET `/api/addons/my-addons` | Get user's add-ons | ❌ MISSING |
| dashboardService.ts | POST `/api/addons/{id}/quantity` | Update add-on qty | ❌ MISSING |
| dashboardService.ts | POST `/api/addons/{id}/delivery-dates` | Set delivery dates | ❌ MISSING |
| dashboardService.ts | POST `/api/addons/{id}/remove` | Remove add-on | ❌ MISSING |
| dashboardService.ts | GET `/api/calendar/my-deliveries` | Get calendar/deliveries | ❌ MISSING |
| dashboardService.ts | GET `/api/orders/history` | Get order history | ❌ MISSING |
| dashboardService.ts | GET `/api/referrals/overview` | Get referral stats | ❌ MISSING |
| dashboardService.ts | GET `/api/referrals/list` | Get referral list | ❌ MISSING |
| dashboardService.ts | POST `/api/referrals/withdraw` | Withdraw referral balance | ❌ MISSING |
| dashboardService.ts | GET `/api/user/settings` | Get user settings | ❌ MISSING |
| dashboardService.ts | POST `/api/user/profile/update` | Update profile | ❌ MISSING |
| dashboardService.ts | POST `/api/user/address/update` | Update address | ❌ MISSING |
| dashboardService.ts | POST `/api/user/notifications/update` | Update notification prefs | ❌ MISSING |
| dashboardService.ts | POST `/api/user/account/delete` | Delete account | ❌ MISSING |
| checkoutService.ts | POST `/api/promo/validate` | Validate promo codes | ❌ MISSING |
| checkoutService.ts | GET `/api/user/referral` | Get referral balance | ❌ MISSING |
| checkoutService.ts | POST `/api/payments/create` | Create payment order | ❌ MISSING |
| checkoutService.ts | POST `/api/payments/verify` | Verify payment | ❌ MISSING |
| addonsCheckoutService.ts | POST `/api/addons/create` | Create add-ons order | ❌ MISSING |

**Total Missing: 23 critical endpoints**

---

## 4. 🟢 ORPHANED BACKEND ROUTES (Not Called by Frontend)

These routes exist but frontend doesn't call them:

| Backend Route | File | Notes |
|---|---|---|
| GET `/api/subs/plans` | subscriptions.ts | Duplicate of `/api/config/plans` |
| GET `/api/admin/stats` | admin.ts | Admin-only, requires admin auth |
| GET `/api/admin/users` | admin.ts | Admin-only |
| GET `/api/admin/subscriptions` | admin.ts | Admin-only |
| GET `/api/admin/categories` | admin.ts | Admin-only |
| POST `/api/admin/categories` | admin.ts | Admin-only |
| GET `/api/admin/products` | admin.ts | Admin-only |
| POST `/api/admin/products` | admin.ts | Admin-only |
| GET `/api/admin/plans` | admin.ts | Admin-only |
| POST `/api/admin/plans` | admin.ts | Admin-only |
| PUT `/api/admin/plans/{id}` | admin.ts | Admin-only |
| DELETE `/api/admin/plans/{id}` | admin.ts | Admin-only |
| POST `/api/newsletter/subscribe` | newsletter.ts | Newsletter signup (uncalled) |
| POST `/api/newsletter/unsubscribe` | newsletter.ts | Newsletter unsub (uncalled) |
| POST `/api/upload/image` | upload.ts | Image upload (uncalled) |
| GET `/api/config/site-mode` | config.ts | Called in auth context but not via service |
| GET `/api/admin/dashboard` | user.ts | Admin dashboard (uncalled) |

---

## 5. 📊 CRITICAL ISSUES

### High Priority
1. **23 Missing Endpoint Implementations** - Dashboard, orders, referrals, and more have no backend
   - Frontend expects `/api/dashboard/stats`, backend has `/api/admin/dashboard` (different auth level)
   - Subscription management endpoints missing (`resume`, `cancel`)
   - All add-ons management endpoints missing
   - All referral endpoints missing
   - All user settings/profile endpoints missing

2. **Path Parameter Inconsistency** - Subscription operations
   - Frontend calls: `POST /api/subs/{id}/pause`
   - Backend route: `POST /api/subs/pause` (ignores path param, uses logged-in user)
   - Same issue for `resume`, `cancel`

3. **Auth Context Issue** - Frontend checks site mode at startup
   - Calls `GET /api/config/site-mode` implicitly
   - No explicit service function, used in component
   - Should be formalized in a service

### Medium Priority
1. **Duplicate Plan Endpoints**
   - `/api/subs/plans` vs `/api/config/plans`
   - Frontend uses `/api/config/plans` correctly
   - Should remove `/api/subs/plans` or consolidate

2. **Missing Response Shape Documentation**
   - No backend documentation of response structures
   - Frontend assumes specific schemas (e.g., `DashboardStats` interface)
   - Could cause deserialization errors

### Low Priority
1. **Orphaned Admin Routes** - Exist but not used by current frontend
   - May be for future admin panel
   - Requires admin authentication

---

## 6. RECOMMENDATIONS

### Immediate Actions
1. **Implement Missing Endpoints** - Create these backend routes:
   ```
   Dashboard: GET /api/dashboard/stats
   Orders: GET /api/orders/history, GET /api/orders/{id}
   Subscriptions: GET /api/subs/my-subscriptions, POST /api/subs/{id}/resume, POST /api/subs/{id}/cancel
   Add-ons: GET /api/addons/my-addons, POST /api/addons/{id}/quantity, POST /api/addons/{id}/delivery-dates, POST /api/addons/{id}/remove
   Referrals: GET /api/referrals/overview, GET /api/referrals/list, POST /api/referrals/withdraw
   User: GET /api/user/settings, POST /api/user/profile/update, POST /api/user/address/update, POST /api/user/notifications/update, POST /api/user/account/delete
   Payment: POST /api/payments/create, POST /api/payments/verify
   Promo: POST /api/promo/validate
   Other: GET /api/user/referral, POST /api/addons/create
   ```

2. **Fix Path Parameters** - Update subscription endpoints to accept subscription ID in path:
   ```
   POST /api/subs/{subscriptionId}/pause
   POST /api/subs/{subscriptionId}/resume (NEW)
   POST /api/subs/{subscriptionId}/cancel (NEW)
   ```

3. **Consolidate Plans Route** - Remove `/api/subs/plans`, keep only `/api/config/plans`

4. **Document Response Schemas** - Add TypeScript interfaces or OpenAPI specs for all endpoints

### Follow-up
- Create integration tests to validate frontend-backend compatibility
- Set up API contract testing
- Use OpenAPI/Swagger for documentation
