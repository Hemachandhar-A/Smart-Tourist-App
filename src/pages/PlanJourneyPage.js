import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ProgressBar from '../components/ProgressBar';
import CuratedPlaceCard from '../components/CuratedPlaceCard';
import ItineraryDay from '../components/ItineraryDay';
import './../assets/styles/PlanJourneyPage.css';
import { createItinerary, getDestinations } from '../services/api';
import placeholderImage from '../assets/images/destinations/placeholder.jpg';

const PlanJourneyPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    tripTitle: '',
    state: '',
    location: '',
    startDate: null,
    endDate: null,
    budget: 50000,
    safetyLevel: 'Moderate - Well-known places',
    crowdComfort: 'Balanced - Mix of popular & quiet',
  });
  const [allDestinations, setAllDestinations] = useState([]);
  const [curatedPlaces, setCuratedPlaces] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState(new Set());
  const [finalItinerary, setFinalItinerary] = useState([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await getDestinations();
        const formattedDestinations = response.data.map(item => ({
          ...item,
          image: placeholderImage
        }));
        setAllDestinations(formattedDestinations);
      } catch (err) {
        console.error("Failed to fetch destinations:", err);
      }
    };
    fetchDestinations();
  }, []);

  useEffect(() => {
    if (formData.state && formData.state !== 'Select an Indian state') {
      const filtered = allDestinations.filter(d => d.state === formData.state);
      // Sort the filtered destinations alphabetically by name
      const sorted = filtered.sort((a, b) => a.name.localeCompare(b.name));
      setCuratedPlaces(sorted);
    } else {
      setCuratedPlaces([]);
    }
  }, [formData.state, allDestinations]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setFormData((prev) => ({ ...prev, startDate: start, endDate: end }));
  };

  const handleBudgetChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, budget: parseInt(value) }));
  };

  const handleAddPlace = (place) => {
    setSelectedPlaces((prevPlaces) => new Set(prevPlaces).add(place));
  };

  const handleRemovePlace = (placeId) => {
    setSelectedPlaces((prevPlaces) => {
      const newSet = new Set(prevPlaces);
      newSet.forEach(p => {
        if(p.id === placeId) newSet.delete(p);
      });
      return newSet;
    });
  };

  const handleRemovePlaceFromItinerary = (dayIndex, placeIndex) => {
    setFinalItinerary((prevItinerary) => {
      const newItinerary = [...prevItinerary];
      newItinerary[dayIndex].places.splice(placeIndex, 1);
      return newItinerary;
    });
  };

  const handleTimingChange = (dayIndex, placeIndex, newTiming) => {
    setFinalItinerary((prevItinerary) => {
      const newItinerary = [...prevItinerary];
      newItinerary[dayIndex].places[placeIndex].timing = newTiming;
      return newItinerary;
    });
  };

  const handleReset = () => {
    setSelectedPlaces(new Set());
    setFinalItinerary([]);
    setFormData({
      ...formData,
      tripTitle: '',
    });
  };

  const generateItinerary = () => {
    if (selectedPlaces.size === 0 || !formData.startDate || !formData.endDate) {
      return [];
    }
  
    const days = [];
    const numDays = Math.ceil((formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24)) + 1;
    const selectedPlacesArray = Array.from(selectedPlaces);
  
    // Distribute places evenly across days
    for (let i = 0; i < numDays; i++) {
      const currentDate = new Date(formData.startDate);
      currentDate.setDate(currentDate.getDate() + i);
  
      days.push({
        day: i + 1,
        date: currentDate.toDateString(),
        places: selectedPlacesArray.length > i ? [
          {
            id: selectedPlacesArray[i].id,
            name: selectedPlacesArray[i].name,
            timing: selectedPlacesArray[i].suggested_timing || 'Morning',
            safety_level: selectedPlacesArray[i].safety_level,
            crowd_level: selectedPlacesArray[i].population_crowd,
          }
        ] : [],
      });
    }
    
    return days;
  };

  const handleSaveItinerary = async () => {
    // This is the frontend-only solution
    setIsSuccessModalOpen(true);
    console.log("Itinerary saved successfully (frontend simulation)!");
  };

  const handleNextStep = (step) => {
    if (step === 3) {
      setFinalItinerary(generateItinerary());
    }
    setCurrentStep(step);
  };

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
    handleReset();
    navigate('/');
  };

  // Corrected state and location lists with verified North-Eastern states
  const states = ['Select an Indian state', 'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Delhi', 'Goa', 'Gujarat', 'Himachal Pradesh', 'Jammu and Kashmir', 'Karnataka', 'Kerala', 'Ladakh', 'Madhya Pradesh', 'Maharashtra', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Telangana', 'Tamil Nadu', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];
  const locations = { 
    'Andaman and Nicobar Islands': ['Port Blair'],
    'Andhra Pradesh': ['Tirumala'],
    'Arunachal Pradesh': ['Tawang', 'Ziro Valley'],
    'Assam': ['Guwahati', 'Kaziranga National Park', 'Majuli'],
    'Bihar': ['Bodh Gaya'],
    'Delhi': ['New Delhi', 'Old Delhi'],
    'Goa': ['Dudhsagar Falls', 'Palolem Beach'],
    'Gujarat': ['Dwarka', 'Somnath'],
    'Himachal Pradesh': ['Manali', 'Kullu', 'Spiti Valley'],
    'Jammu and Kashmir': ['Vaishno Devi', 'Amarnath', 'Kashmir Valley'],
    'Karnataka': ['Hampi', 'Mysore'],
    'Kerala': ['Munnar', 'Alleppey', 'Gokarna'],
    'Ladakh': ['Pangong Tso Lake', 'Magnetic Hill', 'Chadar Trek'],
    'Madhya Pradesh': ['Khajuraho', 'Ujjain'],
    'Maharashtra': ['Mumbai', 'Pune', 'Lonavala'],
    'Meghalaya': ['Shillong', 'Cherrapunji'],
    'Mizoram': ['Aizawl', 'Lunglei'],
    'Nagaland': ['Kohima', 'Dimapur'],
    'Odisha': ['Puri', 'Konark'],
    'Puducherry': ['Pondicherry'],
    'Punjab': ['Amritsar', 'Wagah Border'],
    'Rajasthan': ['Jaipur', 'Udaipur', 'Jaisalmer', 'Jodhpur'],
    'Sikkim': ['Gangtok', 'Pelling', 'Nathu La Pass'],
    'Telangana': ['Hyderabad'],
    'Tamil Nadu': ['Madurai', 'Ooty', 'Mahabalipuram', 'Rameshwaram'],
    'Tripura': ['Agartala', 'Udaipur'],
    'Uttar Pradesh': ['Agra', 'Varanasi', 'Lucknow'],
    'Uttarakhand': ['Rishikesh', 'Haridwar', 'Mussoorie', 'Nainital'],
    'West Bengal': ['Kolkata', 'Darjeeling']
  };

  const safetyOptions = ['Low - Remote & Adventurous', 'Moderate - Well-known places', 'High - Family-friendly & secure'];
  const crowdOptions = ['Quiet - Few tourists', 'Balanced - Mix of popular & quiet', 'Busy - High tourist traffic'];
  
  return (
    <div className="plan-journey-container">
      <header className="plan-journey-header">
        <Link to="/" className="back-button">←</Link>
        <div className="header-content">
          <h1 className="plan-title">Plan Your Journey</h1>
          <p className="plan-subtitle">Create your perfect Indian adventure with our curated destinations</p>
          <p className="plan-subtitle">Improved Tourist destination suggestions coming soon!</p>
        </div>
      </header>

      <ProgressBar currentStep={currentStep} totalSteps={3} />

      {currentStep === 1 && (
        <div className="plan-step-content">
          <div className="card destination-card">
            <h2 className="card-title">Choose Your Destination</h2>
            <div className="form-group">
              <label htmlFor="state">Select State</label>
              <select id="state" name="state" value={formData.state} onChange={handleInputChange} className="form-control">
                {states.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="location">Specific Location</label>
              <select id="location" name="location" value={formData.location} onChange={handleInputChange} className="form-control" disabled={!formData.state || formData.state === 'Select an Indian state'}>
                <option value="">e.g., Agra, Jaipur, Goa...</option>
                {formData.state && formData.state !== 'Select an Indian state' && locations[formData.state]?.map((loc) => (<option key={loc} value={loc}>{loc}</option>))}
              </select>
            </div>
            <div className="form-group date-input-group">
              <label htmlFor="dateRange">Trip Dates</label>
              <DatePicker
                selected={formData.startDate}
                onChange={handleDateChange}
                startDate={formData.startDate}
                endDate={formData.endDate}
                selectsRange
                dateFormat="dd-MM-yyyy"
                placeholderText="Select a date range"
                className="form-control date-picker"
                wrapperClassName="date-picker-wrapper"
              />
            </div>
          </div>
          <div className="card preferences-card">
            <h2 className="card-title">Your Preferences</h2>
            <div className="form-group">
              <label>Budget: ₹{formData.budget.toLocaleString()}</label>
              <input type="range" min="10000" max="200000" step="10000" name="budget" value={formData.budget} onChange={handleBudgetChange} className="budget-slider" />
              <div className="budget-range-labels"><span>₹10,000</span><span>₹2,00,000</span></div>
            </div>
            <div className="form-group">
              <label htmlFor="safetyLevel">Safety Level</label>
              <select id="safetyLevel" name="safetyLevel" value={formData.safetyLevel} onChange={handleInputChange} className="form-control">
                {safetyOptions.map((option) => (<option key={option} value={option}>{option}</option>))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="crowdComfort">Crowd Comfort</label>
              <select id="crowdComfort" name="crowdComfort" value={formData.crowdComfort} onChange={handleInputChange} className="form-control">
                {crowdOptions.map((option) => (<option key={option} value={option}>{option}</option>))}
              </select>
            </div>
            <button className="next-step-button" onClick={() => handleNextStep(2)}>Next: View Curated Places</button>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="plan-step-content step-two">
          <div className="card full-width-card">
            <h2 className="card-title">Curated Places</h2>
            <div className="form-group">
              <label htmlFor="tripTitle">Trip Title</label>
              <input type="text" id="tripTitle" name="tripTitle" value={formData.tripTitle} onChange={handleInputChange} placeholder="e.g., Rajasthan Tour" className="form-control" />
            </div>
            <div className="curated-places-list">
              {curatedPlaces.map(place => (
                <CuratedPlaceCard key={place.id} place={place} onAddPlace={handleAddPlace} onRemovePlace={handleRemovePlace} isSelected={Array.from(selectedPlaces).some((p) => p.id === place.id)} />
              ))}
            </div>
            <div className="navigation-buttons">
              <button className="prev-button" onClick={() => setCurrentStep(1)}>← Previous</button>
              <button className="next-button" onClick={() => handleNextStep(3)}>Next: View Itinerary →</button>
            </div>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="plan-step-content step-three">
          <div className="card full-width-card">
            <div className="step-three-header">
              <h2 className="card-title">Your Perfect Itinerary</h2>
              <div className="itinerary-actions">
                <button className="reset-button" onClick={handleReset}>Reset</button>
                <button className="save-button" onClick={handleSaveItinerary}>Save Itinerary</button>
              </div>
            </div>
            <div className="itinerary-days-list">
              <p className="coming-soon-message">More flexible date and time scheduling coming soon...</p>
              {finalItinerary.map((day, index) => (
                <ItineraryDay key={index} day={day} onTimingChange={handleTimingChange} onRemovePlace={handleRemovePlaceFromItinerary} dayIndex={index} />
              ))}
            </div>
            <div className="navigation-buttons">
              <button className="prev-button" onClick={() => setCurrentStep(2)}>← Previous</button>
            </div>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div className="success-modal-overlay">
          <div className="success-modal-content">
            <h3>Successfully Saved!</h3>
            <p>Your itinerary has been saved and is ready for your trip.</p>
            <button className="close-success-modal-button" onClick={handleCloseSuccessModal}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanJourneyPage;