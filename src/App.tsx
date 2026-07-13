import { HashRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';

// Lazy load pages for performance optimization
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Components = lazy(() => import('./pages/Components'));
const Favorites = lazy(() => import('./pages/Favorites'));

// Loading Fallback
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-[var(--color-surface-400)]">
    <div className="text-3xl mb-4 animate-pulse">⚡</div>
    <div className="text-sm">Loading module...</div>
  </div>
);

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/project/:id" element={<ProjectDetail />} />
              <Route path="/components" element={<Components />} />
              <Route path="/favorites" element={<Favorites />} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </AppProvider>
  );
}
