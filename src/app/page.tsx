'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useAppDispatch();
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);


  useEffect(() => {
    if (!isLoading) {
      if (token) {
        console.log('User is logged in, redirecting to dashboard');
        router.replace('/dashboard'); // Use replace instead of push
      } else {
        console.log('User not logged in, redirecting to login');
        router.replace('/login'); // Use replace instead of push
      }
    }
  }, [token, isLoading, router]);

  // Show loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}