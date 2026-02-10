import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import Cookies from 'js-cookie';

// Rehydrate auth state from cookies before store creation
const preloadedState = {
  auth: {
    user: null as any,
    token: null as string | null,
    isAuthenticated: false,
  },
};

// Check if we're on the client side
if (typeof window !== 'undefined') {
  const token = Cookies.get('token');
  const userStr = Cookies.get('user');

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      preloadedState.auth = {
        user,
        token,
        isAuthenticated: true,
      };
    } catch (error) {
      console.error('Error parsing user data:', error);
      Cookies.remove('token');
      Cookies.remove('user');
    }
  }
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState, // ✅ Load saved state immediately
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;