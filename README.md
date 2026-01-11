# RF-PRICING-PORTAL-2.0

RF Pricing Dashboard with AI-powered analytics and predictions.

## Features

- 🤖 AI-powered price predictions with interactive trend charts
- 📊 Summary statistics dashboard
- 🔍 Filtering and sorting capabilities
- 🎯 Confidence gauges and expandable forecast details
- 📈 Complete historical data integration
- 🎨 Enhanced UI/UX with dark theme

## Tech Stack

- React + TypeScript
- Supabase (Database & Auth)
- Tailwind CSS
- Vite

## Quick Demo Setup (ZERO EFFORT)

1. Open `demo-magic-button.ts`
2. Replace `SERVICE_ROLE_KEY` and `SUPABASE_URL` with your keys
3. Right-click file → "Run" (or terminal: `npx tsx demo-magic-button.ts`)
4. Hard refresh Netlify site: Ctrl+Shift+R / Cmd+Shift+R
5. Done!

See `DEMO.md` for full setup guide.

## Deployment

Deployed on Netlify with automatic builds from GitHub.

### Netlify Setup (One-Time):

1. **Connect GitHub**: Netlify Dashboard → Add new site → Import from GitHub → Select repository
2. **Set Environment Variables**: Site Settings → Environment Variables → Add:
   - `VITE_SUPABASE_URL` = Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = Supabase anon key (public)
   - (Optional) `SUPABASE_SERVICE_ROLE_KEY` = Service role key (SECRET - for seeding only, run locally)
3. **Build Settings** (auto-configured via `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Auto-deploy: Enabled (deploys on push to `main` branch)

### After Push to GitHub:

1. **Auto-deploy**: Netlify automatically deploys from GitHub (branch: `main`)
2. **If old version shows**: 
   - Netlify Dashboard → Deploys → "Trigger deploy" → Check "Clear cache and deploy site" → Deploy
   - Wait 2-3 minutes
3. **Hard refresh browser**: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

### Netlify URL:

Your site: `https://your-site.netlify.app`

**After seeding (run `demo-magic-button.ts` locally), hard refresh Netlify URL to see demo data.**
