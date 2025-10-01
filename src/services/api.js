const API_URL = 'https://smart-tourist-exploredest-backend.onrender.com/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Something went wrong');
  }
  return response.json();
};

const images = {
  // Example: map destination IDs or names to images
  'taj-mahal': require('../assets/images/destinations/taj-mahal.png'),
  'gateway-of-india': require('../assets/images/destinations/gateway-of-india.png'),
  'jaipur-palace': require('../assets/images/destinations/jaipur-palace.png'),
  'hawa-mahal': require('../assets/images/destinations/hawa-mahal.png'),
  'qutub-minar': require('../assets/images/destinations/qutub-minar.png'),
  'meenakshi-amman-temple': require('../assets/images/destinations/meenakshi-amman-temple.png'),
  'amer-fort': require('../assets/images/destinations/amer-fort.png'),
  'red-fort': require('../assets/images/destinations/red-fort.png'),
  'golden-temple': require('../assets/images/destinations/golden-temple.png'),
  'humayun"s-tomb': require('../assets/images/destinations/humayun-tomb.png'),
  'mysore-palace': require('../assets/images/destinations/mysore-palace.png'),
  'alleppey-backwaters': require('../assets/images/destinations/alleppey-backwaters.png'),
  'periyar-national-park': require('../assets/images/destinations/periyar-national-park.png'),
  'dudhsagar-falls': require('../assets/images/destinations/dudhsagar-falls.png'),
  'palolem-beach': require('../assets/images/destinations/palolem-beach.png'),
  'ajanta-caves': require('../assets/images/destinations/ajanta-caves.png'),
  'ellora-caves': require('../assets/images/destinations/ellora-caves.png')








  // Add more mappings
};

export const getDestinationImage = (destination) => {
  // Try to get image by ID first, then by name
  const imageKey = destination.name.toLowerCase().replace(/\s+/g, '-');
  return images[imageKey] || images[destination.id] || require('../assets/images/destinations/placeholder.jpg');
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