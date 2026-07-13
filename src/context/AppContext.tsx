import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { AppState, Board, SavedWiring } from '../types';
import * as storage from '../utils/storage';

// ─── Actions ───────────────────────────────────────────────

type Action =
  | { type: 'TOGGLE_FAVORITE'; projectId: string }
  | { type: 'ADD_RECENT'; projectId: string }
  | { type: 'SET_BOARD'; board: Board }
  | { type: 'SAVE_WIRING'; wiring: SavedWiring }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'CACHE_GENERATED_CODE'; cacheKey: string; code: string }
  | { type: 'LOAD_STATE'; state: AppState };

// ─── Reducer ───────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'TOGGLE_FAVORITE':
      return storage.toggleFavorite(state, action.projectId);
    case 'ADD_RECENT':
      return storage.addRecentProject(state, action.projectId);
    case 'SET_BOARD':
      return storage.setBoard(state, action.board);
    case 'SAVE_WIRING':
      return storage.saveWiring(state, action.wiring);
    case 'TOGGLE_SIDEBAR':
      return storage.setSidebarCollapsed(state, !state.sidebarCollapsed);
    case 'CACHE_GENERATED_CODE':
      return storage.saveGeneratedCode(state, action.cacheKey, action.code);
    case 'LOAD_STATE':
      return action.state;
    default:
      return state;
  }
}

// ─── Context ───────────────────────────────────────────────

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, storage.loadState());

  // Sync to localStorage on every state change
  useEffect(() => {
    storage.saveState(state);
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
