# Authentication Protection - Testing Guide

## Quick Test Scenarios

### Scenario 1: Guest Tries to Add to Cart
**Steps:**
1. Open browser (not logged in)
2. Go to http://localhost:5174
3. Click "BUY" on any product
4. In the modal, click "Add X items to Cart" button
5. **Expected:** Login prompt appears with "Go to Login" button

**Verify:**
✓ Login prompt modal appears
✓ Can click "Go to Login" → Redirected to /login
✓ Can click "Cancel" → Modal closes, remains on product

---

### Scenario 2: Guest Tries to Checkout
**Steps:**
1. Open browser (not logged in)
2. Go directly to http://localhost:5174/checkout
3. **Expected:** Automatic redirect to /login

**Verify:**
✓ Page loads /login instead of checkout form
✓ URL changes to /login automatically

---

### Scenario 3: Guest Tries to Post Review
**Steps:**
1. Open browser (not logged in)
2. Go to any product details page
3. Scroll to "Write a Review" section
4. Notice the review form
5. **Expected:** Form fields are disabled, yellow warning shows

**Verify:**
✓ "Your Name" input is disabled
✓ "Your Review" textarea is disabled
✓ "Submit Review" button is disabled
✓ Yellow message says "Please log in to post a review"

---

### Scenario 4: Login & Auth Appears
**Steps:**
1. Open http://localhost:5174 (logged out)
2. Check navbar → Shows "Login" button
3. Click "Login" → Go to /login
4. Sign up with OTP or traditional login
5. After successful login → Redirected to home
6. **Expected:** Navbar changes immediately

**Verify:**
✓ Navbar shows user's name and email
✓ Shows red "Logout" button instead of "Login"
✓ Stays logged in on page refresh
✓ Can now add to cart without login prompt
✓ Can now access checkout page directly
✓ Can now post product reviews

---

### Scenario 5: Logout
**Steps:**
1. Login successfully (see user info in navbar)
2. Click red "Logout" button
3. **Expected:** Return to unauthenticated state

**Verify:**
✓ Navbar shows "Login" button again
✓ User info disappears from navbar
✓ localStorage cleared (check DevTools: Application → localStorage)
✓ Go back to any product → "Add to Cart" shows login prompt again

---

### Scenario 6: Session Persistence
**Steps:**
1. Login successfully
2. Refresh the page (F5 or Ctrl+R)
3. **Expected:** Remain logged in

**Verify:**
✓ Navbar still shows user info + logout button
✓ No need to login again
✓ Token still in localStorage

---

## Quick Verification Commands

### Check localStorage in DevTools
```javascript
// In browser console:

// Get token
localStorage.getItem('token')
// Should show: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// Get user info
JSON.parse(localStorage.getItem('userInfo'))
// Should show: { name: "John Doe", email: "john@example.com", role: "user" }

// Check after logout
localStorage.getItem('token')
// Should show: null
```

### Check Console for Errors
```javascript
// React errors should NOT appear related to auth
// Should see smooth state transitions
```

---

## Protected Actions Checklist

- [ ] Guest adds to cart → Login prompt appears
- [ ] Guest checks out → Redirected to /login
- [ ] Guest reviews product → Form disabled, can click submit to see prompt
- [ ] Logged-in user adds to cart → Works without prompt
- [ ] Logged-in user checks out → Works without redirect
- [ ] Logged-in user posts review → Works without restriction
- [ ] Logout works → Returns to guest state
- [ ] Refresh after login → Auth persists
- [ ] Navbar reactive → Updates immediately on login/logout

---

## Debugging Tips

### If login prompt doesn't appear:
1. Check browser console for errors
2. Verify `isLoggedIn` from `useAuth()` hook
3. Verify `localStorage.getItem('token')` is null when not logged in

### If page doesn't redirect automatically:
1. Check `useEffect` in Checkout.jsx
2. Verify `loading` state is managed correctly
3. Check browser console for navigation errors

### If auth doesn't persist on refresh:
1. Check `useEffect` in AuthContext.jsx
2. Verify localStorage has both 'token' and 'userInfo'
3. Check for any console errors during initialization

---

## API Integration Notes (Next Steps)

### When backend APIs are ready:
1. Replace local state cart with API calls
2. Use `authUtils.js` helper:
   ```javascript
   import { protectedFetch } from '../utils/authUtils'
   
   const response = await protectedFetch('http://localhost:5000/api/cart/add', {
     method: 'POST',
     body: JSON.stringify(cartItem)
   })
   ```

3. Backend should validate token on protected endpoints:
   ```javascript
   // Backend route
   router.post('/api/cart/add', protect, addToCartController)
   ```

---

## Summary of What's Protected

| Feature | Protection | User Impact |
|---------|-----------|------------|
| Add to Cart | Login Prompt Modal | Guest must login to add items |
| Checkout | Auto-redirect | Guest cannot access checkout page |
| Post Review | Form Disabled + Prompt | Guest cannot post, fields locked |
| Logout | Always Available | User can logout anytime |
| Login/Signup | No Restriction | Guest can login/signup freely |

---

**All authentication protection is now in place. Ready for backend API integration!**
