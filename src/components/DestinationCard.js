import React from 'react';
import './../assets/styles/DestinationCard.css';

const DestinationCard = ({ destination, onAddClick }) => {
  const getSafetyClass = (safety) => {
    switch (safety) {
      case 'High':
        return 'safety-high';
      case 'Medium':
        return 'safety-medium';
      case 'Low':
        return 'safety-low';
      default:
        return '';
    }
  };

  const getSafetyText = (safety) => {
    switch (safety) {
      case 'High':
        return 'Safe';
      case 'Medium':
        return 'Moderate Safety';
      case 'Low':
        return 'Unsafe';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="destination-card">
      <div className="destination-image-container">
        <img src={destination.image} alt={destination.name} className="destination-image" />
        <span className={`destination-type`}>{destination.type}</span>
      </div>
      <div className="destination-info">
        <h3>{destination.name}</h3>
        <p className="destination-state">{destination.state}</p>
        <div className="description-container">
          <p className="destination-description">{destination.description}</p>
        </div>
        <div className="destination-meta">
          <span className={`safety-indicator ${getSafetyClass(destination.safety)}`}>
            {getSafetyText(destination.safety)}
          </span>
          <span className="crowd-indicator">{destination.crowd} Crowd</span>
        </div>
      </div>
      <div className="destination-actions">
        <button className="add-to-itinerary-button" onClick={() => onAddClick(destination)}>Add to Itinerary</button>
      </div>
    </div>
  );
};

export default DestinationCard;