import React, { useState } from 'react';
import './../assets/styles/AddToItineraryModal.css';
import { createItinerary, getItineraryById, updateItinerary } from '../services/api';

const AddToItineraryModal = ({ destination, onClose, existingItineraries }) => {
  const [selectedItineraryId, setSelectedItineraryId] = useState('');
  const [newItineraryTitle, setNewItineraryTitle] = useState('');

  const handleCreateAndAdd = async () => {
    if (!newItineraryTitle) {
      alert('Please enter a title for the new itinerary.');
      return;
    }
    const newItineraryData = {
      title: newItineraryTitle,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      itinerary_data: [
        {
          day: 1,
          date: new Date().toDateString(),
          places: [{ name: destination.name, timing: 'Morning' }],
        },
      ],
      status: 'upcoming',
    };
    try {
      await createItinerary(newItineraryData);
      alert('New itinerary created and destination added!');
      onClose();
    } catch (error) {
      alert('Failed to create new itinerary.');
      console.error('Error creating new itinerary:', error);
    }
  };

  const handleAddToExisting = async () => {
    if (!selectedItineraryId) {
      alert('Please select an existing itinerary.');
      return;
    }

    try {
      const response = await getItineraryById(selectedItineraryId);
      const existingTrip = response.data;
      
      const newPlace = { name: destination.name, timing: 'Morning' };
      const updatedItineraryData = { ...existingTrip };
      
      if (!updatedItineraryData.itinerary_data || updatedItineraryData.itinerary_data.length === 0) {
        updatedItineraryData.itinerary_data = [{
          day: 1,
          date: new Date().toDateString(),
          places: [newPlace]
        }];
      } else {
        const lastDay = updatedItineraryData.itinerary_data[updatedItineraryData.itinerary_data.length - 1];
        lastDay.places.push(newPlace);
      }

      await updateItinerary(selectedItineraryId, updatedItineraryData);
      alert('Destination added to existing itinerary!');
      onClose();
    } catch (error) {
      alert('Failed to add to existing itinerary.');
      console.error('Error adding to existing itinerary:', error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h3>Add to Itinerary</h3>
        <p>Selected Destination: <strong>{destination.name}</strong></p>
        
        <div className="modal-section">
          <h4>Create New Itinerary</h4>
          <input
            type="text"
            placeholder="Enter New Trip Title"
            value={newItineraryTitle}
            onChange={(e) => setNewItineraryTitle(e.target.value)}
            className="input-field"
          />
          <button onClick={handleCreateAndAdd} className="action-button primary-button">
            Create & Add
          </button>
        </div>

        <div className="modal-section">
          <h4>Add to Existing Itinerary</h4>
          <select
            value={selectedItineraryId}
            onChange={(e) => setSelectedItineraryId(e.target.value)}
            className="input-field"
          >
            <option value="">Select a trip</option>
            {existingItineraries.filter(it => it.status === 'upcoming' || it.status === 'ongoing').map((it) => (
              <option key={it.id} value={it.id}>
                {it.title} ({it.status})
              </option>
            ))}
          </select>
          <button onClick={handleAddToExisting} className="action-button secondary-button">
            Add to Selected
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToItineraryModal;