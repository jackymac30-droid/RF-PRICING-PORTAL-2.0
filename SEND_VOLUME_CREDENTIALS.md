# Send Volume to Suppliers - Credentials & Requirements

## **User Authentication Requirements**

### **1. Login Credentials**
- **User Type**: Must be logged in as **RF user** (role: `'rf'`)
- **Access Code**: `RF2024` (default, can be set via `VITE_ACCESS_CODE` env var)
- **Password**: Optional in dev mode, required in production
- **Session**: Must have valid session with `user_name` field

### **2. Login Process**
1. Enter access code: `RF2024`
2. Select user: Choose "RF" from dropdown
3. Enter password (if required)
4. Click "Login"

### **3. Session Structure**
```typescript
{
  user_id: string,
  user_name: string,  // Required for send volume
  role: 'rf',          // Must be 'rf' (not 'supplier')
  supplier_id?: string // Not needed for RF users
}
```

## **Week Status Requirements**

### **Before Sending Volume:**
1. **Week Status**: Must be `'finalized'` (not `'open'` or `'closed'`)
2. **Pricing**: At least one quote must have `rf_final_fob` set
3. **Allocation**: At least one SKU must have volume allocated (`awarded_volume > 0`)
4. **Completion**: All SKUs must have `totalAllocated = volumeNeeded`
5. **Finalization**: All allocated quotes must be finalized (no PRELIM quotes with allocated volume)

## **Database Permissions**

The RPC function `submit_allocations_to_suppliers` is granted to:
- `anon` (anonymous users)
- `authenticated` (any authenticated user)

**Note**: The function uses `SECURITY DEFINER`, so it runs with elevated privileges regardless of caller.

## **What Happens When You Send Volume**

1. **Copies `awarded_volume` → `offered_volume`** for all quotes with allocated volume
2. **Resets supplier response fields**:
   - `supplier_volume_approval = 'pending'`
   - `supplier_volume_response = NULL`
   - `supplier_volume_accepted = NULL`
   - `supplier_volume_response_notes = NULL`
3. **Updates week**:
   - `allocation_submitted = true`
   - `allocation_submitted_at = CURRENT_TIMESTAMP`
   - `allocation_submitted_by = userName` (from session)

## **Error Messages**

- "Week must be finalized before submitting allocations" → Week status is not 'finalized'
- "No volume allocations found" → No quotes have `awarded_volume > 0`
- "All allocated quotes must be finalized" → Some allocated quotes are still PRELIM
- "Complete allocation for all SKUs" → `totalAllocated ≠ volumeNeeded` for some SKU

## **Test Credentials (Dev Mode)**

In development mode (`localhost` or `VITE_DEV_MODE=true`):
- Access code: `RF2024`
- User: Select "RF"
- Password: Optional (can be empty)

## **Production Credentials**

Set these environment variables:
- `VITE_ACCESS_CODE`: Custom access code (default: `RF2024`)
- Password: Required (set in login system)

