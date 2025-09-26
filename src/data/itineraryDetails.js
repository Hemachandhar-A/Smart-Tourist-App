// src/data/itineraryDetails.js

const itineraryDetails = {
  1: {
    id: 1,
    title: "Goa Adventure",
    dates: "Sep 30 - Oct 02, 2025",
    itinerary: [
      { day: 1, date: "Mon Sep 30 2025", places: [{ name: "Dudhsagar Falls", timing: "Morning" }, { name: "Spice Plantation Tour", timing: "Afternoon" }] },
      { day: 2, date: "Tue Oct 01 2025", places: [{ name: "Palolem Beach", timing: "Morning" }, { name: "Anjuna Flea Market", timing: "Evening" }] },
    ],
  },
  2: {
    id: 2,
    title: "Golden Triangle Explorer",
    dates: "Mar 15 - Mar 20, 2025",
    itinerary: [
      { day: 1, date: "Sat Mar 15 2025", places: [{ name: "Taj Mahal", timing: "Morning" }, { name: "Agra Fort", timing: "Afternoon" }] },
      { day: 2, date: "Sun Mar 16 2025", places: [{ name: "Fatehpur Sikri", timing: "Morning" }, { name: "Mehtab Bagh", timing: "Evening" }] },
    ],
  },
  3: {
    id: 3,
    title: "Rajasthan Desert Safari",
    dates: "Oct 10 - Oct 14, 2025",
    itinerary: [
      { day: 1, date: "Fri Oct 10 2025", places: [{ name: "Hawa Mahal", timing: "Morning" }, { name: "Amer Fort", timing: "Afternoon" }] },
      { day: 2, date: "Sat Oct 11 2025", places: [{ name: "City Palace", timing: "Morning" }, { name: "Jantar Mantar", timing: "Afternoon" }] },
    ],
  },
  4: {
    id: 4,
    title: "Kerala Backwaters & Beaches",
    dates: "Sep 20 - Sep 24, 2025",
    itinerary: [
      { day: 1, date: "Sat Sep 20 2025", places: [{ name: "Fort Kochi", timing: "Morning" }, { name: "Chinese Fishing Nets", timing: "Afternoon" }] },
      { day: 2, date: "Sun Sep 21 2025", places: [{ name: "Mattancherry Palace", timing: "Morning" }, { name: "Jew Town", timing: "Afternoon" }] },
    ],
  },
};

export default itineraryDetails;
