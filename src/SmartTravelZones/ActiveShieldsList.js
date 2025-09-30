import React from 'react';
import { Shield, Users, AlertTriangle, MapPin, Eye, EyeOff, Lock } from 'lucide-react';

const ActiveShieldsList = ({ activeZones, geoFences, privacySetting }) => {
  const getPrivacyIcon = () => {
    switch (privacySetting) {
      case 'only_me': return <Eye className="privacy-icon" />;
      case 'family': return <Users className="privacy-icon" />;
      case 'authorities': return <Lock className="privacy-icon" />;
      default: return <Eye className="privacy-icon" />;
    }
  };

  const getPrivacyLabel = () => {
    switch (privacySetting) {
      case 'only_me': return 'Private Mode';
      case 'family': return 'Family Sharing';
      case 'authorities': return 'Authority Access';
      default: return 'Private';
    }
  };

  const activeFeatures = [
    {
      id: 'geo-fencing',
      icon: <Shield className="feature-icon" />,
      name: 'Smart Geo-Fencing',
      status: 'Active',
      description: `${geoFences.length} zones monitored`
    },
    {
      id: 'danger-detection',
      icon: <AlertTriangle className="feature-icon" />,
      name: 'Danger Zone Alerts',
      status: 'Armed',
      description: 'Real-time threat detection'
    },
    {
      id: 'family-connect',
      icon: <Users className="feature-icon" />,
      name: 'Family Notifications',
      status: privacySetting === 'only_me' ? 'Disabled' : 'Active',
      description: getPrivacyLabel()
    },
    {
      id: 'emergency-response',
      icon: <MapPin className="feature-icon" />,
      name: 'Emergency SOS',
      status: 'Ready',
      description: 'One-tap emergency assistance'
    }
  ];

  return (
    <div className="active-shields-list">
      <div className="shields-header">
        <h3>Active Safety Features</h3>
        <div className="privacy-indicator">
          {getPrivacyIcon()}
          <span>{getPrivacyLabel()}</span>
        </div>
      </div>
      
      <div className="shields-grid">
        {activeFeatures.map(feature => (
          <div key={feature.id} className="shield-card">
            <div className="shield-icon-container">
              {feature.icon}
              <div className={`status-dot ${feature.status.toLowerCase().replace(' ', '-')}`}></div>
            </div>
            <div className="shield-info">
              <h4>{feature.name}</h4>
              <p className="shield-status">{feature.status}</p>
              <p className="shield-description">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      {activeZones.length > 0 && (
        <div className="current-zones">
          <h4>Currently Inside Zones</h4>
          <div className="zones-list">
            {activeZones.map(zoneId => {
              const zone = geoFences.find(f => f.id === zoneId);
              return zone ? (
                <div key={zoneId} className={`zone-item ${zone.type}`}>
                  <div className="zone-indicator"></div>
                  <span>{zone.name}</span>
                  <div className="safety-score">
                    Safety: {zone.safety_score}/100
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveShieldsList;