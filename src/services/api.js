const API_URL = 'http://localhost:5000/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Something went wrong');
  }
  return response.json();
};

export const getDestinations = async () => {
  const response = await fetch(`${API_URL}/destinations`);
  return handleResponse(response);
};

export const getItineraries = async () => {
  const response = await fetch(`${API_URL}/itineraries`);
  return handleResponse(response);
};

export const getItineraryById = async (id) => {
  const response = await fetch(`${API_URL}/itineraries/${id}`);
  return handleResponse(response);
};

export const createItinerary = async (itineraryData) => {
  const response = await fetch(`${API_URL}/itineraries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...itineraryData, itinerary_data: JSON.stringify(itineraryData.itinerary_data) }),
  });
  return handleResponse(response);
};

export const updateItinerary = async (id, itineraryData) => {
  const response = await fetch(`${API_URL}/itineraries/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...itineraryData, itinerary_data: JSON.stringify(itineraryData.itinerary_data) }),
  });
  return handleResponse(response);
};

export const deleteItinerary = async (id) => {
  const response = await fetch(`${API_URL}/itineraries/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};