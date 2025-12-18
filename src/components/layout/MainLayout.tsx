import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom'; // Add useLocation
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';
import { cn } from '@/lib/utils';

const SIDEBAR_COLLAPSED_KEY = 'si_releves_sidebar_collapsed';

export const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return stored === 'true';
  });

  const navigate = useNavigate();
  const location = useLocation(); // Add this
  useInactivityTimer();

  const handleToggleSidebar = () => {
    const newValue = !sidebarCollapsed;
    setSidebarCollapsed(newValue);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newValue));
  };

  const [layoutId] = useState(() => Math.random().toString(36).substr(2, 9));
  
  console.log(`MainLayout [${layoutId}] rendering, sidebar collapsed:`, sidebarCollapsed);
  console.log(`MainLayout - Current path:`, location.pathname); // Log current path

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />
      <Topbar sidebarCollapsed={sidebarCollapsed} />
      
      <main
        className={cn(
          "pt-16 min-h-screen transition-all duration-300",
          sidebarCollapsed ? "pl-16" : "pl-64"
        )}
      >
        <div className="p-6">
          {/* Add a debug div */}
          <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 text-sm rounded">
            Debug: Current route: {location.pathname} | Outlet should render below:
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
};