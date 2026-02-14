'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  Briefcase, 
  UserCheck, 
  FileText, 
  Calendar, 
  Camera, 
  BarChart3, 
  HelpCircle,
  LucideIcon
} from 'lucide-react';

interface MenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
  },
  {
    name: 'Visits',
    href: '/visits',
    icon: Home,
  },
  {
    name: 'Customers',
    href: '/customers',
    icon: Users,
  },
   {
    name: 'Vehicles',
    href: '/vehicles',
    icon: Users,
  },
  {
    name: 'Clients',
    href: '/clients',
    icon: Users,
  },
  {
    name: 'Workers',
    href: '/workers',
    icon: Briefcase,
  },
  {
    name: 'Users',
    href: '/users',
    icon: UserCheck,
  },
  {
    name: 'Service Report',
    href: '/service-report',
    icon: FileText,
  },
  {
    name: 'Schedule',
    href: '/schedule',
    icon: Calendar,
  },
  {
    name: 'Photo Report',
    href: '/photo-report',
    icon: Camera,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-white flex flex-col shadow-lg h-full">
      {/* Logo Section */}
      <div className="px-6 py-4 border-b border-primary-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-gray-900 tracking-tight">FieldOps HQ</span>
          </div>
        </div>
      </div>

      {/* Navigation Menu - NO OVERFLOW */}
      <nav className="flex-1 px-4 py-6 border-r border-primary-100">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/20' 
                    : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                  }
                `}
              >
                <Icon 
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110' : 'group-hover:scale-110'
                  }`}
                />
                <span className={`font-medium text-sm ${isActive ? 'font-semibold' : ''}`}>
                  {item.name}
                </span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Help Section - WITH suppressHydrationWarning */}
      <div className="p-4 border-t border-r border-primary-100 flex-shrink-0">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-5 border border-primary-200">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-900 mb-1">Need Help?</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Contact support for any issues or questions
              </p>
            </div>
          </div>
          <button 
            type="button"
            suppressHydrationWarning
            onClick={() => console.log('Contact support')}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium py-2.5 px-4 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-md shadow-primary-500/20 hover:shadow-primary-500/30 hover:scale-[1.02]"
          >
            Contact Support
          </button>
        </div>
      </div>
    </aside>
  );
}