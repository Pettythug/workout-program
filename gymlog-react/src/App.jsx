import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import PlanView from './components/PlanView';
import LiftView from './components/LiftView';
import { useGymAPI } from './hooks/useGymAPI';

function App() {
  return (
    <BrowserRouter>
      <div className="header" style={{ gap: '16px', justifyContent: 'flex-start' }}>
        <h1 style={{ margin: 0, fontSize: '16px', marginRight: 'auto' }}>GymLog</h1>
        <NavLink to="/plan" className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}>PLAN</NavLink>
        <NavLink to="/lift" className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}>LIFT</NavLink>
      </div>
      
      <main className="main">
        <Routes>
          <Route path="/plan" element={<PlanView />} />
          <Route path="/lift" element={<LiftView />} />
          <Route path="/" element={<Navigate to="/lift" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
