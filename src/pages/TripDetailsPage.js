import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './../assets/styles/TripDetailsPage.css';
import itineraryDetails from '../data/itineraryDetails';
import ItineraryDay from '../components/ItineraryDay'; // Import the ItineraryDay component

const TripDetailsPage = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    // We are now fetching from our hardcoded data instead of the API
    const tripData = itineraryDetails[id];
    setTrip(tripData);
  }, [id]);
  
  if (!trip) {
    return <div className="loading-state">Loading trip details...</div>;
  }
  
  return (
    <div className="trip-details-container">
      <header className="trip-details-header">
        <Link to="/" className="back-button">← Back to Home</Link>
        <div className="header-content">
          <h1 className="trip-details-title">{trip.title}</h1>
          <p className="trip-details-subtitle">{trip.dates}</p>
        </div>
      </header>

      <div className="itinerary-section">
        {trip.itinerary.map((day, dayIndex) => (
          <div key={dayIndex} className="itinerary-day-card card">
            <h3 className="day-header">
              Day {day.day} - {day.date}
            </h3>
            <ul className="places-list">
              {day.places.map((place, placeIndex) => (
                <li key={placeIndex} className="place-item">
                  <div className="place-details-row">
                    <div className="place-details-content">
                      <span className="place-timing">{place.timing}</span>
                      <span className="place-name">{place.name}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TripDetailsPage;