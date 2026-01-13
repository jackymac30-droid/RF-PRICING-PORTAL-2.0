# 🔧 RUN SEED NOW - AUTOMATIC FIX

## Just Run This Command:

```bash
npx tsx demo-magic-button.ts
```

That's it. The script will:
1. ✅ Check for .env file
2. ✅ Load your Supabase credentials
3. ✅ Seed all 8 weeks, 5 suppliers, 8 items
4. ✅ Show you if it worked

---

## If It Says "Missing Credentials":

**Create `.env` file in this folder with:**
```
SUPABASE_URL=your-url-here
SUPABASE_SERVICE_ROLE_KEY=your-key-here
```

**Get your keys from:**
- Supabase Dashboard → Settings → API
- Copy "Project URL" → SUPABASE_URL
- Copy "service_role" key (SECRET) → SUPABASE_SERVICE_ROLE_KEY

---

## After Seeding:

1. Go to Netlify URL
2. Hard refresh: `Ctrl+Shift+R`
3. Should see all 8 weeks!

---

**That's it. Just run the command above.**
