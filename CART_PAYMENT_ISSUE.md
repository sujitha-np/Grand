# Cart Clearing Issue - BACKEND PROBLEM

## ⚠️ Critical Issue: Backend Clears Cart Prematurely

### The Problem
The backend is clearing the cart **IMMEDIATELY** when `POST /api/employee/place-order` is called, regardless of whether payment is required or completed. This causes:

1. User adds items to cart (e.g., 32 QAR extra payment)
2. User clicks "Proceed to checkout"
3. Frontend calls `POST /api/employee/place-order`
4. **Backend clears the cart RIGHT NOW** ❌
5. Frontend navigates to payment screen
6. User cancels payment
7. User returns to cart → **Cart is empty** ❌

### Why Frontend Can't Fix This
- The cart data is deleted from the database when placeOrder is called
- Frontend can cache the UI, but can't restore backend data
- Any refresh/refetch will show empty cart from backend

## Current Frontend Workarounds (Partial)

### 1. Disabled Auto-Refetch on Screen Focus
```tsx
// Commented out in CartScreen.tsx
// useFocusEffect(
//   React.useCallback(() => {
//     refetch();
//   }, [])
// );
```
**Effect**: Cart won't automatically refresh when returning from payment screen
**Limitation**: If user manually pulls to refresh or app restarts, cart is still empty

### 2. Removed Cart Invalidation from placeOrder  
```tsx
// In cartApi.ts - placeOrder mutation
// Don't invalidate cart tags - will be done after payment success
```
**Effect**: Cart cache isn't cleared until payment succeeds
**Limitation**: Doesn't prevent backend from clearing the cart

### 3. Manual Cart Invalidation on Payment Success
```tsx
// In PaymentWebViewScreen.tsx
if (employeeId) {
  cartApi.util.invalidateTags(['Cart']);
  await refetchAllowance();
}
```
**Effect**: Cart properly clears only after successful payment
**Works**: ✅ This part works correctly

## ❌ What Doesn't Work
- Showing cached cart data (user can't checkout with deleted backend data)
- Passing cart in navigation (can't restore to backend)
- Local storage of cart (backend won't accept it)

## ✅ REQUIRED Backend Fix

The backend MUST be modified to follow this flow:

### Current (Wrong) Backend Flow:
```
placeOrder() {
    createOrder();
    clearCart();  ← BAD! Clears immediately
    return payment_url;
}
```

### Required (Correct) Backend Flow:
```
placeOrder() {
    createOrder();
    
    if (requires_payment) {
        // DON'T clear cart yet!
        return payment_url;
    } else {
        clearCart();  // Safe to clear (no payment needed)
        return success;
    }
}

// Payment webhook
onPaymentSuccess(order_id) {
    clearCart();  // Clear cart NOW
    updateOrderStatus();
}

onPaymentFailure(order_id) {
    deleteOrder();  // Remove failed order
    // Cart remains intact for user to try again
}
```

## Testing After Backend Fix

Once backend is fixed, test these scenarios:

### Test 1: Payment Cancelled
1. Add items requiring payment
2. Click checkout
3. Cancel payment
4. **Expected**: Cart still has items ✅
5. User can modify or retry

### Test 2: Payment Success
1. Complete payment
2. **Expected**: Cart is empty ✅
3. Order appears in Orders screen

### Test 3: No Payment Needed
1. Add items within allowance
2. Click checkout  
3. **Expected**: Cart is empty ✅
4. Order complete immediately

## Summary

📋 **This is a BACKEND issue that requires backend changes**
❌ **Frontend cannot fully solve this problem**
⏳ **Frontend workarounds only delay the issue**
✅ **Backend team must modify the placeOrder API**

## Contact Backend Team

Show them this document and request:
1. Don't clear cart when `requires_payment = true`
2. Only clear cart in payment success webhook
3. Delete incomplete order in payment failure webhook
