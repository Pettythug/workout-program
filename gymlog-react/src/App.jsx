import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import PlanView from './components/PlanView';
import FullBodyView from './components/FullBodyView';
import LiftView from './components/LiftView';
import CircuitView from './components/CircuitView';
import Header from './components/Header';
import StickyRestBanner from './components/StickyRestBanner';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <div className="sticky-header-container" style={{ position: 'sticky', top: 0, zIndex: 999, background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <Header />
          <StickyRestBanner />
        </div>
        
        <main className="main">
          <Routes>
            <Route path="/plan" element={<PlanView />} />
            <Route path="/full-body" element={<FullBodyView />} />
            <Route path="/lift" element={<LiftView />} />
            <Route path="/circuit" element={<CircuitView />} />
            <Route path="/" element={<Navigate to="/lift" replace />} />
          </Routes>
        </main>
      </HashRouter>
    </AppProvider>
  )
}

export default App
