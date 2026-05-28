<<<<<<< HEAD
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
=======
function App() {
  return (
    <>
      <div className="header">
        <h1 style={{ margin: 0, fontSize: '16px' }}>GymLog React Test</h1>
      </div>
      
      <main className="main">
        <div className="exercise-card">
          <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Test Card</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>
            This card verifies that our custom design tokens and utility classes are active.
          </p>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn-primary">Primary Action</button>
            <button className="btn-success">Success Action</button>
            <button className="btn-danger">Danger Action</button>
          </div>
        </div>
      </main>
    </>
>>>>>>> origin/main
  )
}

export default App
