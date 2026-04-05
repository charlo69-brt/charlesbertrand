'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      {/* Main content: margin adjusts for desktop sidebar, padding-top for mobile top bar */}
      <div className={`min-h-screen flex flex-col transition-all duration-300 pt-14 lg:pt-0 ${collapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <Header />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </>
  );
}
