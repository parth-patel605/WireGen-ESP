import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { projects, projectCategories } from '../data/projects';
import { importProjectFromJSON } from '../utils/exportUtils';

export default function Favorites() {
  const { state, dispatch } = useApp();
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const favoriteProjects = projects.filter(p => state.favorites.includes(p.id));

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importProjectFromJSON(file);
      setToast(`Imported project: ${(data as { name?: string }).name || 'Unknown'}`);
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast('Failed to import — invalid JSON file');
      setTimeout(() => setToast(null), 3000);
    }
    e.target.value = '';
  };

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Favorites</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-surface-300)' }}>
            {favoriteProjects.length} saved project{favoriteProjects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all hover:scale-105"
            style={{ background: 'var(--color-accent-purple)', color: '#fff' }}
          >
            📥 Import Project (JSON)
          </button>
        </div>
      </div>

      {/* Saved Wiring Configs */}
      {Object.keys(state.savedWirings).length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-surface-100)' }}>
            Saved Wiring Configurations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(state.savedWirings).map(([key, wiring]) => {
              const project = projects.find(p => p.id === wiring.projectId);
              return (
                <Link
                  key={key}
                  to={`/project/${wiring.projectId}`}
                  className="glass p-4 rounded-xl glass-hover no-underline transition-all hover:scale-[1.02]"
                >
                  <div className="font-semibold text-xs" style={{ color: 'var(--color-surface-100)' }}>
                    {project?.name || wiring.projectId}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: 'var(--color-surface-600)', color: 'var(--color-accent-cyan)' }}>
                      {wiring.board}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: 'var(--color-surface-600)', color: 'var(--color-surface-300)' }}>
                      {wiring.rows.length} wires
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--color-surface-400)' }}>
                      {new Date(wiring.savedAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Favorite Projects */}
      {favoriteProjects.length === 0 ? (
        <div className="glass rounded-xl p-16 text-center">
          <div className="text-5xl mb-4 animate-float">⭐</div>
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-surface-200)' }}>
            No favorites yet
          </h2>
          <p className="text-sm mb-5" style={{ color: 'var(--color-surface-400)' }}>
            Browse projects and click the star icon to add favorites
          </p>
          <Link
            to="/projects"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold no-underline inline-block"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent-cyan), var(--color-accent-purple))',
              color: '#fff',
            }}
          >
            Browse Projects
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {favoriteProjects.map(p => {
            const catInfo = projectCategories[p.category];
            return (
              <div key={p.id} className="glass rounded-xl overflow-hidden glass-hover transition-all hover:scale-[1.02] group">
                <div className="h-1" style={{ background: catInfo?.color || '#888' }} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xl">{catInfo?.icon}</span>
                    <button
                      onClick={() => dispatch({ type: 'TOGGLE_FAVORITE', projectId: p.id })}
                      className="text-lg cursor-pointer bg-transparent border-none transition-transform hover:scale-125"
                    >
                      ⭐
                    </button>
                  </div>
                  <Link to={`/project/${p.id}`} className="no-underline">
                    <h3 className="font-semibold text-sm mb-2 group-hover:text-[var(--color-accent-cyan)] transition-colors" style={{ color: 'var(--color-surface-100)' }}>
                      {p.name}
                    </h3>
                    <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--color-surface-300)' }}>
                      {p.description.slice(0, 100)}...
                    </p>
                  </Link>
                  <div className="flex gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${catInfo?.color || '#888'}20`, color: catInfo?.color || '#888' }}>
                      {p.category}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
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
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className="toast toast-info">{toast}</div>
        </div>
      )}
    </div>
  );
}
