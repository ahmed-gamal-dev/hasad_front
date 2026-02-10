import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

export interface User {
  id: number;
  name: string;
  email: string;
  roles: Array<{
    id: number;
    name: string;
    guard_name: string;
  }>;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      // Save to cookies
      Cookies.set('token', action.payload.token, { expires: 7 });
      Cookies.set('user', JSON.stringify(action.payload.user), { expires: 7 });
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      // Remove from cookies
      Cookies.remove('token');
      Cookies.remove('user');
    },
    rehydrateAuth: (state) => {
      const token = Cookies.get('token');
      const userStr = Cookies.get('user');

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          state.user = user;
          state.token = token;
          state.isAuthenticated = true;
        } catch (error) {
          console.error('Error parsing user data:', error);
          Cookies.remove('token');
          Cookies.remove('user');
        }
      }
    },
  },
});

export const { setCredentials, logout, rehydrateAuth } = authSlice.actions;
export default authSlice.reducer;