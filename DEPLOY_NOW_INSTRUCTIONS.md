# 🚀 DEPLOY TO NETLIFY NOW - Step by Step

## Option 1: Quick Manual Deploy (2 Minutes)

### Windows (PowerShell):
```powershell
npm run build
npx netlify-cli deploy --prod --dir=dist
```

Or run the script:
```powershell
.\deploy-now.ps1
```

### Mac/Linux:
```bash
npm run build
npx netlify-cli deploy --prod --dir=dist
```

**First time?** You'll need to login:
```bash
npx netlify-cli login
```

---

## Option 2: Connect GitHub for Auto-Deploy

### Step 1: Go to Netlify
1. Open: https://app.netlify.com
2. Sign in

### Step 2: Connect Your Site
1. Click your site name
2. Go to **"Site settings"** (top right)
3. Click **"Build & deploy"** → **"Continuous Deployment"**
4. Click **"Link to Git provider"**
5. Choose **"GitHub"**
6. Authorize Netlify (if needed)
7. Select your repository: **"RF-PRICING-PORTAL-2.0"**
8. Select branch: **"main"**
9. Click **"Save"**

### Step 3: Verify Settings
- Build command: `npm run build`
- Publish directory: `dist`
- Branch: `main`

### Step 4: Test It
1. Make a small change to any file
2. Push to GitHub:
   ```bash
   git add .
   git commit -m "Test deploy"
   git push origin main
   ```
3. Check Netlify → **"Deploys"** tab
4. Should see new deployment starting automatically!

---

## Option 3: Use Package.json Script

Already configured! Just run:
```bash
npm run deploy
```

This builds and deploys in one command.

---

## ✅ Verify Deployment

1. **Check Netlify Dashboard**
   - Go to: https://app.netlify.com
   - Click your site
   - Check **"Deploys"** tab
   - Should see latest deployment

2. **Visit Your Site**
   - Click **"Open production deploy"** or use your site URL
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

3. **Check Environment Variables**
   - Site settings → Environment variables
   - Should have:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

---

## 🔧 Troubleshooting

### "Command not found: netlify-cli"
**Fix**: Install globally or use npx
```bash
npm install -g netlify-cli
```

### "Not logged in"
**Fix**: Login first
```bash
npx netlify-cli login
```

### "Build failed"
**Fix**: Check build logs in Netlify dashboard
- Usually missing environment variables
- Or build command error

### "Site not updating"
**Fix**: 
1. Hard refresh browser: Ctrl+Shift+R
2. Clear Netlify cache: Deploys → Trigger deploy → Clear cache

---

## 📋 Quick Checklist

- [ ] Code is ready (all fixes applied)
- [ ] Build works locally: `npm run build`
- [ ] Environment variables set in Netlify
- [ ] Deployed to Netlify (manual or auto)
- [ ] Site is live and working
- [ ] GitHub connected (for future auto-deploys)

---

## 🎯 Recommended: Do Both

1. **Deploy manually NOW** (Option 1) - Get your code live immediately
2. **Connect GitHub** (Option 2) - Auto-deploy on future pushes

Best of both worlds! 🚀
