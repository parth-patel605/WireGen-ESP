import { useState, useMemo } from 'react';

export function useSearch<T>(items: T[], searchFn: (item: T, query: string) => boolean) {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    let result = items;

    if (query.trim()) {
      result = result.filter(item => searchFn(item, query.toLowerCase()));
    }

    return result;
  }, [items, query, searchFn]);

  return {
    query,
    setQuery,
    filtered,
    activeFilters,
    setActiveFilters,
    resultCount: filtered.length,
    totalCount: items.length,
  };
}
