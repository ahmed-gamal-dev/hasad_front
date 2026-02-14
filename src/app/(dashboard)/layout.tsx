import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Fixed */}
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