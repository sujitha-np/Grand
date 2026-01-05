# Messages Screen - Using Existing API

## Summary
Keeping the existing homeApi and just adding getMessages query to fetch messages.

## Changes Made:

### 1. Added to homeApi.ts (line ~166):
```typescript
// POST /api/employee/messages/conversations - Get all messages
getMessages: builder.query<ApiResponse<any[]>, { employee_id: number }>({
  query: (body) => ({
    url: `${API_PREFIX}/employee/messages/conversations`,
    method: 'POST',
    body,
  }),
  providesTags: ['Messages'],
}),
```

### 2. Add to homeApi.ts exports (line ~245):
Add `useGetMessagesQuery,` between `useUpdateProfileMutation,` and `useSendMessageMutation,`

```typescript
export const {
  useProfileQuery,
  useCategoriesQuery,
  useGetAllowancesQuery,
  useGetLoyaltyPointsQuery,
  useProductsQuery,
  useOffersQuery,
  useOfferProductsQuery,
  useUpdateProfileMutation,
  useGetMessagesQuery,  // ← ADD THIS LINE
  useSendMessageMutation,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useSubmitFeedbackMutation,
} = homeApi;
```

### 3. Update MessagesScreen.tsx (line ~38):
Change `useGetAllMessagesQuery` to `useGetMessagesQuery`:

```typescript
// Fetch messages from API
const { data: messagesResponse, isLoading, refetch } = useGetMessagesQuery(
  { employee_id: employeeId || 0 },
  { skip: !employeeId }
);
```

### 4. Update MessagesScreen.tsx sendMessage (line ~68):
Add back the required fields:

```typescript
const result = await sendMessage({
  employee_id: employeeId,
  employer_id: 1,
  message: message.trim(),
  subject: null,
  status: 1,
  is_read: 0,
}).unwrap();
```

## API Response Format:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "message": "hi admin",
      "sender_type": "employee",
      "created_at": "2025-12-17 13:31:26"
    }
  ]
}
```

## Files to Delete:
- `/src/services/api/messagesApi.ts` (not needed)
- Remove messagesApi from store.ts

This keeps everything in the existing homeApi as requested!
