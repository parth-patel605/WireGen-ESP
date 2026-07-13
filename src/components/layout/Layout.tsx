import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useApp } from '../../context/AppContext';

export default function Layout() {
  const { state } = useApp();
  const sidebarWidth = state.sidebarCollapsed ? 72 : 260;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-900)' }}>
      <Sidebar />
      <main
        className="min-h-screen transition-all duration-300"
        style={{
          marginLeft: `${sidebarWidth}px`,
          padding: '24px 32px',
        }}
      >
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 hidden z-50 px-2 pb-2"
        style={{
          display: 'none',
        }}
        id="mobile-nav"
      >
        {/* Future: mobile bottom navigation */}
      </nav>
    </div>
  );
}
