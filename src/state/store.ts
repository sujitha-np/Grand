/**
 * Redux Store Configuration
 */
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/Auth/authSlice';
import themeReducer from './themeSlice';
import { homeApi } from '../services/api/homeApi';
import { authApi } from '../services/api/authApi';
import { cartApi } from '../services/api/cartApi';
import { ordersApi } from '../services/api/ordersApi';
import { messagesApi } from '../services/api/messagesApi';
import { miscApi } from '../services/api/miscApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    [homeApi.reducerPath]: homeApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [messagesApi.reducerPath]: messagesApi.reducer,
    [miscApi.reducerPath]: miscApi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(
      homeApi.middleware,
      authApi.middleware,
      cartApi.middleware,
      ordersApi.middleware,
      messagesApi.middleware,
      miscApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
