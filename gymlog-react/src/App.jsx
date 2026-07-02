import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import PlanView from './components/PlanView';
import LiftView from './components/LiftView';
import CircuitView from './components/CircuitView';
import Header from './components/Header';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Header />
        
        <main className="main">
          <Routes>
            <Route path="/plan" element={<PlanView />} />
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
