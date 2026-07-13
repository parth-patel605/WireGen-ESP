import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { projects, projectCategories } from '../data/projects';
import type { Difficulty } from '../types';

export default function Projects() {
  const { state, dispatch } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'All'>('All');

  const selectedCategory = searchParams.get('category') || 'All';

  const setCategory = (cat: string) => {
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [search, selectedCategory, selectedDifficulty]);

  const categories = ['All', ...Object.keys(projectCategories)];
  const difficulties: (Difficulty | 'All')[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Projects</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-surface-300)' }}>
            {filtered.length} of {projects.length} projects
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="glass rounded-xl p-1 mb-5 flex items-center gap-3">
        <span className="pl-4 text-lg">🔍</span>
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 py-3 bg-transparent border-none outline-none text-sm"
          style={{ color: 'var(--color-surface-100)', fontFamily: 'var(--font-sans)' }}
          id="project-search"
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
      <div className="flex gap-2 mb-3 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className="px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all border-none"
            style={{
              background: selectedCategory === cat
                ? 'linear-gradient(135deg, var(--color-accent-cyan), var(--color-accent-purple))'
                : 'var(--color-surface-700)',
              color: selectedCategory === cat ? '#fff' : 'var(--color-surface-300)',
            }}
          >
            {cat !== 'All' && `${projectCategories[cat]?.icon} `}
            {cat === 'All' ? 'All' : projectCategories[cat]?.label || cat}
          </button>
        ))}
      </div>

      {/* Difficulty Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {difficulties.map(diff => (
          <button
            key={diff}
            onClick={() => setSelectedDifficulty(diff)}
            className="px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all border-none"
            style={{
              background: selectedDifficulty === diff
                ? diff === 'Beginner' ? 'rgba(0,230,118,0.2)'
                : diff === 'Intermediate' ? 'rgba(255,145,0,0.2)'
                : diff === 'Advanced' ? 'rgba(255,23,68,0.2)'
                : 'var(--color-surface-500)'
                : 'var(--color-surface-700)',
              color: selectedDifficulty === diff
                ? diff === 'Beginner' ? 'var(--color-accent-green)'
                : diff === 'Intermediate' ? 'var(--color-accent-orange)'
                : diff === 'Advanced' ? 'var(--color-accent-red)'
                : '#fff'
                : 'var(--color-surface-300)',
            }}
          >
            {diff}
          </button>
        ))}
      </div>

      {/* Project Grid */}
      {filtered.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <div className="font-semibold mb-1" style={{ color: 'var(--color-surface-200)' }}>No projects found</div>
          <div className="text-sm" style={{ color: 'var(--color-surface-300)' }}>Try adjusting your search or filters</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {filtered.map(p => {
            const isFav = state.favorites.includes(p.id);
            const catInfo = projectCategories[p.category];

            return (
              <div
                key={p.id}
                className="glass rounded-xl overflow-hidden glass-hover transition-all hover:scale-[1.02] group"
              >
                {/* Color strip */}
                <div className="h-1" style={{ background: catInfo?.color || '#888' }} />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xl">{catInfo?.icon}</span>
                    <div className="flex gap-2 items-center">
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
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          dispatch({ type: 'TOGGLE_FAVORITE', projectId: p.id });
                        }}
                        className="text-lg cursor-pointer bg-transparent border-none p-0 transition-transform hover:scale-125"
                        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {isFav ? '⭐' : '☆'}
                      </button>
                    </div>
                  </div>

                  <Link
                    to={`/project/${p.id}`}
                    className="no-underline"
                  >
                    <h3
                      className="font-semibold text-sm mb-2 group-hover:text-[var(--color-accent-cyan)] transition-colors"
                      style={{ color: 'var(--color-surface-100)' }}
                    >
                      {p.name}
                    </h3>
                    <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--color-surface-300)' }}>
                      {p.description.slice(0, 120)}{p.description.length > 120 ? '...' : ''}
                    </p>
                  </Link>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px]" style={{ color: 'var(--color-surface-400)' }}>
                      🔧 {p.componentIds.length} component{p.componentIds.length !== 1 ? 's' : ''}
                    </span>
                    <Link
                      to={`/project/${p.id}`}
                      className="text-xs font-medium no-underline transition-colors"
                      style={{ color: 'var(--color-accent-cyan)' }}
                    >
                      Open →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
