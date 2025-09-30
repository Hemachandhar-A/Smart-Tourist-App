import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ExploreDestinationsPage from "./pages/ExploreDestinationsPage";
import PlanJourneyPage from "./pages/PlanJourneyPage";
import TripDetailsPage from "./pages/TripDetailsPage";
import "./assets/styles/global.css";
import AdminApp from "./AdminPages/admin";
import Main from "./HomeComponents/Main";
import SmartMain from "./SmartTravelZones/SmartMain";
import Itenarymain from "./pages/ItenaryMain";
import LoginPage from "./HomeComponents/LoginPage";
function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/main" element={<Main />} />
          <Route path="/smart" element={<SmartMain />}/>
          <Route path="/admin" element={<AdminApp />} />
          <Route path="/home" element={<Itenarymain />} />
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
