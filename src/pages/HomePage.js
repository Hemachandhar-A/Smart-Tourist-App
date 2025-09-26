import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import itinerariesData from '../data/itinerariesData';
import Calendar from '../components/Calendar';
import ItineraryCard from '../components/ItineraryCard';
import ItineraryDetailsModal from '../components/ItineraryDetailsModal';
import './../assets/styles/HomePage.css';
import background from './../assets/images/home-background.jpg';

const HomePage = () => {
  const [itineraries] = useState(itinerariesData);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItineraryId, setSelectedItineraryId] = useState(null);

  const filteredItineraries = itineraries.filter(
    (trip) => activeFilter === 'All' || trip.status === activeFilter
  );

  const highlightedDates = itineraries.flatMap(trip => {
    if (trip.startDate && trip.endDate) {
      const dates = [];
      let currentDate = new Date(trip.startDate);
      while (currentDate <= trip.endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return dates;
    }
    return [];
  });

  const getStatusCount = (status) => {
    if (status === 'All') return itineraries.length;
    return itineraries.filter(trip => trip.status === status).length;
  };

  const handleViewDetails = (id) => {
    setSelectedItineraryId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItineraryId(null);
  };

  return (
    <div className="homepage-main-container">
      <div className="hero-section-container" style={{ backgroundImage: `url(${background})` }}>
        <main className="hero-content">
          <h1>Plan Your Journey, Perfectly.</h1>
          <p>Create a detailed, safe, and personalized itinerary for your next adventure across India.</p>
          <div className="cta-buttons">
            <Link to="/plan" className="cta-button primary">Start Planning</Link>
            <Link to="/explore" className="cta-button secondary">Explore Destinations</Link>
          </div>
        </main>
      </div>

      <section className="below-fold-content">
        <div className="my-itineraries-dashboard card">
          <div className="your-journeys-container card">
            <h2>Your Journeys</h2>
            <Calendar highlightedDates={highlightedDates} />
            <div className="upcoming-features">
              <h3>Upcoming Features</h3>
              <ul>
                <li>More flexible date and time scheduling</li>
                <li>Offline access for saved itineraries</li>
                <li>Push notifications for reminders</li>
                <li>Social media sharing of itineraries</li>
              </ul>
            </div>

          </div>
          <div className="my-itineraries-list-container card">
            <div className="itinerary-list-header">
              <h2>My Itineraries</h2>
              <div className="itinerary-actions-header">
                <Link to="/explore" className="explore-button">Explore Destinations</Link>
                <Link to="/plan" className="plan-button">+ Plan New Trip</Link>
              </div>
            </div>
            <div className="filter-tabs">
              <button
                className={`filter-tab ${activeFilter === 'All' ? 'active' : ''}`}
                onClick={() => setActiveFilter('All')}
              >
                All Trips <span className="count">{getStatusCount('All')}</span>
              </button>
              <button
                className={`filter-tab ${activeFilter === 'upcoming' ? 'active' : ''}`}
                onClick={() => setActiveFilter('upcoming')}
              >
                Upcoming <span className="count">{getStatusCount('upcoming')}</span>
              </button>
              <button
                className={`filter-tab ${activeFilter === 'ongoing' ? 'active' : ''}`}
                onClick={() => setActiveFilter('ongoing')}
              >
                Ongoing <span className="count">{getStatusCount('ongoing')}</span>
              </button>
              <button
                className={`filter-tab ${activeFilter === 'past' ? 'active' : ''}`}
                onClick={() => setActiveFilter('past')}
              >
              Past <span className="count">{getStatusCount('past')}</span>
              </button>
            </div>
            <div className="itinerary-list">
              {filteredItineraries.length > 0 ? (
                filteredItineraries.map((itinerary) => (
                  <ItineraryCard key={itinerary.id} itinerary={itinerary} onViewDetails={handleViewDetails} />
                ))
              ) : (
                <p className="no-itineraries">No itineraries found.</p>
              )}
            </div>
          </div>
        </div>
      </section>
      {isModalOpen && <ItineraryDetailsModal itineraryId={selectedItineraryId} onClose={handleCloseModal} />}
    </div>
  );
};

export default HomePage;