# 🔧 FIX: Netlify Not Getting GitHub Pushes

## Quick Fix Steps

### Option 1: Connect Netlify to GitHub (If Not Connected)

1. **Go to Netlify Dashboard**
   - Open: https://app.netlify.com
   - Sign in

2. **Check Your Site**
   - Click on your site name
   - Go to **"Site settings"** (top right)
   - Click **"Build & deploy"** in left sidebar
   - Click **"Continuous Deployment"**

3. **If You See "Link to Git provider"**
   - Click **"Link to Git provider"**
   - Choose **"GitHub"**
   - Authorize Netlify (if needed)
   - Select repository: **"RF-PRICING-PORTAL-2.0"** (or your repo name)
   - Select branch: **"main"**
   - Click **"Save"**

4. **Verify Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Branch: `main`

5. **Trigger Deploy**
   - Go to **"Deploys"** tab
   - Click **"Trigger deploy"** → **"Deploy site"**
   - Wait 2-3 minutes

---

### Option 2: Manual Deploy (Quick Fix)

If you just need to deploy NOW without waiting for GitHub:

1. **Build Locally**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   ```bash
   npx netlify-cli deploy --prod --dir=dist
   ```
   
   Or if you have Netlify CLI installed:
   ```bash
   netlify deploy --prod --dir=dist
   ```

---

### Option 3: Reconnect GitHub (If Already Connected But Not Working)

1. **Go to Netlify Dashboard**
   - Site → **"Site settings"** → **"Build & deploy"** → **"Continuous Deployment"**

2. **Disconnect and Reconnect**
   - Click **"Disconnect repository"**
   - Confirm disconnection
   - Click **"Link to Git provider"**
   - Choose **"GitHub"**
   - Select your repository again
   - Click **"Save"**

3. **Trigger Deploy**
   - Go to **"Deploys"** tab
   - Click **"Trigger deploy"** → **"Clear cache and deploy site"**

---

### Option 4: Check GitHub Webhook (If Connected But Not Auto-Deploying)

1. **Go to GitHub**
   - Open your repository: `https://github.com/YOUR_USERNAME/RF-PRICING-PORTAL-2.0`
   - Click **"Settings"** tab
   - Click **"Webhooks"** in left sidebar

2. **Check Netlify Webhook**
   - You should see a webhook from Netlify
   - If missing, reconnect in Netlify (Option 3)

3. **Test Webhook**
   - Make a small change to a file
   - Commit and push to GitHub
   - Check Netlify **"Deploys"** tab - should auto-deploy

---

## Verify Everything Works

### Check 1: Netlify Connection Status
- ✅ Site settings → Build & deploy → Continuous Deployment
- ✅ Should show: "Connected to GitHub"
- ✅ Repository: `YOUR_USERNAME/RF-PRICING-PORTAL-2.0`
- ✅ Branch: `main`

### Check 2: Environment Variables
- ✅ Site settings → Environment variables
- ✅ Should have:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### Check 3: Build Settings
- ✅ Site settings → Build & deploy → Build settings
- ✅ Build command: `npm run build`
- ✅ Publish directory: `dist`

### Check 4: Test Auto-Deploy
1. Make a small change (add a comment to any file)
2. Push to GitHub:
   ```bash
   git add .
   git commit -m "Test deploy"
   git push origin main
   ```
3. Check Netlify → Deploys tab
4. Should see new deployment starting automatically

---

## Common Issues & Fixes

### Issue: "No repository connected"
**Fix**: Follow Option 1 above

### Issue: "Build failed"
**Fix**: 
- Check build logs in Netlify
- Verify environment variables are set
- Check `netlify.toml` is correct

### Issue: "Deploy succeeded but site not updating"
**Fix**:
- Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear Netlify cache: Deploys → Trigger deploy → Clear cache and deploy

### Issue: "GitHub push not triggering deploy"
**Fix**:
- Check webhook in GitHub (Option 4)
- Reconnect repository (Option 3)
- Manually trigger deploy: Deploys → Trigger deploy

---

## Quick Command Reference

```bash
# Build locally
npm run build

# Deploy to Netlify (manual)
npx netlify-cli deploy --prod --dir=dist

# Or with Netlify CLI installed
netlify deploy --prod --dir=dist

# Push to GitHub (triggers auto-deploy if connected)
git add .
git commit -m "Your message"
git push origin main
```

---

## Need More Help?

1. **Check Netlify Status**: https://www.netlifystatus.com
2. **Check Build Logs**: Netlify → Deploys → Click on failed deploy → View logs
3. **Netlify Support**: https://www.netlify.com/support

---

## ✅ Success Checklist

- [ ] Netlify connected to GitHub repository
- [ ] Branch set to `main`
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Environment variables set
- [ ] Test push triggers auto-deploy
- [ ] Site updates after deploy
