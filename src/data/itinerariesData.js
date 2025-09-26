// src/data/itinerariesData.js

// Using a consistent date for "Now" to easily categorize trips as upcoming, ongoing, past.
// For demonstration, let's assume "today" is September 21, 2025.
const today = new Date('2025-09-21T12:00:00Z');

const itinerariesData = [
  {
    id: 1,
    title: "Goa Adventure",
    location: "Goa, Karnataka", 
    startDate: new Date('2024-09-30T00:00:00Z'),
    endDate: new Date('2024-10-02T00:00:00Z'),
    budget: 50000,
    safety_level: "High Safety",
    crowd_level: "Moderate Crowd",
    places_count: 2,
    itinerary_data: [
      {
        day: 1,
        date: "Mon Sep 30 2024",
        places: [
          { name: "Dudhsagar Falls", timing: "Morning", safety_level: "Medium Safety", crowd_level: "High Crowd" },
          { name: "Spice Plantation Tour", timing: "Afternoon", safety_level: "High Safety", crowd_level: "Moderate Crowd" },
        ],
      },
      {
        day: 2,
        date: "Tue Oct 01 2024",
        places: [
          { name: "Palolem Beach", timing: "Morning", safety_level: "High Safety", crowd_level: "Medium Crowd" },
          { name: "Anjuna Flea Market", timing: "Evening", safety_level: "Medium Safety", crowd_level: "High Crowd" },
        ],
      },
    ],
    status: 'past',
  },
  {
    id: 2,
    title: "Golden Triangle Explorer",
    location: "Agra, Uttar Pradesh",
    startDate: new Date('2025-03-15T00:00:00Z'),
    endDate: new Date('2025-03-20T00:00:00Z'),
    budget: 75000,
    safety_level: "High Safety",
    crowd_level: "Medium Crowd",
    places_count: 3,
    itinerary_data: [
      {
        day: 1,
        date: "Sat Mar 15 2025",
        places: [
          { name: "Taj Mahal", timing: "Morning", safety_level: "High Safety", crowd_level: "High Crowd" },
          { name: "Agra Fort", timing: "Afternoon", safety_level: "High Safety", crowd_level: "Medium Crowd" },
        ],
      },
      {
        day: 2,
        date: "Sun Mar 16 2025",
        places: [
          { name: "Fatehpur Sikri", timing: "Morning", safety_level: "Medium Safety", crowd_level: "Medium Crowd" },
          { name: "Mehtab Bagh", timing: "Evening", safety_level: "High Safety", crowd_level: "Low Crowd" },
        ],
      },
      {
        day: 3,
        date: "Mon Mar 17 2025",
        places: [
          { name: "Humayun's Tomb", timing: "Morning", safety_level: "High Safety", crowd_level: "Medium Crowd" },
          { name: "Qutub Minar", timing: "Afternoon", safety_level: "High Safety", crowd_level: "Medium Crowd" },
        ],
      },
    ],
    status: 'past',
  },
  {
    id: 3,
    title: "Rajasthan Desert Safari",
    location: "Jaipur, Rajasthan",
    startDate: new Date('2025-10-10T00:00:00Z'),
    endDate: new Date('2025-10-14T00:00:00Z'),
    budget: 60000,
    safety_level: "High Safety",
    crowd_level: "Medium Crowd",
    places_count: 2,
    itinerary_data: [
      {
        day: 1,
        date: "Fri Oct 10 2025",
        places: [
          { name: "Hawa Mahal", timing: "Morning", safety_level: "High Safety", crowd_level: "High Crowd" },
          { name: "Amer Fort", timing: "Afternoon", safety_level: "High Safety", crowd_level: "Medium Crowd" },
        ],
      },
      {
        day: 2,
        date: "Sat Oct 11 2025",
        places: [
          { name: "City Palace", timing: "Morning", safety_level: "High Safety", crowd_level: "Medium Crowd" },
          { name: "Jantar Mantar", timing: "Afternoon", safety_level: "High Safety", crowd_level: "Medium Crowd" },
        ],
      },
    ],
    status: 'upcoming',
  },
  {
    id: 4,
    title: "Kerala Backwaters & Beaches",
    location: "Kochi, Kerala",
    startDate: new Date('2025-09-20T00:00:00Z'),
    endDate: new Date('2025-09-24T00:00:00Z'),
    budget: 55000,
    safety_level: "High Safety",
    crowd_level: "Medium Crowd",
    places_count: 2,
    itinerary_data: [
      {
        day: 1,
        date: "Sat Sep 20 2025",
        places: [
          { name: "Fort Kochi", timing: "Morning", safety_level: "High Safety", crowd_level: "Medium Crowd" },
          { name: "Chinese Fishing Nets", timing: "Afternoon", safety_level: "High Safety", crowd_level: "Medium Crowd" },
        ],
      },
      {
        day: 2,
        date: "Sun Sep 21 2025",
        places: [
          { name: "Mattancherry Palace", timing: "Morning", safety_level: "High Safety", crowd_level: "Low Crowd" },
          { name: "Jew Town", timing: "Afternoon", safety_level: "High Safety", crowd_level: "Medium Crowd" },
        ],
      },
    ],
    status: 'ongoing',
  },
];

export default itinerariesData;