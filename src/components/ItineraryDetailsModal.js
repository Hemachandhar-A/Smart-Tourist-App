import React from 'react';
import itineraryDetails from '../data/itineraryDetails';
import './../assets/styles/ItineraryDetailsModal.css';

const ItineraryDetailsModal = ({ itineraryId, onClose }) => {
  const trip = itineraryDetails[itineraryId];
  if (!trip) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        <div className="modal-header">
          <h2>{trip.title}</h2>
          <p>{trip.dates}</p>
        </div>

        <div className="itinerary-details-list">
          {trip.itinerary.map((day) => (
            <div key={day.day} className="day-card">
              <h3>Day {day.day}: {day.date}</h3>
              <ul>
                {day.places.map((place, index) => (
                  <li key={index}>
                    <span className="timing">{place.timing}:</span> {place.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="proof-of-concept">
          <p>
            This is a proof of concept. More flexible features such as editing,
            sharing, and viewing detailed maps are coming soon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ItineraryDetailsModal;