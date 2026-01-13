#!/bin/bash
# ONE-STOP FIX SCRIPT — Run this to make app demo-ready

echo "🚀 ONE-STOP FIX — Making app demo-ready..."
echo ""

# Step 1: Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating template..."
    cat > .env << EOF
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_DEV_MODE=true
EOF
    echo "✅ Created .env template. Please fill in your Supabase credentials!"
    echo ""
fi

# Step 2: Check if demo-magic-button.ts has keys
if grep -q "YOUR-SERVICE-ROLE-KEY-HERE" demo-magic-button.ts || grep -q "YOUR-SUPABASE-URL-HERE" demo-magic-button.ts; then
    echo "⚠️  demo-magic-button.ts needs your Supabase keys!"
    echo "   Open demo-magic-button.ts and replace:"
    echo "   - SERVICE_ROLE_KEY with your service role key"
    echo "   - SUPABASE_URL with your Supabase URL"
    echo ""
    read -p "Press Enter after you've updated demo-magic-button.ts..."
fi

# Step 3: Run seed script
echo "📦 Step 1: Seeding database..."
npx tsx demo-magic-button.ts

if [ $? -eq 0 ]; then
    echo "✅ Database seeded successfully!"
else
    echo "❌ Seed failed. Check your Supabase keys in demo-magic-button.ts"
    exit 1
fi

echo ""
echo "📋 Step 2: Verifying environment variables..."
if grep -q "your-project" .env || grep -q "your-anon-key" .env; then
    echo "⚠️  .env file has placeholder values. Please update with real credentials!"
else
    echo "✅ .env file looks good"
fi

echo ""
echo "🌐 Step 3: Building app..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Check for errors above."
    exit 1
fi

echo ""
echo "✅ ONE-STOP FIX COMPLETE!"
echo ""
echo "📋 Next steps:"
echo "1. Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"
echo "2. Check console for: 'Fetched ALL weeks: [1,2,3,4,5,6,7,8]'"
echo "3. Verify all 8 weeks show in dropdown"
echo "4. Test login and navigation"
echo ""
echo "🚀 App should now be demo-ready!"
