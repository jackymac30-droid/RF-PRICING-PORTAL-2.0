# 🚀 QUICK FIX - SEED DATABASE NOW

## Your .env file is missing the Service Role Key

### Step 1: Get Your Service Role Key

1. Go to: https://supabase.com/dashboard
2. Click your project
3. Go to **Settings** → **API**
4. Scroll down to **Project API keys**
5. Find **service_role** key (it's the SECRET one, starts with `eyJ...`)
6. **COPY IT** (this is different from the anon key)

### Step 2: Add to .env File

Open `.env` file and add this line:

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Replace `your-service-role-key-here` with the actual key you copied.

### Step 3: Run Seeding Script

In terminal, run:

```bash
npx tsx demo-magic-button.ts
```

### Step 4: Hard Refresh Browser

Press `Ctrl+Shift+R` to hard refresh localhost.

---

**That's it!** The database will be populated with all 8 weeks, 5 suppliers, and 8 items.
