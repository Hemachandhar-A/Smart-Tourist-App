import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ExploreDestinationsPage from "./pages/ExploreDestinationsPage";
import PlanJourneyPage from "./pages/PlanJourneyPage";
import TripDetailsPage from "./pages/TripDetailsPage";
import "./assets/styles/global.css";
import AdminApp from "./admin";
import Hems from "./Hems";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Hems />} />
          <Route path="/admin" element={<AdminApp />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/explore" element={<ExploreDestinationsPage />} />
          <Route path="/plan" element={<PlanJourneyPage />} />
          <Route path="/trip/:id" element={<TripDetailsPage />} />
          <Route path="/edit/:id" element={<TripDetailsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;  
