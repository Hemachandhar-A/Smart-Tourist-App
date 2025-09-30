import React from 'react';
import { AlertTriangle, Navigation, Phone, X, Shield } from 'lucide-react';

const DangerModal = ({ zone, onClose, onShowExitRoute, onSOS }) => {
  return (
    <div className="danger-modal-overlay">
      <div className="danger-modal">
        <button className="close-btn" onClick={onClose}>
          <X className="close-icon" />
        </button>

        <div className="danger-header">
          <div className="danger-icon">
            <AlertTriangle className="alert-icon pulsing" />
          </div>
          <h2>⚠️ DANGER ZONE DETECTED</h2>
          <p>You have entered a restricted area</p>
        </div>

        <div className="zone-details">
          <h3>{zone.name}</h3>
          <p>{zone.description}</p>
          <div className="safety-score">
            <span className="score-label">Safety Level:</span>
            <div className="score-bar">
              <div 
                className="score-fill danger" 
                style={{ width: `${zone.safety_score}%` }}
              ></div>
            </div>
            <span className="score-value">{zone.safety_score}/100</span>
          </div>
        </div>

        <div className="danger-actions">
          <button className="exit-route-btn" onClick={onShowExitRoute}>
            <Navigation className="btn-icon" />
            Show Exit Route
          </button>
          
          <button className="sos-btn" onClick={onSOS}>
            <Phone className="btn-icon" />
            Emergency SOS
          </button>
        </div>

        <div className="safety-tips">
          <h4>🛡️ Safety Recommendations</h4>
          <ul>
            <li>Follow the exit route to leave the restricted area</li>
            <li>Stay alert and avoid lingering in this zone</li>
            <li>Contact local authorities if you feel unsafe</li>
            <li>Your family has been notified of your location</li>
          </ul>
        </div>

        <div className="auto-close-notice">
          <Shield className="shield-icon" />
          <span>This alert will auto-dismiss when you exit the danger zone</span>
        </div>
      </div>
    </div>
  );
};

export default DangerModal;