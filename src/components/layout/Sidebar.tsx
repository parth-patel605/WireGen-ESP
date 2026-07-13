import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import type { Board } from '../../types';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '🏠' },
  { path: '/projects', label: 'Projects', icon: '📦' },
  { path: '/components', label: 'Components', icon: '🔧' },
  { path: '/favorites', label: 'Favorites', icon: '⭐' },
];

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const location = useLocation();

  const handleBoardChange = (board: Board) => {
    dispatch({ type: 'SET_BOARD', board });
  };

  return (
    <aside
      className="sidebar-desktop fixed left-0 top-0 h-screen flex flex-col z-40"
      style={{
        width: state.sidebarCollapsed ? '72px' : '260px',
        background: 'var(--color-surface-800)',
        borderRight: '1px solid var(--color-glass-border)',
        transition: 'width 0.3s ease',
      }}
    >
      {/* Logo */}
      <div className="p-5 flex items-center gap-3" style={{ borderBottom: '1px solid var(--color-glass-border)' }}>
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, var(--color-accent-cyan), var(--color-accent-purple))',
            fontSize: 18,
          }}
        >
          ⚡
        </div>
        {!state.sidebarCollapsed && (
          <div className="animate-fadeIn">
            <div className="text-sm font-bold text-gradient">IoT Builder</div>
            <div className="text-[11px]" style={{ color: 'var(--color-surface-300)' }}>ESP32 & ESP8266</div>
          </div>
        )}
      </div>

      {/* Board Selector */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-glass-border)' }}>
        {!state.sidebarCollapsed && (
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-surface-300)' }}>
            Board
          </div>
        )}
        <div className="flex gap-1.5 rounded-xl p-1" style={{ background: 'var(--color-surface-700)' }}>
          {(['ESP32', 'ESP8266'] as Board[]).map((board) => (
            <button
              key={board}
              onClick={() => handleBoardChange(board)}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              style={{
                background: state.selectedBoard === board
                  ? 'linear-gradient(135deg, var(--color-accent-cyan), var(--color-accent-purple))'
                  : 'transparent',
                color: state.selectedBoard === board ? '#fff' : 'var(--color-surface-300)',
              }}
            >
              {state.sidebarCollapsed ? board.slice(0, 3) : board}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {!state.sidebarCollapsed && (
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-3" style={{ color: 'var(--color-surface-300)' }}>
            Navigation
          </div>
        )}
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={`sidebar-link ${
              (item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path))
                ? 'active' : ''
            }`}
          >
            <span className="text-lg shrink-0">{item.icon}</span>
            {!state.sidebarCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 flex flex-col gap-2" style={{ borderTop: '1px solid var(--color-glass-border)' }}>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="w-full py-2 rounded-lg text-xs cursor-pointer transition-colors"
          style={{
            background: 'var(--color-surface-700)',
            color: 'var(--color-surface-300)',
            border: 'none',
          }}
        >
          {state.sidebarCollapsed ? '→' : '← Collapse'}
        </button>
      </div>
    </aside>
  );
}
