import type { AppState, Board, SavedWiring } from '../types';

const STORAGE_KEY = 'iot-project-builder';

const defaultState: AppState = {
  selectedBoard: 'ESP32',
  favorites: [],
  recentProjects: [],
  savedWirings: {},
  sidebarCollapsed: false,
  generatedCodes: {},
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save state:', e);
  }
}

export function toggleFavorite(state: AppState, projectId: string): AppState {
  const favorites = state.favorites.includes(projectId)
    ? state.favorites.filter(id => id !== projectId)
    : [...state.favorites, projectId];
  const next = { ...state, favorites };
  saveState(next);
  return next;
}

export function addRecentProject(state: AppState, projectId: string): AppState {
  const recent = [projectId, ...state.recentProjects.filter(id => id !== projectId)].slice(0, 10);
  const next = { ...state, recentProjects: recent };
  saveState(next);
  return next;
}

export function setBoard(state: AppState, board: Board): AppState {
  const next = { ...state, selectedBoard: board };
  saveState(next);
  return next;
}

export function saveWiring(state: AppState, wiring: SavedWiring): AppState {
  const key = `${wiring.projectId}-${wiring.board}`;
  const next = { ...state, savedWirings: { ...state.savedWirings, [key]: wiring } };
  saveState(next);
  return next;
}

export function loadWiring(state: AppState, projectId: string, board: Board): SavedWiring | null {
  return state.savedWirings[`${projectId}-${board}`] || null;
}

export function setSidebarCollapsed(state: AppState, collapsed: boolean): AppState {
  const next = { ...state, sidebarCollapsed: collapsed };
  saveState(next);
  return next;
}

export function saveGeneratedCode(state: AppState, cacheKey: string, code: string): AppState {
  const next = {
    ...state,
    generatedCodes: {
      ...state.generatedCodes,
      [cacheKey]: code,
    },
  };
  saveState(next);
  return next;
}
