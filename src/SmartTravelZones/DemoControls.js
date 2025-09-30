import React, { useState } from 'react';
import { Play, Square, Zap, Users, Phone, Settings, Target } from 'lucide-react';

const DemoControls = ({
  onSimulateWalk,
  onForceEnter,
  onTriggerCrowdSpike,
  onTestSOS,
  geoFences,
  isSimulating
}) => {
  const [selectedFence, setSelectedFence] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleForceEnter = () => {
    if (selectedFence) {
      onForceEnter(selectedFence);
    }
  };

  return (
    <div className="demo-controls">
      <div className="controls-header">
        <h3>🎮 Demo Controls</h3>
        <button 
          className="advanced-toggle"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Settings className="btn-icon" />
          {showAdvanced ? 'Basic' : 'Advanced'}
        </button>
      </div>

      <div className="controls-grid">
        {/* Primary Controls */}
        <div className="control-section primary">
          <h4>Quick Demo</h4>
          
          <button 
            className={`demo-btn simulate ${isSimulating ? 'active' : ''}`}
            onClick={onSimulateWalk}
          >
            {isSimulating ? (
              <>
                <Square className="btn-icon" />
                Stop Simulation
              </>
            ) : (
              <>
                <Play className="btn-icon" />
                Simulate GPS Walk
              </>
            )}
          </button>
          
          <button 
            className="demo-btn danger"
            onClick={onTriggerCrowdSpike}
          >
            <Users className="btn-icon" />
            Trigger Crowd Spike
          </button>
          
          <button 
            className="demo-btn emergency"
            onClick={onTestSOS}
          >
            <Phone className="btn-icon" />
            Test Emergency SOS
          </button>
        </div>

        {/* Advanced Controls */}
        {showAdvanced && (
          <div className="control-section advanced">
            <h4>Advanced Testing</h4>
            
            <div className="force-entry-group">
              <label htmlFor="fence-select">Force Zone Entry:</label>
              <div className="input-group">
                <select 
                  id="fence-select"
                  value={selectedFence} 
                  onChange={(e) => setSelectedFence(e.target.value)}
                  className="fence-select"
                >
                  <option value="">Select a zone...</option>
                  {geoFences.map(fence => (
                    <option key={fence.id} value={fence.id}>
                      {fence.name} ({fence.type})
                    </option>
                  ))}
                </select>
                <button 
                  className="demo-btn force"
                  onClick={handleForceEnter}
                  disabled={!selectedFence}
                >
                  <Target className="btn-icon" />
                  Force Enter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="demo-instructions">
        <h4>📋 Demo Instructions for Judges</h4>
        <div className="instructions-list">
          <div className="instruction-item">
            <span className="step-number">1</span>
            <div>
              <strong>Allow Location:</strong> Accept browser location permission to see real geo-fences around your position
            </div>
          </div>
          <div className="instruction-item">
            <span className="step-number">2</span>
            <div>
              <strong>Simulate Walk:</strong> Click "Simulate GPS Walk" to automatically move through zones and trigger alerts
            </div>
          </div>
          <div className="instruction-item">
            <span className="step-number">3</span>
            <div>
              <strong>Danger Zone:</strong> When entering red zones, emergency modal appears with exit route and family notifications
            </div>
          </div>
          <div className="instruction-item">
            <span className="step-number">4</span>
            <div>
              <strong>Test SOS:</strong> Emergency button sends location to backend and simulates emergency response
            </div>
          </div>
          <div className="instruction-item">
            <span className="step-number">5</span>
            <div>
              <strong>Travel Journal:</strong> All events are logged with timestamps and can be exported as JSON
            </div>
          </div>
        </div>
      </div>

      <div className="demo-status">
        <div className="status-indicators">
          <div className={`status-dot ${isSimulating ? 'active' : 'inactive'}`}></div>
          <span>{isSimulating ? 'Simulation Running' : 'Ready for Demo'}</span>
        </div>
        <div className="zones-count">
          <span>{geoFences.length} zones loaded</span>
        </div>
      </div>
    </div>
  );
};

export default DemoControls;