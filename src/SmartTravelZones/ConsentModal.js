import React, { useState } from 'react';
import { MapPin, Shield, Users, Lock, Eye } from 'lucide-react';

const ConsentModal = ({ onAccept, onDeny }) => {
  const [selectedPrivacy, setSelectedPrivacy] = useState('family');

  const privacyOptions = [
    {
      id: 'only_me',
      icon: <Eye className="privacy-option-icon" />,
      title: 'Only Me',
      description: 'Keep all location data private. Events stored locally only.',
      features: ['No location sharing', 'Local alerts only', 'Full privacy']
    },
    {
      id: 'family',
      icon: <Users className="privacy-option-icon" />,
      title: 'Family',
      description: 'Share safety alerts with family members during emergencies.',
      features: ['Emergency notifications', 'Family safety alerts', 'Zone entry sharing']
    },
    {
      id: 'authorities',
      icon: <Lock className="privacy-option-icon" />,
      title: 'Authorities',
      description: 'Full access for emergency services and local authorities.',
      features: ['Emergency services access', 'Real-time location', 'Full safety coverage']
    }
  ];

  return (
    <div className="consent-modal-overlay">
      <div className="consent-modal">
        <div className="modal-header">
          <div className="modal-icon">
            <Shield className="shield-icon" />
          </div>
          <h2>Smart Travel Zones</h2>
          <p>Enable location-based safety features</p>
        </div>

        <div className="location-request">
          <div className="request-icon">
            <MapPin className="map-icon pulsing" />
          </div>
          <h3>Location Access Required</h3>
          <p>
            Smart Travel Zones uses your device location to provide real-time safety alerts, 
            geo-fence monitoring, and emergency assistance. Your location is processed securely 
            and used only for safety features.
          </p>
        </div>

        <div className="privacy-settings">
          <h4>Choose Your Privacy Level</h4>
          <div className="privacy-options">
            {privacyOptions.map(option => (
              <div 
                key={option.id} 
                className={`privacy-option ${selectedPrivacy === option.id ? 'selected' : ''}`}
                onClick={() => setSelectedPrivacy(option.id)}
              >
                <div className="option-header">
                  {option.icon}
                  <div>
                    <h5>{option.title}</h5>
                    <p>{option.description}</p>
                  </div>
                  <div className="radio-check">
                    <div className={`radio ${selectedPrivacy === option.id ? 'checked' : ''}`}></div>
                  </div>
                </div>
                <ul className="option-features">
                  {option.features.map((feature, idx) => (
                    <li key={idx}>✓ {feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="deny-btn" onClick={onDeny}>
            Continue Without Location
          </button>
          <button 
            className="allow-btn" 
            onClick={() => onAccept(selectedPrivacy)}
          >
            <Shield className="btn-icon" />
            Enable Safety Features
          </button>
        </div>

        <div className="privacy-notice">
          <p>
            <small>
              🔒 Your privacy is protected. Location data is processed according to your 
              selected privacy level and is never sold or shared with third parties.
            </small>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsentModal;