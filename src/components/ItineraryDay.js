import React from 'react';
import './../assets/styles/ItineraryDay.css';

const ItineraryDay = ({ day, onTimingChange, onRemovePlace, dayIndex }) => {
  const timings = ['Morning', 'Afternoon', 'Evening'];
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

  const getCrowdClass = (crowd) => {
    if (!crowd) return '';
    switch (crowd.toLowerCase()) {
      case 'high':
        return 'crowd-high';
      case 'medium':
        return 'crowd-medium';
      case 'low':
        return 'crowd-low';
      default:
        return '';
    }
  };

  return (
    <div className="itinerary-day-card card">
      <h3 className="day-header">
        Day {day.day}: {day.date}
      </h3>
      <ul className="places-list">
        {day.places.map((place, placeIndex) => (
          <li key={placeIndex} className="place-item">
            <div className="place-main-info">
              <select 
                value={place.timing} 
                onChange={(e) => onTimingChange(dayIndex, placeIndex, e.target.value)}
                className="timing-dropdown"
              >
                {timings.map(timing => (
                  <option key={timing} value={timing}>{timing}</option>
                ))}
              </select>
              <div className="place-text-content">
                <span className="place-name">{place.name}</span>
                <div className="place-meta">
                  <span className={`place-safety ${getSafetyClass(place.safety_level)}`}>{place.safety_level} Safety</span>
                  <span className={`place-crowd ${getCrowdClass(place.crowd_level)}`}>{place.crowd_level} Crowd</span>
                </div>
              </div>
            </div>
            <button className="remove-button" onClick={() => onRemovePlace(dayIndex, placeIndex)}>
              &times;
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ItineraryDay;