# Preorder Date Limit Implementation

## ✅ Implementation Complete

### **Overview**
Integrated the PreorderSettings API to restrict calendar date selection in Home and Cart screens. Users can now only select dates from **today** to the **max_preorder_date** returned by the API.

---

## **What Was Done**

### **1. Added PreorderSettings API Endpoint**
**File**: `src/services/api/homeApi.ts`

- Added `getPreorderSettings` query endpoint
- Fetches: `GET /api/settings/preorder-limit`
- Returns:
  ```json
  {
    "preorder_limit_weeks": 1,
    "max_preorder_date": "2026-01-02"
  }
  ```
- Exported `useGetPreorderSettingsQuery` hook

### **2. Updated CalendarDropdown Component**
**File**: `src/components/common/CalendarDropdown.tsx`

- Added `maxDate?: Date` prop to interface
- Updated `isDateDisabled` function to check:
  - ✅ Disable dates **before today**
  - ✅ Disable dates **after maxDate** (if provided)
  - ✅ Enable dates between today and maxDate

### **3. Updated HomeScreen**
**File**: `src/features/Home/screens/HomeScreen.tsx`

- Imported `useGetPreorderSettingsQuery`
- Fetched preorder settings
- Passed `maxDate` to `CalendarDropdown`:
  ```tsx
  maxDate={
    preorderSettingsResp?.data?.max_preorder_date
      ? new Date(preorderSettingsResp.data.max_preorder_date)
      : undefined
  }
  ```

### **4. Updated CartScreen**
**File**: `src/features/Cart/screens/CartScreen.tsx`

- Imported `useGetPreorderSettingsQuery`
- Fetched preorder settings
- Passed `maxDate` to `CalendarDropdown` (same as HomeScreen)

---

## **How It Works**

### **Date Selection Logic:**

1. **API Call**: On screen load, fetch `/api/settings/preorder-limit`
2. **Parse Max Date**: Extract `max_preorder_date` from response (e.g., "2026-01-02")
3. **Calendar Restriction**:
   - **Enabled dates**: From today to max_preorder_date
   - **Disabled dates**: 
     - All dates before today
     - All dates after max_preorder_date

### **Visual Behavior:**

- ✅ **Enabled dates**: Full opacity, clickable
- ❌ **Disabled dates**: 30% opacity, not clickable
- 🗓️ **Today**: Bold with border
- 🔵 **Selected**: Blue background

---

## **Example Scenario**

**Today's Date**: 2025-12-26  
**Max Preorder Date**: 2026-01-02  

**Calendar Behavior:**
- ❌ **2025-12-25 and before**: Disabled (past dates)
- ✅ **2025-12-26 to 2026-01-02**: Enabled (valid preorder range)
- ❌ **2026-01-03 and after**: Disabled (beyond max preorder date)

---

## **Files Modified**

1. `src/services/api/homeApi.ts` - Added PreorderSettings endpoint
2. `src/components/common/CalendarDropdown.tsx` - Added maxDate restriction
3. `src/features/Home/screens/HomeScreen.tsx` - Integrated preorder settings
4. `src/features/Cart/screens/CartScreen.tsx` - Integrated preorder settings

---

## **Benefits**

- ✅ Prevents users from selecting invalid preorder dates
- ✅ Server-controlled preorder limits (dynamic)
- ✅ Consistent across Home and Cart screens
- ✅ No breaking changes to existing functionality
- ✅ Graceful fallback if API fails (allows all future dates)

---

## **Testing Recommendations**

1. **Test with different max dates**: Verify calendar restricts correctly
2. **Test API failure**: Ensure calendar still works without max date
3. **Test date changes**: Confirm cart/allowance updates work with restricted dates
4. **Test edge cases**: Today, max date, dates beyond max date

---

## **Note on Allowance API**

⚠️ **Known Issue**: The allowance API (`/api/employee/allowance/:id`) currently **ignores the Preorder_date parameter** and always returns today's allowance data. This is a backend issue that needs to be fixed for date-specific allowance to work correctly.

**Frontend is ready** - once backend accepts the `Preorder_date` parameter, allowance will automatically update for different dates.
