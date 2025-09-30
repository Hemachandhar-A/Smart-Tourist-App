import React from 'react';
import { Shield, MapPin, Users, AlertTriangle } from 'lucide-react';

const HeaderHero = ({ locationPermission }) => {
  return (
    <div className="header-hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            <Shield className="title-icon" />
            Smart Travel Zones
          </h1>
          <p className="hero-subtitle">
            Your digital guardian on every trip - Real-time safety with intelligent geo-fencing
          </p>
          
          <div className="status-indicators">
            <div className={`status-item ${locationPermission ? 'active' : 'inactive'}`}>
              <MapPin className="status-icon" />
              <span>Location {locationPermission ? 'Active' : 'Disabled'}</span>
            </div>
            
            <div className="status-item active">
              <Shield className="status-icon" />
              <span>Shields Online</span>
            </div>
            
            <div className="status-item active">
              <AlertTriangle className="status-icon" />
              <span>Emergency Ready</span>
            </div>
          </div>
          
          <div className="demo-badge">
            <span>🚨 DEMO MODE - Simulated zones using real device location</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderHero;