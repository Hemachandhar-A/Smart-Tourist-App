import React from 'react';
import { Navigation, MapPin, X, Clock } from 'lucide-react';

const ExitRouteModal = ({ route, onClose }) => {
  const calculateDistance = () => {
    if (route.length < 2) return 0;
    
    const [start, end] = route;
    const R = 6371e3; // Earth radius in meters
    const φ1 = start.lat * Math.PI/180;
    const φ2 = end.lat * Math.PI/180;
    const Δφ = (end.lat - start.lat) * Math.PI/180;
    const Δλ = (end.lon - start.lon) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return Math.round(R * c);
  };

  const distance = calculateDistance();
  const estimatedTime = Math.max(1, Math.round(distance / 80)); // ~80m/min walking speed

  return (
    <div className="exit-route-modal-overlay">
      <div className="exit-route-modal">
        <button className="close-btn" onClick={onClose}>
          <X className="close-icon" />
        </button>

        <div className="route-header">
          <div className="route-icon">
            <Navigation className="nav-icon pulsing" />
          </div>
          <h2>🧭 Emergency Exit Route</h2>
          <p>Follow this path to reach safety</p>
        </div>

        <div className="route-info">
          <div className="route-stats">
            <div className="stat">
              <MapPin className="stat-icon" />
              <div>
                <span className="stat-value">{distance}m</span>
                <span className="stat-label">Distance</span>
              </div>
            </div>
            <div className="stat">
              <Clock className="stat-icon" />
              <div>
                <span className="stat-value">{estimatedTime} min</span>
                <span className="stat-label">Walking Time</span>
              </div>
            </div>
          </div>

          <div className="route-directions">
            <h4>📍 Directions</h4>
            <ol>
              <li>Head in the direction shown by the red dashed line on the map</li>
              <li>Walk at a steady pace towards the safe zone marker</li>
              <li>Avoid stopping or taking detours within the danger zone</li>
              <li>The route will disappear once you reach the safe area</li>
            </ol>
          </div>
        </div>

        <div className="route-actions">
          <button className="follow-route-btn">
            <Navigation className="btn-icon" />
            Start Navigation
          </button>
        </div>

        <div className="safety-notice">
          <p>
            🚨 <strong>Important:</strong> This is an emergency exit route. Follow it immediately 
            to ensure your safety. Emergency services have been notified of your location.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExitRouteModal;