import React from 'react';

export default function HelpDrawer({ showHelp, setShowHelp }) {
    return (
        <div className={`help-drawer ${showHelp ? "open" : ""}`}>
            <div className="help-drawer-header">
                <h3>GYM LOG GUIDE</h3>
                <button className="help-drawer-close" onClick={() => setShowHelp(false)}>&#x2715;</button>
            </div>
            
            <div className="help-card">
                <h4>1. Tracking Daily Maxes</h4>
                <p>Your best lift for each rep range is saved automatically. The ranges are:</p>
                <p style={{ marginTop: 4, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)' }}>
                    r1_3 (1-3 reps) | r4_6 | r7_9 | r10_12 | r13_plus
                </p>
            </div>

            <div className="help-card">
                <h4>2. Variations & Modes</h4>
                <p>For each machine, you can track variations like Single Arm/Leg or Alternating.</p>
            </div>

            <div className="help-card">
                <h4>3. Syncing to Sheets</h4>
                <p>When configured, data pushes automatically to Google Sheets in the background.</p>
            </div>
        </div>
    );
}
