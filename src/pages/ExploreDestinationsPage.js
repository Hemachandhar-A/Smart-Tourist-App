import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DestinationCard from '../components/DestinationCard';
import AddToItineraryModal from '../components/AddToItineraryModal';
import './../assets/styles/ExploreDestinationsPage.css';
import { getDestinations, getItineraries } from '../services/api';
import placeholderImage from '../assets/images/destinations/placeholder.jpg';

const ExploreDestinationsPage = () => {
  const [allDestinations, setAllDestinations] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [destinationsResponse, itinerariesResponse] = await Promise.all([
          getDestinations(),
          getItineraries(),
        ]);

        const formattedDestinations = destinationsResponse.data.map(item => ({
          id: item.id,
          name: item.name,
          state: item.state,
          description: item.description,
          type: item.type,
          safety: item.safety_level,
          crowd: item.population_crowd,
          image: placeholderImage, // Use the single placeholder image
        }));
        setAllDestinations(formattedDestinations);

        const formattedItineraries = itinerariesResponse.data.map(item => ({
          id: item.id,
          title: item.title,
          status: item.status,
          itinerary_data: item.itinerary_data,
        }));
        setItineraries(formattedItineraries);

      } catch (err) {
        setError('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const destinationFilters = ['All', 'Historical', 'Natural', 'Adventure', 'Pilgrimage'];

  const filteredDestinations = allDestinations.filter(destination => {
    const matchesSearch = destination.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter.toLowerCase() === 'all' || (destination.type && destination.type.toLowerCase() === activeFilter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  const handleOpenModal = (destination) => {
    setSelectedDestination(destination);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDestination(null);
  };

  if (loading) return <div className="loading-state">Loading...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="explore-page-container">
      <header className="explore-header">
        <Link to="/home" className="back-button">← Back to Home</Link>
        <div className="title-container">
          <h1 className="explore-title">Explore Destinations</h1>
          <p className="subtitle">Verified images and destination filters coming soon !</p>
        </div>
        <div className="cta-button-container">
          <Link to="/plan" className="plan-custom-button">+ Plan Custom Trip</Link>
        </div>
      </header>

      <div className="search-and-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for a destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          {destinationFilters.map(filter => (
            <button
              key={filter}
              className={`filter-button ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      <main className="destination-list">
        {filteredDestinations.length > 0 ? (
          filteredDestinations.map(destination => (
            <DestinationCard key={destination.id} destination={destination} onAddClick={handleOpenModal} />
          ))
        ) : (
          <p className="no-results">No destinations found. Try another search or filter.</p>
        )}
      </main>
      {isModalOpen && (
        <AddToItineraryModal
          destination={selectedDestination}
          onClose={handleCloseModal}
          existingItineraries={itineraries}
        />
      )}
    </div>
  );
};

export default ExploreDestinationsPage;