'use client';

export default function Navbar() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-end gap-4">
        {/* Language Selector */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌐</span>
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="en">English</option>
            <option value="ar">Arabic</option>
            <option value="es">Spanish</option>
          </select>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">JD</span>
          </div>
        </div>
      </div>
    </header>
  );
}
