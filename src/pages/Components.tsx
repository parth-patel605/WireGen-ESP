import { useState, useMemo } from 'react';
import { components, componentCategories } from '../data/components';
import { projects } from '../data/projects';

export default function Components() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = ['All', ...Object.keys(componentCategories)];

  const filtered = useMemo(() => {
    return components.filter(c => {
      const matchesSearch = !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const getProjectsUsingComponent = (componentId: string) => {
    return projects.filter(p => p.componentIds.includes(componentId));
  };

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gradient">Components</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-surface-300)' }}>
          {filtered.length} of {components.length} IoT components
        </p>
      </div>

      {/* Search */}
      <div className="glass rounded-xl p-1 mb-5 flex items-center gap-3">
        <span className="pl-4 text-lg">🔍</span>
        <input
          type="text"
          placeholder="Search components..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 py-3 bg-transparent border-none outline-none text-sm"
          style={{ color: 'var(--color-surface-100)', fontFamily: 'var(--font-sans)' }}
          id="component-search"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="mr-3 text-xs px-2 py-1 rounded-lg cursor-pointer"
            style={{ background: 'var(--color-surface-600)', color: 'var(--color-surface-300)', border: 'none' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map(cat => {
          const info = componentCategories[cat];
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all border-none"
              style={{
                background: selectedCategory === cat
                  ? info ? `${info.color}30` : 'var(--color-surface-500)'
                  : 'var(--color-surface-700)',
                color: selectedCategory === cat
                  ? info ? info.color : '#fff'
                  : 'var(--color-surface-300)',
              }}
            >
              {info ? `${info.icon} ${info.label}` : 'All'}
            </button>
          );
        })}
      </div>

      {/* Component Grid */}
      {filtered.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">🔧</div>
          <div className="font-semibold mb-1" style={{ color: 'var(--color-surface-200)' }}>No components found</div>
          <div className="text-sm" style={{ color: 'var(--color-surface-300)' }}>Try a different search term</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {filtered.map(c => {
            const catInfo = componentCategories[c.category];
            const isExpanded = expandedId === c.id;
            const usedIn = getProjectsUsingComponent(c.id);

            return (
              <div
                key={c.id}
                className="glass rounded-xl overflow-hidden glass-hover transition-all cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : c.id)}
              >
                <div className="h-0.5" style={{ background: catInfo?.color || '#888' }} />
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-white"
                      style={{ border: `1px solid ${catInfo?.color || '#888'}30` }}
                    >
                      {c.imageUrl ? (
                        <img 
                          src={c.imageUrl} 
                          alt={c.name} 
                          className="w-full h-full object-cover mix-blend-multiply" 
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl bg-[var(--color-surface-800)]">
                          {catInfo?.icon || '🔧'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm" style={{ color: 'var(--color-surface-100)' }}>{c.name}</div>
                      <div className="flex gap-2 mt-0.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: 'var(--color-surface-600)', color: 'var(--color-surface-300)' }}>
                          {c.pinType}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: `${catInfo?.color || '#888'}15`, color: catInfo?.color || '#888' }}>
                          {c.category}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', color: 'var(--color-surface-400)' }}>
                      ▼
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-surface-300)' }}>
                    {isExpanded ? c.description : c.description.slice(0, 100) + (c.description.length > 100 ? '...' : '')}
                  </p>

                  {isExpanded && usedIn.length > 0 && (
                    <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--color-glass-border)' }}>
                      <div className="text-[11px] font-semibold mb-2" style={{ color: 'var(--color-accent-cyan)' }}>
                        Used in {usedIn.length} project{usedIn.length !== 1 ? 's' : ''}:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {usedIn.slice(0, 5).map(p => (
                          <span key={p.id} className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: 'var(--color-surface-600)', color: 'var(--color-surface-200)' }}>
                            {p.name}
                          </span>
                        ))}
                        {usedIn.length > 5 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: 'var(--color-surface-600)', color: 'var(--color-surface-400)' }}>
                            +{usedIn.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
