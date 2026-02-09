'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
  },
  {
    name: 'Visits',
    href: '/visits',
    icon: '🏠',
  },
  {
    name: 'Customers',
    href: '/customers',
    icon: '👥',
  },
  {
    name: 'Workers',
    href: '/workers',
    icon: '👷',
  },
  {
    name: 'Users',
    href: '/users',
    icon: '👤',
  },
  {
    name: 'Service Report',
    href: '/service-report',
    icon: '📋',
  },
  {
    name: 'Schedule',
    href: '/schedule',
    icon: '📅',
  },
  {
    name: 'Photo Report',
    href: '/photo-report',
    icon: '📸',
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">F</span>
          </div>
          <span className="font-semibold text-lg">FieldOps HQ</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Help Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-2">Need Help?</h3>
          <p className="text-xs text-gray-600 mb-3">
            Contact support for any issues or questions
          </p>
          <button className="w-full bg-gray-800 text-white text-sm py-2 px-4 rounded-lg hover:bg-gray-900 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </aside>
  );
}