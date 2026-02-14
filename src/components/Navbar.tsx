'use client';

import Usermenu from "./Usermenu";

export default function Navbar() {
  return (
    <header className="bg-white border-b border-primary-100 px-6 py-3">
      <div className="flex items-center justify-end gap-4">
        {/* Language Selector */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌐</span>
          <select 
            suppressHydrationWarning
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="en">English</option>
            <option value="ar">Arabic</option>
            <option value="es">Spanish</option>
          </select>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <Usermenu/>
        </div>
      </div>
    </header>
  );
}