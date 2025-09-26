const express = require('express');
const cors = require('cors');
const db = require('./db'); // Import the database connection
const itineraryRoutes = require('./routes/itineraryRoutes'); // Import the routes
const path = require('path');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Create tables if they don't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS tourist_places (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    description TEXT,
    budget TEXT,
    safety_level TEXT,
    population_crowd TEXT,
    image_url TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS user_itineraries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    itinerary_data TEXT,
    status TEXT
  )`);
});

// Use the API routes
app.use('/api', itineraryRoutes);

app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});