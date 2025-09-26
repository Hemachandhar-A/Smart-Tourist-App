const express = require('express');
const db = require('../db');
const router = express.Router();

// GET all tourist places
router.get('/destinations', (req, res) => {
  db.all("SELECT * FROM tourist_places", [], (err, rows) => {
    if (err) {
      res.status(400).json({"error": err.message});
      return;
    }
    res.json({
      "message": "success",
      "data": rows
    });
  });
});

// GET all user itineraries
router.get('/itineraries', (req, res) => {
  db.all("SELECT * FROM user_itineraries", [], (err, rows) => {
    if (err) {
      res.status(400).json({"error": err.message});
      return;
    }
    res.json({
      "message": "success",
      "data": rows.map(row => ({
        ...row,
        itinerary_data: JSON.parse(row.itinerary_data)
      }))
    });
  });
});

// GET a single itinerary by ID
router.get('/itineraries/:id', (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM user_itineraries WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(400).json({"error": err.message});
      return;
    }
    if (row) {
      res.json({
        "message": "success",
        "data": {
          ...row,
          itinerary_data: JSON.parse(row.itinerary_data)
        }
      });
    } else {
      res.status(404).json({"message": "Itinerary not found"});
    }
  });
});

// POST a new itinerary
router.post('/itineraries', (req, res) => {
  const { title, start_date, end_date, itinerary_data, status } = req.body;
  const data = [title, start_date, end_date, JSON.stringify(itinerary_data), status];
  db.run(`INSERT INTO user_itineraries (title, start_date, end_date, itinerary_data, status) VALUES (?,?,?,?,?)`, data, function(err) {
    if (err) {
      res.status(400).json({"error": err.message});
      return;
    }
    res.status(201).json({
      "message": "success",
      "data": {
        id: this.lastID,
        title,
        start_date,
        end_date,
        itinerary_data,
        status
      }
    });
  });
});

// PUT (Update) an existing itinerary
router.put('/itineraries/:id', (req, res) => {
  const { id } = req.params;
  const { title, start_date, end_date, itinerary_data, status } = req.body;
  const data = [title, start_date, end_date, JSON.stringify(itinerary_data), status, id];
  db.run(`UPDATE user_itineraries SET
    title = ?,
    start_date = ?,
    end_date = ?,
    itinerary_data = ?,
    status = ?
    WHERE id = ?`, data, function(err) {
    if (err) {
      res.status(400).json({"error": err.message});
      return;
    }
    res.json({
      "message": "success",
      "changes": this.changes
    });
  });
});

// DELETE an itinerary
router.delete('/itineraries/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM user_itineraries WHERE id = ?`, id, function(err) {
    if (err) {
      res.status(400).json({"error": err.message});
      return;
    }
    res.json({
      "message": "deleted",
      "changes": this.changes
    });
  });
});

module.exports = router;
