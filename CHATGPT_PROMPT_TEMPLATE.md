# 🤖 ChatGPT Prompt Template
## Copy-Paste Ready Prompts for Your Project

---

## 📋 **QUICK SYSTEM CONTEXT** (Copy this first)

```
I'm working on a Robinson Fresh pricing and volume allocation system built with React + TypeScript + Vite + Supabase.

SYSTEM OVERVIEW:
- RF managers negotiate pricing with suppliers and allocate volume
- Suppliers submit pricing and respond to volume offers
- Week lifecycle: 'open' → 'finalized' → 'closed'
- Multi-supplier per SKU supported (each supplier can price same SKU)

KEY DATABASE FIELDS:
- weeks.status: 'open' | 'finalized' | 'closed'
- quotes.rf_final_fob: Final price RF agrees to pay (per quote)
- quotes.awarded_volume: RF's draft allocation (sandbox)
- quotes.offered_volume: Volume sent to supplier (final)
- quotes.supplier_volume_accepted: Supplier's response
- week_item_volumes.volume_needed: Total cases needed per SKU

KEY COMPONENTS:
- RFDashboard.tsx: Main RF interface
- AwardVolume.tsx: Volume allocation sandbox with live calculations
- SupplierDashboard.tsx: Supplier interface

WORKFLOW:
1. RF creates week (status: 'open')
2. Suppliers submit pricing
3. RF finalizes pricing (status: 'finalized')
4. RF enters volume needs
5. RF allocates volume (sandbox - live calculations)
6. RF sends allocations to suppliers
7. Suppliers respond (accept/revise/decline)
8. RF handles responses and closes loop (status: 'closed')
```

---

## 🎯 **COMMON PROMPT TEMPLATES**

### **Template 1: Understanding a Feature**
```
[PASTE SYSTEM CONTEXT ABOVE]

I need help understanding: [FEATURE NAME]

Current behavior: [What happens now]
Expected behavior: [What should happen]
Where it's located: [Component/file name]
What I've tried: [Any attempts to fix]

Can you explain how this works and help me [fix/improve/understand] it?
```

### **Template 2: Debugging an Issue**
```
[PASTE SYSTEM CONTEXT ABOVE]

ISSUE: [Brief description]

Steps to reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected result: [What should happen]
Actual result: [What actually happens]
Error messages: [Any console errors]

Relevant files:
- [File 1]: [What it does]
- [File 2]: [What it does]

What should I check? What's likely causing this?
```

### **Template 3: Adding a Feature**
```
[PASTE SYSTEM CONTEXT ABOVE]

FEATURE REQUEST: [Feature name]

What I want:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

Where it should go:
- Component: [Component name]
- User flow: [When/how user accesses it]

Constraints:
- [Any limitations or requirements]

Can you help me implement this? What files need to change?
```

### **Template 4: Code Review**
```
[PASTE SYSTEM CONTEXT ABOVE]

I've made changes to [FILE NAME] to [WHAT YOU DID].

Here's the code:
[PASTE CODE HERE]

Questions:
1. [Question 1]
2. [Question 2]

Is this the right approach? Any issues or improvements?
```

### **Template 5: Understanding Data Flow**
```
[PASTE SYSTEM CONTEXT ABOVE]

I need to understand the data flow for: [FEATURE/ACTION]

When user does: [Action]
What happens:
- [Step 1]
- [Step 2]
- [Step 3]

What database fields are updated?
What UI components are affected?
What state changes occur?

Can you trace through the complete flow?
```

---

## 🔍 **SPECIFIC USE CASES**

### **Use Case 1: Volume Tab Not Loading**
```
[PASTE SYSTEM CONTEXT ABOVE]

ISSUE: Volume tab doesn't load after finalizing pricing.

Current state:
- Week status: 'open'
- I've finalized one supplier's pricing (rf_final_fob is set)
- Volume tab shows "Volume Allocation Not Available Yet"

The code checks: currentStatus === 'finalized' || hasFinalizedQuotes

Question: Why isn't hasFinalizedQuotes being set to true? What's the exact condition?
```

### **Use Case 2: Live Calculations Not Updating**
```
[PASTE SYSTEM CONTEXT ABOVE]

ISSUE: Live calculations in AwardVolume sandbox don't update when I type.

Current code calculates:
- totalAwardedCases = sum of sandboxAwardedVolumes
- remainingCases = sandboxTotalRequired - totalAwardedCases
- weightedAvgPrice = totalCost / totalAwardedCases

The updateSandboxAwardedVolume function updates the Map, but UI doesn't re-render.

Question: Why isn't React detecting the state change? Should I use a different state structure?
```

### **Use Case 3: Adding Validation**
```
[PASTE SYSTEM CONTEXT ABOVE]

FEATURE: Add validation that total awarded volume cannot exceed supplier's available capacity.

Current: No capacity limits - can award any volume
Desired: Show warning if awarded > supplier_capacity (if field exists)

Where should this validation go?
- In updateSandboxAwardedVolume function?
- In the UI as a warning message?
- Both?

What's the best approach?
```

---

## 📊 **DATA STRUCTURE REFERENCE**

```
Week {
  id: string
  week_number: number
  status: 'open' | 'finalized' | 'closed'
  start_date: date
  end_date: date
  allocation_submitted: boolean
  emergency_unlock_enabled: boolean
}

Quote {
  id: string
  week_id: string
  item_id: string
  supplier_id: string
  supplier_fob: number | null
  supplier_dlvd: number | null
  rf_counter_fob: number | null
  supplier_revised_fob: number | null
  rf_final_fob: number | null  // Final price
  awarded_volume: number | null  // Draft allocation
  offered_volume: number | null  // Sent to supplier
  supplier_volume_accepted: number | null  // Supplier's response
  supplier_volume_response: 'accept' | 'update' | 'decline' | null
}

WeekItemVolume {
  week_id: string
  item_id: string
  volume_needed: number  // Total cases needed
}
```

---

## 🎯 **QUICK REFERENCE: COMMON QUESTIONS**

### **Q: How do I check if pricing is finalized?**
```
Check: quotes.rf_final_fob !== null AND quotes.rf_final_fob > 0
OR: weeks.status === 'finalized'
```

### **Q: How do I unlock the volume tab?**
```
Condition: weeks.status === 'finalized' OR at least one quote has rf_final_fob
Action: Finalize at least one quote → Click "Finalize Week"
```

### **Q: What's the difference between awarded_volume and offered_volume?**
```
awarded_volume: Draft allocation (sandbox) - RF can edit freely
offered_volume: Final allocation sent to supplier - requires response handling
```

### **Q: How do live calculations work?**
```
Every keystroke → updateSandboxAwardedVolume() → Updates Map state → 
React re-renders → Calculations recalculate → UI updates
```

---

## 💡 **TIPS FOR CHATGPT INTERACTIONS**

1. **Always paste the system context first** - Helps ChatGPT understand the domain
2. **Be specific about file names** - Include component/file paths
3. **Include error messages** - Copy exact console errors
4. **Show what you've tried** - Helps avoid suggesting things you already did
5. **Ask for code examples** - "Show me how to..." gets better results than "How do I..."
6. **Request explanations** - "Explain why..." helps understand root causes

---

## 🚀 **READY-TO-USE PROMPTS**

### **Prompt A: Fix Volume Tab**
```
[PASTE SYSTEM CONTEXT]

The volume tab shows "Volume Allocation Not Available Yet" even though I've finalized pricing.

Week status is 'open', but I've set rf_final_fob for one supplier.

The AwardVolume component checks: hasFinalizedQuotes state

Can you trace through the code and tell me:
1. Where hasFinalizedQuotes is set
2. Why it might not be updating
3. What the exact condition should be to unlock the volume tab
```

### **Prompt B: Add Feature**
```
[PASTE SYSTEM CONTEXT]

I want to add a "Fill Cheapest" button that auto-allocates all volume to the lowest-price supplier per SKU.

Current: Manual allocation in sandbox
Desired: One-click to allocate all volume to cheapest supplier

Where should this button go?
What function should it call?
How should it update the sandbox state?

Show me the implementation.
```

### **Prompt C: Debug Calculation**
```
[PASTE SYSTEM CONTEXT]

The weighted average price calculation seems wrong.

Formula: sum(price × volume) / sum(volume)

Example:
- Supplier A: $10 × 300 cases = $3,000
- Supplier B: $12 × 700 cases = $8,400
- Total: $11,400 / 1000 = $11.40

But UI shows: $11.25

Can you check the calculation code in AwardVolume.tsx and find the bug?
```

---

**Copy any of these templates and fill in your specific details!**

