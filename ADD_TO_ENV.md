# ✅ ADD THESE TO YOUR .env FILE

## Open your `.env` file and add these two lines:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Where to get the values:

1. **Go to:** https://supabase.com/dashboard
2. **Click your project**
3. **Click:** Settings → API
4. **Copy:**
   - "Project URL" → Use for `SUPABASE_URL`
   - "service_role" key (SECRET key, not anon key) → Use for `SUPABASE_SERVICE_ROLE_KEY`

## After adding them:

Run this command again:
```bash
npx tsx demo-magic-button.ts
```

---

**That's it!** Just add those two lines to your `.env` file.
