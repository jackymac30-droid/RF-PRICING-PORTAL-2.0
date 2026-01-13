# 🚀 HOW TO RUN SEEDING SCRIPT - COPY & PASTE GUIDE

## **OPTION 1: Use .env File (EASIEST - RECOMMENDED)**

### Step 1: Get Your Supabase Keys

1. Go to: **https://supabase.com/dashboard**
2. Click your project
3. Go to **Settings** → **API**
4. Copy these two values:
   - **Project URL** (starts with `https://`)
   - **service_role key** (SECRET key, starts with `eyJ...` - NOT the anon key!)

### Step 2: Create `.env` File

In the project root folder (`RF_PRICING_DASHBOARD`), create a file named `.env` (no extension, just `.env`)

**Copy and paste this into `.env`:**

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Replace:**
- `https://your-project-id.supabase.co` with your actual Project URL
- `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` with your actual service_role key

### Step 3: Run the Script

Open terminal in the project folder and run:

```bash
npx tsx demo-magic-button.ts
```

### Step 4: Hard Refresh Browser

Press `Ctrl+Shift+R` to hard refresh localhost.

---

## **OPTION 2: Edit demo-magic-button.ts Directly**

If you prefer not to use `.env`, you can edit the file directly:

1. Open `demo-magic-button.ts`
2. Find line 43: `'YOUR-SERVICE-ROLE-KEY-HERE'`
3. Replace it with your actual service_role key (keep the quotes)
4. Find line 49: `'YOUR-SUPABASE-URL-HERE'`
5. Replace it with your actual Supabase URL (keep the quotes)
6. Save the file
7. Run: `npx tsx demo-magic-button.ts`

---

## **WHAT THE SCRIPT DOES:**

✅ Creates 8 berry SKUs (Strawberry, Blueberry, Blackberry, Raspberry)
✅ Creates 5 suppliers (Berry Farms + 4 others)
✅ Creates 8 weeks (Weeks 1-7 finalized, Week 8 open)
✅ Creates quotes for all suppliers (Week 8 missing Berry Farms - intentional gap)
✅ Sets up full workflow: quoted → countered → finalized

---

## **TROUBLESHOOTING:**

**Error: "Missing Supabase credentials!"**
→ Make sure `.env` file exists and has both keys, OR edit `demo-magic-button.ts` directly

**Error: "relation does not exist"**
→ Run database migrations first (see SETUP_DATABASE_FROM_SCRATCH.md)

**Error: "permission denied"**
→ Make sure you're using the **service_role** key (SECRET), not the anon key

**Error: "JWT expired"**
→ Get a fresh service_role key from Supabase Dashboard

---

**That's it!** Once the script runs successfully, your database will be populated and ready for demo.
