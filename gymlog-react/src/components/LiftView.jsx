export default function LiftView() {
  return (
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
  );
}
