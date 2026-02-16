

'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { useTranslation } from '@/contexts/SimpleTranslationContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isReady, direction, isRTL } = useTranslation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isReady) {
      const timer = setTimeout(() => setShow(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  return (
    <div 
      dir={direction} // ✅ Set direction here
      className={`flex h-screen bg-gray-50 overflow-hidden transition-opacity duration-200 ${
        show ? 'opacity-100' : 'opacity-0'
      } ${isRTL ? 'rtl' : 'ltr'}`} // ✅ Add RTL class
    >
      {/* Sidebar - Position changes based on direction */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar - Fixed */}
        <Navbar />

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className="bg-white m-5 rounded-xl border border-primary-50 shadow-sm p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}