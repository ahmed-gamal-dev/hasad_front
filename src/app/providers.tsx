'use client';

import { ReactNode } from 'react';
import { ReduxProvider } from '@/store/ReduxProvider';
import { ToastContainer } from 'react-toastify';
import { SimpleTranslationProvider } from '@/contexts/SimpleTranslationContext';

import 'react-toastify/dist/ReactToastify.css';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider>
      <SimpleTranslationProvider>

      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      </SimpleTranslationProvider>
    </ReduxProvider>
  );
}