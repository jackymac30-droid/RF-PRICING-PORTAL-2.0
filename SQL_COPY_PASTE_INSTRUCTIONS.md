# 📋 SQL COPY & PASTE INSTRUCTIONS

## **STEP-BY-STEP GUIDE**

### Step 1: Open the SQL File
1. In your project folder, open the file: **`COPY_PASTE_SEED.sql`**
2. This file contains ALL the SQL code you need

### Step 2: Copy ALL the SQL Code
1. Open `COPY_PASTE_SEED.sql` in any text editor
2. Press `Ctrl+A` (or `Cmd+A` on Mac) to select ALL
3. Press `Ctrl+C` (or `Cmd+C` on Mac) to copy

### Step 3: Go to Supabase SQL Editor
1. Go to: **https://supabase.com/dashboard**
2. Click your project
3. Click **SQL Editor** in the left sidebar
4. Click **New query** (or use the existing query box)

### Step 4: Paste and Run
1. Click in the SQL Editor text box
2. Press `Ctrl+V` (or `Cmd+V` on Mac) to paste
3. Click the **Run** button (or press `Ctrl+Enter`)
4. Wait for it to complete (may take 30-60 seconds)

### Step 5: Verify It Worked
You should see messages like:
- ✅ "8 items created"
- ✅ "5 suppliers created"
- ✅ "8 weeks created"
- ✅ "Quotes created"

### Step 6: Hard Refresh Your App
1. Go to your app (localhost or Netlify)
2. Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac) to hard refresh
3. You should now see all 8 weeks with data!

---

## **TROUBLESHOOTING**

**Error: "relation does not exist"**
→ Your database tables don't exist yet. You need to run migrations first.

**Error: "column already exists"**
→ That's OK! The script checks for existing columns. Just continue.

**Error: "duplicate key"**
→ Some data already exists. The script handles this - it's OK to run again.

**Nothing happens after clicking Run**
→ Wait 30-60 seconds. Large SQL scripts take time to execute.

---

## **WHAT THIS SQL DOES:**

✅ Creates 8 berry SKUs (Strawberry, Blueberry, Blackberry, Raspberry)
✅ Creates 5 suppliers (Berry Farms + 4 others)
✅ Creates 8 weeks (Weeks 1-7 finalized, Week 8 open)
✅ Creates quotes for all suppliers (Week 8 missing Berry Farms - intentional gap)
✅ Sets up full workflow: quoted → countered → finalized

---

**That's it!** Once the SQL runs successfully, your database will be populated.
