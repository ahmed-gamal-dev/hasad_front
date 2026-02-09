'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
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

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is already logged in on mount
  useEffect(() => {
    const savedToken = Cookies.get('token');
    const savedUser = Cookies.get('user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        Cookies.remove('token');
        Cookies.remove('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    console.log('Login called with:', { newToken, newUser });
    
    // Update state
    setToken(newToken);
    setUser(newUser);
    
    // Save to cookies (expires in 7 days)
    Cookies.set('token', newToken, { expires: 7 });
    Cookies.set('user', JSON.stringify(newUser), { expires: 7 });
    
    console.log('Token and user saved to cookies');
    
    // Use setTimeout to ensure state is updated before navigation
    setTimeout(() => {
      console.log('Navigating to dashboard...');
      router.push('/dashboard');
    }, 100);
  };

  const logout = () => {
    console.log('Logout called');
    
    setToken(null);
    setUser(null);
    
    // Remove from cookies
    Cookies.remove('token');
    Cookies.remove('user');
    
    // Redirect to login
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}