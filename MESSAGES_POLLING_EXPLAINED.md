# Messages Auto-Refresh - How It Works

## Current Implementation ✅

The `pollingInterval: 5000` you have now **already works correctly**!

### How RTK Query Polling Works:

1. **When Messages screen is ACTIVE** ✅
   - Calls API every 5 seconds
   - Gets new messages from admin
   - Updates UI automatically

2. **When you navigate AWAY** ✅
   - Polling STOPS automatically
   - No API calls made
   - Saves battery and data

3. **When you come BACK** ✅
   - Polling RESUMES automatically
   - Fetches latest messages
   - Continues every 5 seconds

## Proof It Works:

```tsx
const { data: messagesResponse, isLoading, refetch } = useGetMessagesQuery(
  { employee_id: employeeId || 0 },
  { 
    skip: !employeeId,
    pollingInterval: 5000, // ✅ Only polls when component is mounted
  }
);
```

**Component mounted** (Messages screen visible) → Polling ON ✅
**Component unmounted** (navigated away) → Polling OFF ✅

## Test It:

1. Open Messages screen
2. Check browser DevTools Network tab
3. See API calls every 5 seconds: ✅
   ```
   POST /api/employee/messages/conversations (every 5s)
   ```
4. Navigate to Home screen
5. API calls STOP ✅
6. Go back to Messages
7. API calls RESUME ✅

## Optional: Even More Control

If you want to ALSO pause when app goes to background:

### Add to MessagesScreen.tsx (line ~30):

```tsx
import { useIsFocused } from '@react-navigation/native';

export const MessagesScreen = () => {
  const isFocused = useIsFocused();
  
  const { data: messagesResponse, isLoading, refetch } = useGetMessagesQuery(
    { employee_id: employeeId || 0 },
    { 
      skip: !employeeId || !isFocused, // ← Pause when screen not focused
      pollingInterval: 5000,
    }
  );
```

## Summary:

✅ **Current setup is PERFECT** - Already only polls when Messages screen is active
✅ **No changes needed** - RTK Query handles this automatically
✅ **Battery efficient** - Stops when you navigate away
✅ **Real-time updates** - Admin messages appear within 5 seconds

Your implementation is already correct! 🎉
