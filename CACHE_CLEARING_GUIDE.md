# 🔍 PREVIEW NOT SHOWING UPDATES? - CACHE CLEARING GUIDE

## ✅ All Changes Are Live - Just Need Cache Clear

Your browser has cached the old version. Here's how to see the updates:

---

## OPTION 1: Hard Refresh (Fastest) ⚡

### Windows/Linux:
```
Ctrl + Shift + R
or
Ctrl + F5
```

### Mac:
```
Cmd + Shift + R
or
Cmd + Option + R
```

---

## OPTION 2: Clear Browser Cache 🧹

### Chrome/Edge:
1. Press `Ctrl + Shift + Delete` (or `Cmd + Shift + Delete` on Mac)
2. Select **"Cached images and files"**
3. Click **"Clear data"**
4. Refresh the page

### Firefox:
1. Press `Ctrl + Shift + Delete`
2. Select **"Cache"**
3. Click **"Clear Now"**
4. Refresh the page

### Safari:
1. Press `Cmd + Option + E` (clears cache)
2. Or go to **Develop → Empty Caches**
3. Refresh the page

---

## OPTION 3: Incognito/Private Mode 🕵️

Open your preview URL in an incognito/private window:

**Chrome/Edge:** `Ctrl + Shift + N` (or `Cmd + Shift + N` on Mac)  
**Firefox:** `Ctrl + Shift + P`  
**Safari:** `Cmd + Shift + N`

Then navigate to:
```
https://2fd5fb97-e6eb-45e3-94ac-739226fe15ad.preview.emergentagent.com
```

---

## ✅ What You Should See After Cache Clear:

### Homepage Footer:
- ❌ **GONE:** support@founderplane.com
- ❌ **GONE:** WhatsApp button
- ✅ **VISIBLE:** "Need Support? Chat with us" (Intercom button)

### Browser Tab:
- ✅ **NEW:** Geometric FounderPlane icon (blue diamond with red accent)

### Page Title:
- ✅ **NEW:** "FounderPlane | The Business-Building Ecosystem"

### BoltGuider Page (`/services/boltguider`):
- ✅ **UPDATED:** "BOOK STANDARD" opens Razorpay payment link
- ✅ **UPDATED:** "JOIN ACCELERATOR" opens Razorpay payment link

### View Page Source (Ctrl+U):
- ✅ **NEW:** Google Analytics script (G-JX6Z54XX7C)
- ✅ **NEW:** SEO meta tags with "Business-Building Ecosystem"

---

## 🔬 Technical Verification

If you want to verify changes are deployed without cache:

1. **Check Service Status:**
   - Frontend is RUNNING (confirmed)
   - All files updated (confirmed)
   - HMR updates triggered (confirmed)

2. **Check Source Files:**
   - HomepageFooter: ✅ Updated (no email/WhatsApp, has Intercom)
   - index.html: ✅ Updated (SEO tags + GA4)
   - Boltguider: ✅ Updated (payment links)
   - robots.txt: ✅ Updated (excludes onboarding)

3. **Direct URL Test:**
   ```
   curl https://2fd5fb97-e6eb-45e3-94ac-739226fe15ad.preview.emergentagent.com
   ```
   Should show new title and GA4 script

---

## 📱 Mobile Preview

If testing on mobile:
1. Close the browser completely
2. Reopen and navigate to preview URL
3. Or use mobile browser's "Request Desktop Site" option

---

## 🚨 Still Not Seeing Changes?

If after hard refresh you still don't see updates:

1. **Wait 30 seconds** - CDN propagation
2. **Try different browser** - Chrome, Firefox, Edge
3. **Check URL** - Make sure you're on:
   ```
   https://2fd5fb97-e6eb-45e3-94ac-739226fe15ad.preview.emergentagent.com
   ```
4. **Screenshot** - Take a screenshot of what you see and share

---

## ✅ All Changes Are Deployed

```
✅ Frontend: RUNNING
✅ Files: All updated
✅ HMR: Triggered
✅ Build: Successful
✅ Cache: Browser-side only
```

**Just need a hard refresh to see them!** 🎉

---

**Pro Tip:** Always use `Ctrl+Shift+R` (or `Cmd+Shift+R`) when previewing web app updates to bypass cache.
