import React from 'react';
import { Link } from 'react-router-dom';
import './../assets/styles/ItineraryCard.css';

const ItineraryCard = ({ itinerary, onViewDetails }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'ongoing':
        return 'status-ongoing';
      case 'upcoming':
        return 'status-upcoming';
      case 'past':
        return 'status-past';
      default:
        return '';
    }
  };

  return (
    <div className="itinerary-card card">
      <div className="card-header">
        <h4 className="trip-title">{itinerary.title}</h4>
        <div className={`trip-status ${getStatusClass(itinerary.status)}`}>{itinerary.status}</div>
      </div>
      <div className="card-body">
        <p className="trip-location">
          <i className="fas fa-map-marker-alt"></i> {itinerary.location}
        </p>
        <p className="trip-dates">
          <i className="far fa-calendar-alt"></i> {itinerary.dates}
        </p>
        <div className="trip-metadata">
          <span className="trip-budget">₹{itinerary.budget}</span>
          <span className="trip-safety">{itinerary.safety_level}</span>
          <span className="trip-crowd">{itinerary.crowd_level}</span>
        </div>
        <p className="trip-summary">{itinerary.places_count} days • {itinerary.places_count * 2} places to visit</p>
        <div className="card-buttons">
          <button className="card-button view" onClick={() => onViewDetails(itinerary.id)}>View Details</button>
        </div>
      </div>
    </div>
  );
};

export default ItineraryCard;