import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { projects, projectCategories } from '../data/projects';
import { components } from '../data/components';

export default function Dashboard() {
  const { state } = useApp();

  const recentProjects = state.recentProjects
    .map(id => projects.find(p => p.id === id))
    .filter(Boolean)
    .slice(0, 4);

  const stats = [
    { label: 'Projects', value: projects.length, icon: '📦', color: 'var(--color-accent-cyan)' },
    { label: 'Components', value: components.length, icon: '🔧', color: 'var(--color-accent-purple)' },
    { label: 'Favorites', value: state.favorites.length, icon: '⭐', color: 'var(--color-accent-orange)' },
    { label: 'Board', value: state.selectedBoard, icon: '🎯', color: 'var(--color-accent-green)' },
  ];

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto">
      {/* Hero */}
      <div
        className="glass rounded-2xl p-8 mb-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(0,229,255,0.08), rgba(124,77,255,0.08), rgba(0,230,118,0.05))',
        }}
      >
        <div
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-20 blur-3xl"
          style={{ background: 'var(--color-accent-cyan)' }}
        />
        <div
          className="absolute -bottom-20 -left-10 w-40 h-40 rounded-full opacity-15 blur-3xl"
          style={{ background: 'var(--color-accent-purple)' }}
        />

        <div className="relative">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-gradient">IoT Project Builder</span>
          </h1>
          <p style={{ color: 'var(--color-surface-300)' }} className="text-base max-w-xl">
            Build IoT projects with ESP32 & ESP8266. Select a project, configure wiring, and generate ready-to-use Arduino code.
          </p>
          <div className="flex gap-3 mt-5">
            <Link
              to="/projects"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold no-underline transition-transform hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent-cyan), var(--color-accent-purple))',
                color: '#fff',
              }}
            >
              Browse Projects
            </Link>
            <Link
              to="/components"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold no-underline transition-transform hover:scale-105"
              style={{
                background: 'var(--color-surface-600)',
                color: 'var(--color-surface-100)',
                border: '1px solid var(--color-glass-border)',
              }}
            >
              Explore Components
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        {stats.map(s => (
          <div key={s.label} className="glass p-5 rounded-xl glass-hover transition-all cursor-default">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{s.icon}</span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${s.color}20` }}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              </div>
            </div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--color-surface-300)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-surface-100)' }}>
          Project Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
          {Object.entries(projectCategories).map(([key, cat]) => {
            const count = projects.filter(p => p.category === key).length;
            return (
              <Link
                key={key}
                to={`/projects?category=${encodeURIComponent(key)}`}
                className="glass p-4 rounded-xl glass-hover no-underline transition-all hover:scale-[1.02]"
              >
                <span className="text-2xl">{cat.icon}</span>
                <div className="font-semibold text-sm mt-2" style={{ color: 'var(--color-surface-100)' }}>
                  {cat.label}
                </div>
                <div className="text-xs" style={{ color: 'var(--color-surface-300)' }}>
                  {count} project{count !== 1 ? 's' : ''}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-surface-100)' }}>
            Recently Viewed
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            {recentProjects.map(p => p && (
              <Link
                key={p.id}
                to={`/project/${p.id}`}
                className="glass p-4 rounded-xl glass-hover no-underline transition-all hover:scale-[1.02]"
              >
                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--color-surface-100)' }}>
                  {p.name}
                </div>
                <div className="flex gap-2 mt-2">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: `${projectCategories[p.category]?.color || '#888'}20`,
                      color: projectCategories[p.category]?.color || '#888',
                    }}
                  >
                    {p.category}
                  </span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'var(--color-surface-600)', color: 'var(--color-surface-200)' }}
                  >
                    {p.difficulty}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Featured Projects */}
      <div>
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-surface-100)' }}>
          Featured Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {projects.slice(0, 6).map(p => (
            <Link
              key={p.id}
              to={`/project/${p.id}`}
              className="glass p-5 rounded-xl glass-hover no-underline transition-all hover:scale-[1.02] group"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xl">{projectCategories[p.category]?.icon}</span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: p.difficulty === 'Beginner' ? 'rgba(0,230,118,0.15)' :
                                p.difficulty === 'Intermediate' ? 'rgba(255,145,0,0.15)' : 'rgba(255,23,68,0.15)',
                    color: p.difficulty === 'Beginner' ? 'var(--color-accent-green)' :
                           p.difficulty === 'Intermediate' ? 'var(--color-accent-orange)' : 'var(--color-accent-red)',
                  }}
                >
                  {p.difficulty}
                </span>
              </div>
              <div className="font-semibold text-sm mb-1.5 group-hover:text-[var(--color-accent-cyan)] transition-colors" style={{ color: 'var(--color-surface-100)' }}>
                {p.name}
              </div>
              <div className="text-xs leading-relaxed" style={{ color: 'var(--color-surface-300)' }}>
                {p.description.slice(0, 100)}...
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                <span className="text-[11px]" style={{ color: 'var(--color-surface-400)' }}>
                  🔧 {p.componentIds.length} component{p.componentIds.length !== 1 ? 's' : ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
