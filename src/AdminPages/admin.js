import React, { useState, useEffect } from 'react';
import { Menu, X, Shield, Globe, User, MapPin, Clock, AlertTriangle, CheckCircle, BarChart3, UserCheck, Activity } from 'lucide-react';

import { TrendingUp } from "lucide-react";
import { Brain } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { Eye } from "lucide-react";
import { Target } from "lucide-react";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { UserX, Navigation, Zap } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import RiskZoneMap from './Riskzone'; // Adjust path as needed
// Fix for default markers in react-leaflet
import L from 'leaflet';
import TouristAnalyticsDashboard from './TouristAnalyticsDashboard';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom icons for different anomaly types
const createCustomIcon = (color) => new L.Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  `)}`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const redIcon = createCustomIcon('#ef4444');
const yellowIcon = createCustomIcon('#eab308');
const orangeIcon = createCustomIcon('#f97316');

// Enhanced hardcoded anomaly datasets (will rotate every 10 seconds)
const anomalyDatasets = [
  [
    {
      id: 1,
      touristId: "TST-2024-001-20251001",
      type: "drop_off",
      message: "Sudden GPS signal loss in crowded area",
      location: { lat: 28.6139, lng: 77.209, name: "Connaught Place, Delhi" },
      timestamp: "2025-10-01 09:10",
      severity: "high",
      priority: "urgent"
    },
    {
      id: 2,
      user: "TST-2024-002-20251001",
      type: "deviation",
      message: "Tourist deviated 3km from planned route",
      location: { lat: 19.076, lng: 72.8777, name: "Mumbai Central" },
      timestamp: "2025-10-01 09:15",
      severity: "medium",
      priority: "moderate",
      plannedRoute: [[19.07, 72.87], [19.09, 72.88], [19.11, 72.89]],
      actualRoute: [[19.07, 72.87], [19.05, 72.85], [19.03, 72.83]]
    },
    {
      id: 3,
      user: "TST-2024-003-20251001",
      type: "inactivity",
      message: "No movement detected for 6+ hours",
      location: { lat: 12.9716, lng: 77.5946, name: "Bangalore MG Road" },
      timestamp: "2025-10-01 09:20",
      severity: "high",
      priority: "urgent"
    },
    {
      id: 4,
      user: "TST-2024-004-20251001",
      type: "distress",
      message: "AI detected distress pattern in movement + communication silence",
      location: { lat: 13.0827, lng: 80.2707, name: "Chennai Marina Beach" },
      timestamp: "2025-10-01 09:25",
      severity: "critical",
      priority: "emergency"
    },
    {
      id: 5,
      user: "TST-2024-005-20251001",
      type: "drop_off",
      message: "Unexpected GPS disconnection in remote area",
      location: { lat: 15.2993, lng: 74.124, name: "Goa Remote Hills" },
      timestamp: "2025-10-01 09:30",
      severity: "high",
      priority: "urgent"
    }
  ],
  [
    {
      id: 6,
      user: "TST-2024-006-20251001",
      type: "deviation",
      message: "Tourist entered restricted zone",
      location: { lat: 26.9124, lng: 75.7873, name: "Jaipur Old City" },
      timestamp: "2025-10-01 09:35",
      severity: "medium",
      priority: "moderate",
      plannedRoute: [[26.91,75.78],[26.92,75.79],[26.93,75.80]],
      actualRoute: [[26.91,75.78],[26.89,75.76],[26.87,75.74]]
    },
    {
      id: 7,
      user: "TST-2024-007-20251001",
      type: "inactivity",
      message: "Tourist stationary at heritage site for long duration",
      location: { lat: 22.5726, lng: 88.3639, name: "Kolkata Victoria Memorial" },
      timestamp: "2025-10-01 09:40",
      severity: "medium",
      priority: "moderate"
    },
    {
      id: 8,
      user: "TST-2024-008-20251001",
      type: "distress",
      message: "Emergency keywords detected in recent communication",
      location: { lat: 25.3176, lng: 82.9739, name: "Varanasi Ghats" },
      timestamp: "2025-10-01 09:45",
      severity: "critical",
      priority: "emergency"
    },
    {
      id: 9,
      user: "TST-2024-009-20251001",
      type: "drop_off",
      message: "All tracking signals lost simultaneously",
      location: { lat: 27.1767, lng: 78.0081, name: "Taj Mahal, Agra" },
      timestamp: "2025-10-01 09:50",
      severity: "high",
      priority: "urgent"
    },
    {
      id: 10,
      user: "TST-2024-010-20251001",
      type: "deviation",
      message: "Tourist off guided trek trail",
      location: { lat: 31.1048, lng: 77.1734, name: "Shimla Hills" },
      timestamp: "2025-10-01 09:55",
      severity: "medium",
      priority: "moderate",
      plannedRoute: [[31.1,77.17],[31.12,77.18]],
      actualRoute: [[31.1,77.17],[31.08,77.15],[31.06,77.13]]
    }
  ],
  [
    {
      id: 11,
      user: "TST-2024-011-20251001",
      type: "inactivity",
      message: "Long inactivity inside wildlife zone",
      location: { lat: 29.3919, lng: 79.4542, name: "Jim Corbett National Park" },
      timestamp: "2025-10-01 10:00",
      severity: "high",
      priority: "urgent"
    },
    {
      id: 12,
      user: "TST-2024-012-20251001",
      type: "distress",
      message: "Panic keywords + unusual route changes detected",
      location: { lat: 32.2432, lng: 77.1892, name: "Manali Mall Road" },
      timestamp: "2025-10-01 10:05",
      severity: "critical",
      priority: "emergency"
    },
    {
      id: 13,
      user: "TST-2024-013-20251001",
      type: "drop_off",
      message: "GPS signal lost in mountain pass",
      location: { lat: 34.1526, lng: 77.5771, name: "Leh Palace Area" },
      timestamp: "2025-10-01 10:10",
      severity: "high",
      priority: "urgent"
    },
    {
      id: 14,
      user: "TST-2024-014-20251001",
      type: "deviation",
      message: "Deviation from riverfront walking route",
      location: { lat: 18.5204, lng: 73.8567, name: "Pune City Center" },
      timestamp: "2025-10-01 10:15",
      severity: "medium",
      priority: "moderate",
      plannedRoute: [[18.52,73.85],[18.53,73.86]],
      actualRoute: [[18.52,73.85],[18.51,73.84],[18.50,73.83]]
    },
    {
      id: 15,
      user: "TST-2024-015-20251001",
      type: "inactivity",
      message: "Stationary at coastal area for 5+ hours",
      location: { lat: 9.9312, lng: 76.2673, name: "Kochi Fort Kochi" },
      timestamp: "2025-10-01 10:20",
      severity: "high",
      priority: "urgent"
    }
  ],
  [
    {
      id: 16,
      user: "TST-2024-016-20251001",
      type: "distress",
      message: "Emergency pattern detected: rapid location jumps + silence",
      location: { lat: 21.1702, lng: 72.8311, name: "Surat City" },
      timestamp: "2025-10-01 10:25",
      severity: "critical",
      priority: "emergency"
    },
    {
      id: 17,
      user: "TST-2024-017-20251001",
      type: "drop_off",
      message: "GPS lost in dense urban area",
      location: { lat: 22.3072, lng: 73.1812, name: "Baroda Vadodara" },
      timestamp: "2025-10-01 10:30",
      severity: "high",
      priority: "urgent"
    },
    {
      id: 18,
      user: "TST-2024-018-20251001",
      type: "deviation",
      message: "Tourist went off heritage walking tour route",
      location: { lat: 26.4499, lng: 80.3319, name: "Lucknow City Center" },
      timestamp: "2025-10-01 10:35",
      severity: "medium",
      priority: "moderate",
      plannedRoute: [[26.44,80.33],[26.45,80.34]],
      actualRoute: [[26.44,80.33],[26.42,80.31]]
    },
    {
      id: 19,
      user: "TST-2024-019-20251001",
      type: "inactivity",
      message: "No movement detected at park zone for several hours",
      location: { lat: 23.2599, lng: 77.4126, name: "Bhopal Upper Lake" },
      timestamp: "2025-10-01 10:40",
      severity: "high",
      priority: "urgent"
    },
    {
      id: 20,
      user: "TST-2024-020-20251001",
      type: "distress",
      message: "Panic behavior detected, AI flagged immediate attention",
      location: { lat: 24.5854, lng: 73.7125, name: "Udaipur City" },
      timestamp: "2025-10-01 10:45",
      severity: "critical",
      priority: "emergency"
    }
  ],
  [
    {
      id: 21,
      user: "TST-2024-021-20251001",
      type: "drop_off",
      message: "Signal lost in remote jungle area",
      location: { lat: 19.2183, lng: 84.8956, name: "Bhubaneswar Surroundings" },
      timestamp: "2025-10-01 10:50",
      severity: "high",
      priority: "urgent"
    },
    {
      id: 22,
      user: "TST-2024-022-20251001",
      type: "deviation",
      message: "Tourist deviated from coastal trek path",
      location: { lat: 8.5241, lng: 76.9366, name: "Thiruvananthapuram Beach" },
      timestamp: "2025-10-01 10:55",
      severity: "medium",
      priority: "moderate",
      plannedRoute: [[8.52,76.93],[8.53,76.94]],
      actualRoute: [[8.52,76.93],[8.50,76.91]]
    },
    {
      id: 23,
      user: "TST-2024-023-20251001",
      type: "inactivity",
      message: "Stationary for over 6 hours in urban district",
      location: { lat: 11.0168, lng: 76.9558, name: "Coimbatore City Center" },
      timestamp: "2025-10-01 11:00",
      severity: "high",
      priority: "urgent"
    },
    {
      id: 24,
      user: "TST-2024-024-20251001",
      type: "distress",
      message: "AI detected emergency patterns in communications",
      location: { lat: 22.7196, lng: 75.8577, name: "Indore City Center" },
      timestamp: "2025-10-01 11:05",
      severity: "critical",
      priority: "emergency"
    },
    {
      id: 25,
      user: "TST-2024-025-20251001",
      type: "drop_off",
      message: "Sudden GPS disconnection near city center",
      location: { lat: 30.7333, lng: 76.7794, name: "Chandigarh City" },
      timestamp: "2025-10-01 11:10",
      severity: "high",
      priority: "urgent"
    }
  ],
  [
    {
      id: 26,
      user: "TST-2024-026-20251001",
      type: "deviation",
      message: "Off route in heritage walking trail",
      location: { lat: 31.6340, lng: 74.8723, name: "Amritsar Golden Temple Area" },
      timestamp: "2025-10-01 11:15",
      severity: "medium",
      priority: "moderate",
      plannedRoute: [[31.63,74.87],[31.64,74.88]],
      actualRoute: [[31.63,74.87],[31.62,74.86]]
    },
    {
      id: 27,
      user: "TST-2024-027-20251001",
      type: "inactivity",
      message: "No movement detected at tourist zone",
      location: { lat: 16.5062, lng: 80.6480, name: "Vijayawada City" },
      timestamp: "2025-10-01 11:20",
      severity: "high",
      priority: "urgent"
    },
    {
      id: 28,
      user: "TST-2024-028-20251001",
      type: "distress",
      message: "Rapid location jumps + silence detected",
      location: { lat: 17.3850, lng: 78.4867, name: "Hyderabad Charminar Area" },
      timestamp: "2025-10-01 11:25",
      severity: "critical",
      priority: "emergency"
    },
    {
      id: 29,
      user: "TST-2024-029-20251001",
      type: "drop_off",
      message: "Signal lost at remote hill area",
      location: { lat: 28.2180, lng: 83.9856, name: "Dehradun Surroundings" },
      timestamp: "2025-10-01 11:30",
      severity: "high",
      priority: "urgent"
    },
    {
      id: 30,
      user: "TST-2024-030-20251001",
      type: "deviation",
      message: "Tourist off river trekking route",
      location: { lat: 27.0238, lng: 74.2179, name: "Pushkar Lake Area" },
      timestamp: "2025-10-01 11:35",
      severity: "medium",
      priority: "moderate",
      plannedRoute: [[27.02,74.21],[27.03,74.22]],
      actualRoute: [[27.02,74.21],[27.01,74.20]]
    }
  ],
  [
    {
      id: 31,
      user: "TST-2024-031-20251001",
      type: "inactivity",
      message: "No movement detected in city heritage area",
      location: { lat: 29.9457, lng: 78.1642, name: "Haridwar Ganges Bank" },
      timestamp: "2025-10-01 11:40",
      severity: "high",
      priority: "urgent"
    },
    {
      id: 32,
      user: "TST-2024-032-20251001",
      type: "distress",
      message: "AI detected distress pattern in last comms",
      location: { lat: 30.3165, lng: 78.0322, name: "Dehradun Rajpur Area" },
      timestamp: "2025-10-01 11:45",
      severity: "critical",
      priority: "emergency"
    },
    {
      id: 33,
      user: "TST-2024-033-20251001",
      type: "drop_off",
      message: "GPS lost near mountain trekking site",
      location: { lat: 32.2432, lng: 77.1892, name: "Manali Solang Valley" },
      timestamp: "2025-10-01 11:50",
      severity: "high",
      priority: "urgent"
    },
    {
      id: 34,
      user: "TST-2024-034-20251001",
      type: "deviation",
      message: "Off guided heritage city tour route",
      location: { lat: 26.8467, lng: 80.9462, name: "Lucknow City Center" },
      timestamp: "2025-10-01 11:55",
      severity: "medium",
      priority: "moderate",
      plannedRoute: [[26.84,80.94],[26.85,80.95]],
      actualRoute: [[26.84,80.94],[26.83,80.92]]
    },
    {
      id: 35,
      user: "TST-2024-035-20251001",
      type: "inactivity",
      message: "Stationary for 5+ hours in lake area",
      location: { lat: 23.2599, lng: 77.4126, name: "Bhopal Upper Lake" },
      timestamp: "2025-10-01 12:00",
      severity: "high",
      priority: "urgent"
    }
  ],
  [
    {
      id: 36,
      user: "TST-2024-036-20251001",
      type: "distress",
      message: "Rapid location jumps detected with silence",
      location: { lat: 24.5854, lng: 73.7125, name: "Udaipur City" },
      timestamp: "2025-10-01 12:05",
      severity: "critical",
      priority: "emergency"
    },
    {
      id: 37,
      user: "TST-2024-037-20251001",
      type: "drop_off",
      message: "Unexpected GPS disconnection near urban park",
      location: { lat: 19.2183, lng: 84.8956, name: "Bhubaneswar Surroundings" },
      timestamp: "2025-10-01 12:10",
      severity: "high",
      priority: "urgent"
    },
    {
      id: 38,
      user: "TST-2024-038-20251001",
      type: "deviation",
      message: "Tourist deviated from coastal walk route",
      location: { lat: 8.5241, lng: 76.9366, name: "Thiruvananthapuram Beach" },
      timestamp: "2025-10-01 12:15",
      severity: "medium",
      priority: "moderate",
      plannedRoute: [[8.52,76.93],[8.53,76.94]],
      actualRoute: [[8.52,76.93],[8.50,76.91]]
    },
    {
      id: 39,
      user: "TST-2024-039-20251001",
      type: "inactivity",
      message: "No movement detected in city area for several hours",
      location: { lat: 11.0168, lng: 76.9558, name: "Coimbatore City Center" },
      timestamp: "2025-10-01 12:20",
      severity: "high",
      priority: "urgent"
    },
    {
      id: 40,
      user: "TST-2024-040-20251001",
      type: "distress",
      message: "AI flagged emergency patterns in communication",
      location: { lat: 22.7196, lng: 75.8577, name: "Indore City Center" },
      timestamp: "2025-10-01 12:25",
      severity: "critical",
      priority: "emergency"
    }
  ],
  [
    {
      id: 41,
      user: "TST-2024-041-20251001",
      type: "drop_off",
      message: "GPS lost in urban downtown",
      location: { lat: 30.7333, lng: 76.7794, name: "Chandigarh City" },
      timestamp: "2025-10-01 12:30",
      severity: "high",
      priority: "urgent"
    },
    {
      id: 42,
      user: "TST-2024-042-20251001",
      type: "deviation",
      message: "Tourist off heritage site route",
      location: { lat: 31.6340, lng: 74.8723, name: "Amritsar Golden Temple" },
      timestamp: "2025-10-01 12:35",
      severity: "medium",
      priority: "moderate",
      plannedRoute: [[31.63,74.87],[31.64,74.88]],
      actualRoute: [[31.63,74.87],[31.62,74.86]]
    },
    {
      id: 43,
      user: "TST-2024-043-20251001",
      type: "inactivity",
      message: "Stationary at city tourist area for long duration",
      location: { lat: 16.5062, lng: 80.6480, name: "Vijayawada City" },
      timestamp: "2025-10-01 12:40",
      severity: "high",
      priority: "urgent"
    },
    {
      id: 44,
      user: "TST-2024-044-20251001",
      type: "distress",
      message: "Rapid jumps detected, possible emergency",
      location: { lat: 17.3850, lng: 78.4867, name: "Hyderabad Charminar" },
      timestamp: "2025-10-01 12:45",
      severity: "critical",
      priority: "emergency"
    },
    {
      id: 45,
      user: "TST-2024-045-20251001",
      type: "drop_off",
      message: "Signal lost at remote hill area",
      location: { lat: 28.2180, lng: 83.9856, name: "Dehradun Surroundings" },
      timestamp: "2025-10-01 12:50",
      severity: "high",
      priority: "urgent"
    }
  ],
  [
    {
      id: 46,
      user: "TST-2024-046-20251001",
      type: "deviation",
      message: "Tourist off river trekking route",
      location: { lat: 27.0238, lng: 74.2179, name: "Pushkar Lake" },
      timestamp: "2025-10-01 12:55",
      severity: "medium",
      priority: "moderate",
      plannedRoute: [[27.02,74.21],[27.03,74.22]],
      actualRoute: [[27.02,74.21],[27.01,74.20]]
    },
    {
      id: 47,
      user: "TST-2024-047-20251001",
      type: "inactivity",
      message: "No movement detected in city heritage area",
      location: { lat: 29.9457, lng: 78.1642, name: "Haridwar Ganges Bank" },
      timestamp: "2025-10-01 13:00",
      severity: "high",
      priority: "urgent"
    },
    {
      id: 48,
      user: "TST-2024-048-20251001",
      type: "distress",
      message: "Emergency flagged in recent communication",
      location: { lat: 30.3165, lng: 78.0322, name: "Dehradun Rajpur Area" },
      timestamp: "2025-10-01 13:05",
      severity: "critical",
      priority: "emergency"
    },
    {
      id: 49,
      user: "TST-2024-049-20251001",
      type: "drop_off",
      message: "GPS lost near mountain trekking site",
      location: { lat: 32.2432, lng: 77.1892, name: "Manali Solang Valley" },
      timestamp: "2025-10-01 13:10",
      severity: "high",
      priority: "urgent"
    },
    {
      id: 50,
      user: "TST-2024-050-20251001",
      type: "deviation",
      message: "Off guided heritage city tour route",
      location: { lat: 26.8467, lng: 80.9462, name: "Lucknow City Center" },
      timestamp: "2025-10-01 13:15",
      severity: "medium",
      priority: "moderate",
      plannedRoute: [[26.84,80.94],[26.85,80.95]],
      actualRoute: [[26.84,80.94],[26.83,80.92]]
    }
  ]
];


const API_BASE_URL = 'https://smart-tourist-app-backend.onrender.com';

const AdminAnomalyDashboard = () => {
  const [currentDatasetIndex, setCurrentDatasetIndex] = useState(0);
  const [anomalies, setAnomalies] = useState(anomalyDatasets[0]);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [resolvedCount, setResolvedCount] = useState(40);
  const [totalProcessed, setTotalProcessed] = useState(54);

  // Rotate datasets every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDatasetIndex(prev => {
        const nextIndex = (prev + 1) % anomalyDatasets.length;
        const newAnomalies = anomalyDatasets[nextIndex];
        setAnomalies(newAnomalies);
        setLastUpdate(new Date());
        
        // Add new timeline events
        for (const anomaly of newAnomalies) {
          const timeStr = new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          setTimelineEvents(prev => [
            {
              id: Date.now() + Math.random(),
              time: timeStr,
              user: anomaly.user,
              type: anomaly.type,
              location: anomaly.location.name,
              message: anomaly.message,
              severity: anomaly.severity
            },
            ...prev.slice(0, 9)
          ]);

          try {
              fetch(`${API_BASE_URL}/api/send_alert/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  tourist_id: anomaly.user,
                  latitude: parseFloat(anomaly.location.lat.toFixed(6)),
                  longitude: parseFloat(anomaly.location.lng.toFixed(6)),
                  alert_type: anomaly.type === 'drop_off' ? "SuddenLocationDropOff" :
                              anomaly.type === 'deviation' ? "RouteDeviation" :
                              anomaly.type === 'inactivity' ? "ExtendedInactivity" :
                              anomaly.type === 'distress' ? "DistressAlert" : "GeneralAlert"
                })
              });
            } catch (err) {
              console.error("Failed to send alert:", err);
            }
        }
        
        setTotalProcessed(prev => prev + Math.floor(Math.random() * 5) + 1);
        
        return nextIndex;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getAnomalyIcon = (type) => {
    switch (type) {
      case 'drop_off': return <MapPin size={20} />;
      case 'deviation': return <Navigation size={20} />;
      case 'inactivity': return <UserX size={20} />;
      case 'distress': return <Zap size={20} />;
      default: return <AlertTriangle size={20} />;
    }
  };

  const getAnomalyColor = (type) => {
    switch (type) {
      case 'drop_off': return '#ef4444';
      case 'deviation': return '#eab308';
      case 'inactivity': return '#f97316';
      case 'distress': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      critical: '#dc2626',
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981'
    };
    return colors[severity] || colors.medium;
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      emergency: '#b91c1c',
      urgent: '#dc2626',
      moderate: '#d97706',
      low: '#059669'
    };
    return colors[priority] || colors.moderate;
  };

  const handleResolveAnomaly = (anomalyId) => {
    const resolvedAnomaly = anomalies.find(a => a.id === anomalyId);
    setAnomalies(prev => prev.filter(a => a.id !== anomalyId));
    setResolvedCount(prev => prev + 1);
    
    const timeStr = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    setTimelineEvents(prev => [
      {
        id: Date.now(),
        time: timeStr,
        user: 'AI System',
        type: 'resolved',
        location: 'Admin Dashboard',
        message: `Anomaly resolved: ${resolvedAnomaly?.user} - ${resolvedAnomaly?.type}`,
        severity: 'resolved'
      },
      ...prev.slice(0, 9)
    ]);
  };

  const openModal = (anomaly) => {
    setSelectedAnomaly(anomaly);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAnomaly(null);
  };

  const getTypeDisplayName = (type) => {
    switch (type) {
      case 'drop_off': return 'Signal Drop-Off';
      case 'deviation': return 'Route Deviation';
      case 'inactivity': return 'Extended Inactivity';
      case 'distress': return 'Distress Pattern';
      default: return type;
    }
  };

  return (
    <div className="anomaly-dashboard">
      {/* Animated Background Grid */}
      <div className="dashboard-bg-grid"></div>
      
      <div className="dashboard-header">
        <div className="header-glow"></div>
        <div className="logo-section">
          <div className="ai-logo">
            <div className="logo-core"></div>
            <div className="logo-ring"></div>
            <div className="logo-ring-2"></div>
          </div>
          <div className="title-group">
            <h1 className="dashboard-title">
              <span className="title-ai">AI-Powered</span>
              <span className="title-main">Tourist Safety Monitoring</span>
            </h1>
            <p className="title-subtitle">Real-Time Anomaly Detection & Response System</p>
          </div>
        </div>
        
        <div className="ai-status-indicator">
          <div className="status-orb">
            <div className="orb-pulse"></div>
            <div className="orb-core"></div>
          </div>
          <div className="status-text">
            <span className="status-label">Neural Network</span>
            <span className="status-value">ACTIVE</span>
          </div>
        </div>

        <div className="status-bar">
          <div className="status-item live-monitor">
            <Activity size={18} />
            <div className="status-content">
              <span className="status-main">Live Monitoring</span>
              <span className="status-sub">Real-time tracking</span>
            </div>
          </div>
          <div className="status-item update-time">
            <Clock size={18} />
            <div className="status-content">
              <span className="status-main">{lastUpdate.toLocaleTimeString()}</span>
              <span className="status-sub">Last update</span>
            </div>
          </div>
          <div className="status-item alert-count">
            <AlertTriangle size={18} />
            <div className="status-content">
              <span className="status-main">{anomalies.length} Active</span>
              <span className="status-sub">Alerts pending</span>
            </div>
          </div>
          <div className="status-item resolved-count">
            <CheckCircle size={18} />
            <div className="status-content">
              <span className="status-main">{resolvedCount} Resolved</span>
              <span className="status-sub">Today</span>
            </div>
          </div>
        </div>
      </div>

      <div className="metrics-dashboard">
        <div className="metric-card primary">
          <div className="metric-icon">
            <Activity />
          </div>
          <div className="metric-content">
            <span className="metric-value">{totalProcessed}</span>
            <span className="metric-label">Total Processed</span>
            <div className="metric-trend positive">
              <TrendingUp size={14} />
              <span>+12%</span>
            </div>
          </div>
          <div className="metric-sparkline">
            <div className="sparkline-bar" style={{height: '40%'}}></div>
            <div className="sparkline-bar" style={{height: '60%'}}></div>
            <div className="sparkline-bar" style={{height: '45%'}}></div>
            <div className="sparkline-bar" style={{height: '80%'}}></div>
            <div className="sparkline-bar" style={{height: '70%'}}></div>
          </div>
        </div>

        <div className="metric-card alert">
          <div className="metric-icon">
            <AlertTriangle />
          </div>
          <div className="metric-content">
            <span className="metric-value">{anomalies.length}</span>
            <span className="metric-label">Active Anomalies</span>
            <div className="metric-status critical">Needs Attention</div>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">
            <CheckCircle />
          </div>
          <div className="metric-content">
            <span className="metric-value">{Math.round((resolvedCount / (resolvedCount + anomalies.length)) * 100)}%</span>
            <span className="metric-label">Resolution Rate</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: `${Math.round((resolvedCount / (resolvedCount + anomalies.length)) * 100)}%`}}></div>
            </div>
          </div>
        </div>

        <div className="metric-card ai">
          <div className="metric-icon">
            <Brain />
          </div>
          <div className="metric-content">
            <span className="metric-value">98.7%</span>
            <span className="metric-label">AI Accuracy</span>
            <div className="metric-badge">Deep Learning</div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="anomalies-section">
          <div className="section-header">
            <div className="section-title-group">
              <h2 className="section-title">
                <AlertCircle size={24} />
                Detected Anomalies
              </h2>
              <span className="section-count">{anomalies.length} Active</span>
            </div>
            <div className="section-filters">
              <button className="filter-btn active">All</button>
              <button className="filter-btn">Critical</button>
              <button className="filter-btn">High</button>
            </div>
          </div>

          <div className="anomalies-grid">
            {anomalies.map(anomaly => (
              <div 
                key={anomaly.id} 
                className={`anomaly-card ${anomaly.type} ${anomaly.severity}`}
                onClick={() => openModal(anomaly)}
              >
                <div className="card-border-glow"></div>
                
                <div className="card-header">
                  <div className="anomaly-icon-wrapper">
                    <div className="icon-pulse"></div>
                    {getAnomalyIcon(anomaly.type)}
                  </div>
                  <div className="badges">
                    <div className="severity-badge" style={{ backgroundColor: getSeverityBadge(anomaly.severity) }}>
                      <span className="badge-dot"></span>
                      {anomaly.severity}
                    </div>
                    <div className="priority-badge" style={{ backgroundColor: getPriorityBadge(anomaly.priority) }}>
                      {anomaly.priority}
                    </div>
                  </div>
                </div>
                
                <div className="card-content">
                  <h3 className="anomaly-title">{getTypeDisplayName(anomaly.type)}</h3>
                  
                  <div className="info-row">
                    <User size={16} />
                    <span>{anomaly.user}</span>
                  </div>
                  
                  <p className="anomaly-message">{anomaly.message}</p>
                  
                  <div className="info-row location">
                    <MapPin size={16} />
                    <span>{anomaly.location.name}</span>
                  </div>
                  
                  <div className="info-row timestamp">
                    <Clock size={16} />
                    <span>{anomaly.timestamp}</span>
                  </div>
                </div>
                
                <div className="card-footer">
                  <button 
                    className="action-btn resolve"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResolveAnomaly(anomaly.id);
                    }}
                  >
                    <CheckCircle size={16} />
                    Resolve
                  </button>
                  <button className="action-btn details">
                    <Eye size={16} />
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="activity-section">
          <div className="activity-header">
            <h2 className="activity-title">
              <Activity size={20} />
              Live Activity Feed
            </h2>
            <div className="ai-processing">
              <div className="processing-indicator">
                <span></span><span></span><span></span>
              </div>
              <span>Processing</span>
            </div>
          </div>

          <div className="timeline-container">
            {timelineEvents.map(event => (
              <div key={event.id} className={`timeline-event ${event.severity}`}>
                <div className="event-indicator"></div>
                <div className="event-content">
                  <div className="event-header">
                    <span className="event-time">{event.time}</span>
                    <span className="event-severity-tag">{event.severity}</span>
                  </div>
                  <div className="event-details">
                    <span className="event-user">{event.user}</span>
                    <span className="event-separator">•</span>
                    <span className="event-type">{event.type.replace('_', ' ')}</span>
                  </div>
                  <div className="event-location">
                    <MapPin size={12} />
                    {event.location}
                  </div>
                  <p className="event-message">{event.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Modal */}
      {showModal && selectedAnomaly && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-section">
                <div className="modal-icon">
                  {getAnomalyIcon(selectedAnomaly.type)}
                </div>
                <div>
                  <h2>{getTypeDisplayName(selectedAnomaly.type)}</h2>
                  <p className="modal-subtitle">Tourist ID: {selectedAnomaly.user}</p>
                </div>
              </div>
              <div className="modal-badges">
                <span className="modal-badge severity" style={{ backgroundColor: getSeverityBadge(selectedAnomaly.severity) }}>
                  {selectedAnomaly.severity}
                </span>
                <span className="modal-badge priority" style={{ backgroundColor: getPriorityBadge(selectedAnomaly.priority) }}>
                  {selectedAnomaly.priority}
                </span>
              </div>
              <button className="modal-close" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="map-section">
                <div className="map-header">
                  <h3>
                    <MapPin size={20} />
                    Location Analysis
                  </h3>
                  {selectedAnomaly.type === 'deviation' && (
                    <div className="map-legend">
                      <span><div className="legend-dot planned"></div>Planned Route</span>
                      <span><div className="legend-dot actual"></div>Actual Route</span>
                    </div>
                  )}
                </div>
                <MapContainer 
                  center={[selectedAnomaly.location.lat, selectedAnomaly.location.lng]} 
                  zoom={13} 
                  style={{ height: '400px', width: '100%', borderRadius: '12px' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  
                  {selectedAnomaly.type === 'deviation' && selectedAnomaly.plannedRoute && (
                    <>
                      <Polyline 
                        positions={selectedAnomaly.plannedRoute} 
                        color="#3b82f6" 
                        weight={4}
                        opacity={0.7}
                        dashArray="10, 10"
                      />
                      <Polyline 
                        positions={selectedAnomaly.actualRoute} 
                        color="#ef4444" 
                        weight={4}
                        opacity={0.9}
                      />
                    </>
                  )}
                  
                  <Marker 
                    position={[selectedAnomaly.location.lat, selectedAnomaly.location.lng]}
                    icon={selectedAnomaly.type === 'distress' ? redIcon : 
                          selectedAnomaly.type === 'deviation' ? yellowIcon :
                          selectedAnomaly.type === 'inactivity' ? orangeIcon : redIcon}
                  >
                    <Popup>
                      <div className="map-popup">
                        <strong>{selectedAnomaly.type.toUpperCase()}</strong>
                        <p>{selectedAnomaly.user}</p>
                        <p>{selectedAnomaly.location.name}</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
              
              <div className="details-section">
                <h3>
                  <Brain size={20} />
                  AI Analysis Report
                </h3>
                
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Tourist ID</label>
                    <span>{selectedAnomaly.user}</span>
                  </div>
                  <div className="detail-item">
                    <label>Anomaly Type</label>
                    <span>{getTypeDisplayName(selectedAnomaly.type)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Severity</label>
                    <span style={{ color: getSeverityBadge(selectedAnomaly.severity) }}>
                      {selectedAnomaly.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Priority</label>
                    <span style={{ color: getPriorityBadge(selectedAnomaly.priority) }}>
                      {selectedAnomaly.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-item full">
                    <label>Location</label>
                    <span>{selectedAnomaly.location.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Coordinates</label>
                    <span>{selectedAnomaly.location.lat.toFixed(6)}, {selectedAnomaly.location.lng.toFixed(6)}</span>
                  </div>
                  <div className="detail-item full">
                    <label>AI Assessment</label>
                    <span>{selectedAnomaly.message}</span>
                  </div>
                  <div className="detail-item">
                    <label>Detection Time</label>
                    <span>{selectedAnomaly.timestamp}</span>
                  </div>
                </div>
                
                <div className="recommendations">
                  <h4>
                    <Target size={18} />
                    Recommended Actions
                  </h4>
                  <ul>
                    {selectedAnomaly.type === 'distress' && (
                      <>
                        <li>🚨 Immediate emergency response required</li>
                        <li>📞 Contact local authorities and emergency services</li>
                        <li>👮 Dispatch nearest safety personnel</li>
                      </>
                    )}
                    {selectedAnomaly.type === 'drop_off' && (
                      <>
                        <li>📡 Attempt communication via backup channels</li>
                        <li>🔍 Check last known location for signals</li>
                        <li>🚁 Coordinate with local search teams if needed</li>
                      </>
                    )}
                    {selectedAnomaly.type === 'deviation' && (
                      <>
                        <li>🧭 Send navigation assistance to tourist</li>
                        <li>✅ Verify route change was intentional</li>
                        <li>🛡️ Provide safe zone recommendations</li>
                      </>
                    )}
                    {selectedAnomaly.type === 'inactivity' && (
                      <>
                        <li>💬 Perform wellness check via communication</li>
                        <li>📍 Send location-based assistance if needed</li>
                        <li>👁️ Monitor for any movement changes</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .anomaly-dashboard {
          position: relative;
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
          overflow-x: hidden;
        }

        .dashboard-bg-grid {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
          z-index: 0;
        }

        .dashboard-header {
          position: relative;
          z-index: 1;
          margin-bottom: 3rem;
        }

        .header-glow {
          position: absolute;
          top: -50%;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
          pointer-events: none;
          animation: glowPulse 4s ease-in-out infinite;
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.8; transform: translateX(-50%) scale(1.1); }
        }

        .logo-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .ai-logo {
          position: relative;
          width: 80px;
          height: 80px;
        }

        .logo-core {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 50%;
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.6);
          animation: coreRotate 3s linear infinite;
        }

        .logo-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 70px;
          height: 70px;
          border: 3px solid rgba(59, 130, 246, 0.3);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: ringRotate 2s linear infinite;
        }

        .logo-ring-2 {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          border: 2px solid rgba(139, 92, 246, 0.2);
          border-bottom-color: #8b5cf6;
          border-radius: 50%;
          animation: ringRotate 3s linear infinite reverse;
        }

        @keyframes coreRotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes ringRotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .title-group {
          text-align: center;
        }

        .dashboard-title {
          font-size: 3rem;
          font-weight: 800;
          margin: 0;
          line-height: 1.2;
        }

        .title-ai {
          display: block;
          font-size: 1.2rem;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 600;
          letter-spacing: 3px;
          margin-bottom: 0.5rem;
        }

        .title-main {
          display: block;
          color: #ffffff;
          text-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
        }

        .title-subtitle {
          color: rgba(255, 255, 255, 0.6);
          font-size: 1rem;
          margin-top: 0.5rem;
          letter-spacing: 1px;
        }

        .ai-status-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .status-orb {
          position: relative;
          width: 50px;
          height: 50px;
        }

        .orb-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          background: rgba(16, 185, 129, 0.3);
          border-radius: 50%;
          animation: orbPulse 2s ease-out infinite;
        }

        .orb-core {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 20px #10b981;
        }

        @keyframes orbPulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }

        .status-text {
          display: flex;
          flex-direction: column;
        }

        .status-label {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .status-value {
          color: #10b981;
          font-weight: 700;
          font-size: 1.2rem;
        }

        .status-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .status-item:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .status-item svg {
          color: rgba(255, 255, 255, 0.8);
        }

        .status-item.live-monitor svg {
          color: #ef4444;
          animation: pulse 2s ease-in-out infinite;
        }

        .status-item.alert-count svg {
          color: #f59e0b;
        }

        .status-item.resolved-count svg {
          color: #10b981;
        }

        .status-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .status-main {
          color: #ffffff;
          font-weight: 600;
          font-size: 1rem;
        }

        .status-sub {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.8rem;
        }

        .metrics-dashboard {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
          position: relative;
          z-index: 1;
        }

        .metric-card {
          position: relative;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .metric-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
        }

        .metric-card.primary::before {
          background: linear-gradient(90deg, #3b82f6, #06b6d4);
        }

        .metric-card.alert::before {
          background: linear-gradient(90deg, #f59e0b, #ef4444);
        }

        .metric-card.success::before {
          background: linear-gradient(90deg, #10b981, #059669);
        }

        .metric-card.ai::before {
          background: linear-gradient(90deg, #8b5cf6, #ec4899);
        }

        .metric-card:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        .metric-icon {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 12px;
          margin-bottom: 1rem;
          color: #3b82f6;
        }

        .metric-card.alert .metric-icon {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .metric-card.success .metric-icon {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .metric-card.ai .metric-icon {
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
        }

        .metric-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .metric-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: #ffffff;
          line-height: 1;
        }

        .metric-label {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .metric-trend {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          margin-top: 0.5rem;
        }

        .metric-trend.positive {
          color: #10b981;
        }

        .metric-status {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          margin-top: 0.5rem;
        }

        .metric-status.critical {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
          margin-top: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #059669);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .metric-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: rgba(139, 92, 246, 0.2);
          color: #8b5cf6;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          margin-top: 0.5rem;
        }

        .metric-sparkline {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          height: 40px;
          margin-top: 1rem;
        }

        .sparkline-bar {
          flex: 1;
          background: linear-gradient(180deg, #3b82f6, rgba(59, 130, 246, 0.3));
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .metric-card:hover .sparkline-bar {
          background: linear-gradient(180deg, #60a5fa, rgba(59, 130, 246, 0.5));
        }

        .dashboard-content {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 2rem;
          position: relative;
          z-index: 1;
        }

        .anomalies-section {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .section-title-group {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #ffffff;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }

        .section-count {
          padding: 0.25rem 0.75rem;
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .section-filters {
          display: flex;
          gap: 0.5rem;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .filter-btn.active {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: #ffffff;
          border-color: transparent;
        }

        .anomalies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .anomaly-card {
          position: relative;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(10px);
          border: 2px solid transparent;
          border-radius: 20px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.4s ease;
          overflow: hidden;
        }

        .card-border-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 20px;
          padding: 2px;
          background: linear-gradient(135deg, transparent, rgba(59, 130, 246, 0.3), transparent);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .anomaly-card:hover .card-border-glow {
          opacity: 1;
        }

        .anomaly-card.distress {
          border-color: rgba(220, 38, 38, 0.5);
          box-shadow: 0 0 30px rgba(220, 38, 38, 0.3);
          animation: cardPulse 2s ease-in-out infinite;
        }

        .anomaly-card.drop_off {
          border-color: rgba(239, 68, 68, 0.5);
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
        }

        .anomaly-card.deviation {
          border-color: rgba(234, 179, 8, 0.5);
          box-shadow: 0 0 20px rgba(234, 179, 8, 0.3);
        }

        .anomaly-card.inactivity {
          border-color: rgba(249, 115, 22, 0.5);
          box-shadow: 0 0 20px rgba(249, 115, 22, 0.3);
        }

        @keyframes cardPulse {
          0%, 100% { box-shadow: 0 0 30px rgba(220, 38, 38, 0.3); }
          50% { box-shadow: 0 0 50px rgba(220, 38, 38, 0.6); }
        }

        .anomaly-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .anomaly-icon-wrapper {
          position: relative;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 12px;
          color: #3b82f6;
        }

        .icon-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          background: rgba(59, 130, 246, 0.3);
          border-radius: 12px;
          animation: iconPulse 2s ease-out infinite;
        }

        @keyframes iconPulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }

        .badges {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          align-items: flex-end;
        }

        .severity-badge,
        .priority-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.9rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #ffffff;
          letter-spacing: 0.5px;
        }

        .badge-dot {
          width: 6px;
          height: 6px;
          background: #ffffff;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        .card-content {
          margin-bottom: 1.5rem;
        }

        .anomaly-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 1rem;
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          margin-bottom: 0.75rem;
        }

        .info-row svg {
          color: rgba(59, 130, 246, 0.8);
          flex-shrink: 0;
        }

        .anomaly-message {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.5;
          margin: 1rem 0;
          font-size: 0.9rem;
        }

        .card-footer {
          display: flex;
          gap: 0.75rem;
        }

        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn.resolve {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #ffffff;
        }

        .action-btn.resolve:hover {
          background: linear-gradient(135deg, #059669, #047857);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
        }

        .action-btn.details {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .action-btn.details:hover {
          background: rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.5);
        }

        .activity-section {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
          height: fit-content;
          position: sticky;
          top: 2rem;
        }

        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .activity-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #ffffff;
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
        }

        .ai-processing {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.85rem;
        }

        .processing-indicator {
          display: flex;
          gap: 4px;
        }

        .processing-indicator span {
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          animation: processing 1.4s ease-in-out infinite;
        }

        .processing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .processing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes processing {
          0%, 60%, 100% { transform: scale(0.6); opacity: 0.4; }
          30% { transform: scale(1); opacity: 1; }
        }

        .timeline-container {
          max-height: 700px;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .timeline-container::-webkit-scrollbar {
          width: 6px;
        }

        .timeline-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }

        .timeline-container::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 3px;
        }

        .timeline-event {
          position: relative;
          padding: 1rem 1rem 1rem 2rem;
          margin-bottom: 1rem;
          background: rgba(15, 23, 42, 0.6);
          border-radius: 12px;
          border-left: 3px solid #3b82f6;
          transition: all 0.3s ease;
        }

        .timeline-event::before {
          content: '';
          position: absolute;
          left: -7px;
          top: 1.25rem;
          width: 10px;
          height: 10px;
          background: #3b82f6;
          border-radius: 50%;
          box-shadow: 0 0 10px #3b82f6;
        }

        .timeline-event.critical {
          border-left-color: #dc2626;
          background: rgba(220, 38, 38, 0.1);
        }

        .timeline-event.critical::before {
          background: #dc2626;
          box-shadow: 0 0 15px #dc2626;
        }

        .timeline-event.high {
          border-left-color: #ef4444;
        }

        .timeline-event.high::before {
          background: #ef4444;
          box-shadow: 0 0 10px #ef4444;
        }

        .timeline-event.resolved {
          border-left-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }

        .timeline-event.resolved::before {
          background: #10b981;
          box-shadow: 0 0 10px #10b981;
        }

        .timeline-event:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateX(5px);
        }

        .event-indicator {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, #3b82f6, transparent);
        }

        .event-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .event-time {
          color: #3b82f6;
          font-weight: 700;
          font-size: 0.85rem;
        }

        .event-severity-tag {
          padding: 0.2rem 0.6rem;
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
          border-radius: 10px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .event-details {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
        }

        .event-user {
          color: #60a5fa;
          font-weight: 600;
        }

        .event-separator {
          color: rgba(255, 255, 255, 0.3);
        }

        .event-type {
          color: #fbbf24;
          text-transform: capitalize;
        }

        .event-location {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.8rem;
        }

        .event-message {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.85rem;
          line-height: 1.4;
          font-style: italic;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          max-width: 1000px;
          width: 95%;
          max-height: 90vh;
          overflow: hidden;
          animation: modalSlideUp 0.4s ease;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        }

        @keyframes modalSlideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modal-title-section {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .modal-icon {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 16px;
          color: #3b82f6;
        }

        .modal-title-section h2 {
          color: #ffffff;
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }

        .modal-subtitle {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
          margin: 0;
        }

        .modal-badges {
          display: flex;
          gap: 0.75rem;
        }

        .modal-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #ffffff;
        }

        .modal-close {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 12px;
          padding: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .modal-close:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .modal-body {
          padding: 2rem;
          max-height: calc(90vh - 120px);
          overflow-y: auto;
        }

        .modal-body::-webkit-scrollbar {
          width: 8px;
        }

        .modal-body::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        .modal-body::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 4px;
        }

        .map-section {
          margin-bottom: 2rem;
        }

        .map-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px 16px 0 0;
          margin-bottom: -4px;
        }

        .map-header h3 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #ffffff;
          font-size: 1.1rem;
          margin: 0;
        }

        .map-legend {
          display: flex;
          gap: 1.5rem;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .map-legend span {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .legend-dot.planned {
          background: #3b82f6;
        }

        .legend-dot.actual {
          background: #ef4444;
        }

        .details-section {
          background: rgba(255, 255, 255, 0.05);
          padding: 2rem;
          border-radius: 16px;
        }

        .details-section h3 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #ffffff;
          font-size: 1.25rem;
          margin: 0 0 1.5rem 0;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .detail-item.full {
          grid-column: 1 / -1;
        }

        .detail-item label {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }

        .detail-item span {
          color: #ffffff;
          font-size: 1rem;
          font-weight: 500;
        }

        .recommendations {
          background: rgba(59, 130, 246, 0.1);
          border-left: 4px solid #3b82f6;
          padding: 1.5rem;
          border-radius: 12px;
        }

        .recommendations h4 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #ffffff;
          font-size: 1.1rem;
          margin: 0 0 1rem 0;
        }

        .recommendations ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .recommendations li {
          color: rgba(255, 255, 255, 0.8);
          padding: 0.5rem 0;
          line-height: 1.5;
          font-size: 0.95rem;
        }

        .map-popup strong {
          color: #1f2937;
          display: block;
          margin-bottom: 0.5rem;
        }

        .map-popup p {
          margin: 0.25rem 0;
          color: #4b5563;
          font-size: 0.9rem;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.9); }
        }

        @media (max-width: 1200px) {
          .dashboard-content {
            grid-template-columns: 1fr;
          }

          .activity-section {
            position: relative;
            top: 0;
          }
        }

        @media (max-width: 768px) {
          .anomaly-dashboard {
            padding: 1rem;
          }

          .dashboard-title {
            font-size: 2rem;
          }

          .status-bar {
            grid-template-columns: repeat(2, 1fr);
          }

          .metrics-dashboard {
            grid-template-columns: repeat(2, 1fr);
          }

          .anomalies-grid {
            grid-template-columns: 1fr;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }

          .modal-content {
            width: 100%;
            margin: 1rem;
          }

          .logo-section {
            flex-direction: column;
            gap: 1rem;
          }

          .ai-logo {
            width: 60px;
            height: 60px;
          }

          .logo-core {
            width: 30px;
            height: 30px;
          }

          .section-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .section-filters {
            width: 100%;
          }

          .filter-btn {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};



const AdminApp = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [alertsData, setAlertsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch alerts from backend
  const fetchAlerts = async () => {
    try {
      const response = await fetch(`https://smart-tourist-app-backend.onrender.com/api/get_alerts/`);
      if (response.ok) {
        const data = await response.json();
        setAlertsData(data);
      } else {
        // fallback mock data
        setAlertsData([
          {
            id: 1,
            touristId: "TST-2024-001",
            latitude: 28.6139,
            longitude: 77.209,
            timestamp: "2024-01-15 14:30:00",
          },
          {
            id: 2,
            touristId: "TST-2024-002",
            latitude: 28.5355,
            longitude: 77.391,
            timestamp: "2024-01-15 13:45:00",
          },
          {
            id: 3,
            touristId: "TST-2024-003",
            latitude: 28.7041,
            longitude: 77.1025,
            timestamp: "2024-01-15 12:20:00",
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
      // fallback mock data
      setAlertsData([
        {
          id: 1,
          touristId: "TST-2024-001",
          latitude: 28.6139,
          longitude: 77.209,
          timestamp: "2024-01-15 14:30:00",
        },
        {
          id: 2,
          touristId: "TST-2024-002",
          latitude: 28.5355,
          longitude: 77.391,
          timestamp: "2024-01-15 13:45:00",
        },
        {
          id: 3,
          touristId: "TST-2024-003",
          latitude: 28.7041,
          longitude: 77.1025,
          timestamp: "2024-01-15 12:20:00",
        },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "ai-anomaly":
        return <AdminAnomalyDashboard />;
      case "alerts":
        return (
          <AdminAnomalies alertsData={alertsData} fetchAlerts={fetchAlerts} />
        );
      case "users":
        return <UserManagement />;
      case "analytics":
        return <TouristAnalyticsDashboard />;
      case "risk-zones":
        return <RiskZoneMap />;
      default:
        return <AdminDashboard alertsData={alertsData} loading={loading} />;
    }
  };

  return (
    <div className="admin-app">
      <AdminNavbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className="main-content">{renderPage()}</main>

      <AdminFooter />

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .admin-app {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          color: white;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
          background: linear-gradient(135deg, #0f172a, #1e293b, #334155);
          overflow-x: hidden;
        }

        .main-content {
          flex: 1; /* ensures footer is pushed to bottom */
          padding-top: 80px; /* offset for navbar */
          padding-left: 1rem;
          padding-right: 1rem;
        }

        @media (max-width: 768px) {
          .main-content {
            padding-top: 70px;
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
        }

        @keyframes fadeInUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

function AdminAnomalies({ alertsData, fetchAlerts }) {
  return <AdminAnomalyDashboard />;
}


// Admin Navbar Component
const AdminNavbar = ({ currentPage, setCurrentPage, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={20} /> },
    { id: 'alerts', label: 'Alert Management', icon: <AlertTriangle size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <Activity size={20} /> },
    { id: 'risk-zones', label: 'Risk Zones', icon: <Globe size={20} /> }
  ];

  return (
    <nav className="admin-navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <Shield className="brand-icon" />
          <span className="nav-brand-span">B.R.A.V.O ADMIN</span>
        </div>
        
        <div className="nav-menu">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
      
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`mobile-nav-link ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => {
                setCurrentPage(item.id);
                setIsMobileMenuOpen(false);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
      
      <style jsx>{`
      .anomaly-card-simple {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border-left: 4px solid #ef4444;
  margin-bottom: 1rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.anomaly-content {
  padding: 1rem;
}
        .admin-navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(10, 35, 66, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
        }
        
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: #FF4B2B;
        }
        
        .nav-brand-span {
          color: #ffffff;
        }
        
        .brand-icon {
          width: 32px;
          height: 32px;
        }
        
        .nav-menu {
          display: flex;
          gap: 1rem;
        }
        
        .nav-link {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
          cursor: pointer;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }
        
        .nav-link:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          transform: translateY(-2px);
        }
        
        .nav-link.active {
          background: linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%);
          color: white;
        }
        
        .mobile-menu-toggle {
          display: none;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0.5rem;
        }
        
        .mobile-menu {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(10, 35, 66, 0.98);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.8);
          font-size: 1rem;
          cursor: pointer;
          padding: 1rem 2rem;
          text-align: left;
          transition: all 0.3s ease;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .mobile-nav-link:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        
        .mobile-nav-link.active {
          background: linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%);
          color: white;
        }
        
        @media (max-width: 768px) {
          .nav-menu {
            display: none;
          }
          
          .mobile-menu-toggle {
            display: block;
          }
          
          .mobile-menu {
            display: block;
            animation: slideInFromRight 0.3s ease;
          }
        }
      `}</style>
    </nav>
  );
};


const AdminDashboard = ({ alertsData, loading }) => {
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">
            Monitor and manage tourist safety alerts
          </p>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stat-card">
            <h3>Total Alerts</h3>
            <span className="stat-number">{alertsData.length}</span>
          </div>
          <div className="stat-card">
            <h3>Active Cases</h3>
            <span className="stat-number">
              {alertsData.length > 0 ? Math.min(alertsData.length, 3) : 0}
            </span>
          </div>
          <div className="stat-card">
            <h3>Resolved</h3>
            <span className="stat-number">
              {Math.max(0, alertsData.length - 3)}
            </span>
          </div>
        </div>

        {/* Alerts Section */}
        <div className="alerts-section">
          <h2 className="section-title">Recent Alerts</h2>
          <div className="alerts-table">
            <div className="table-header">
              <span>Tourist ID</span>
              <span>Location</span>
              <span>Alert Type</span>
              <span>Timestamp</span>
              <span>Status</span>
            </div>

            {alertsData.length > 0 ? (
              alertsData.map((alert) => (
                <div key={alert.id} className="table-row">
                  <span className="tourist-id">
                    {alert.touristId || alert.tourist_id}
                  </span>
                  <span className="location">
                    <MapPin className="location-icon" />
                    {typeof alert.latitude === "number"
                      ? alert.latitude.toFixed(4)
                      : alert.latitude}
                    ,{" "}
                    {typeof alert.longitude === "number"
                      ? alert.longitude.toFixed(4)
                      : alert.longitude}
                  </span>
                  <span className="alert-type">
                    {alert.alertType || alert.alert_type}
                  </span>
                  <span className="timestamp">
                    <Clock className="time-icon" />
                    {alert.timestamp}
                  </span>
                  <span className="status active">Active</span>
                </div>
              ))
            ) : (
              <div className="no-alerts">
                <p>No alerts found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ FULL UPDATED CSS */}
      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .admin-dashboard {
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(135deg, #0f172a, #1e293b, #334155);
        }

        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 50vh;
          color: white;
          gap: 1rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 65, 108, 0.3);
          border-top: 3px solid #ff416c;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Header */
        .admin-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .admin-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: white;
          margin: 0;
          position: relative;
        }
        .admin-title::after {
          content: "";
          display: block;
          width: 80px;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          margin: 0.75rem auto 0;
          border-radius: 2px;
        }
        .admin-subtitle {
          color: rgba(255, 255, 255, 0.6);
          font-size: 1.1rem;
          margin-top: 0.5rem;
        }

        /* Stats */
        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          color: white;
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.08);
        }
        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          display: block;
          margin-top: 0.25rem;
          color: #60a5fa;
        }

        /* Alerts */
        .alerts-section {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
        }
        .section-title {
          color: white;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.25rem;
        }

        /* ✅ Flexible Grid Columns */
        .table-header,
        .table-row {
          display: grid;
          grid-template-columns: minmax(100px, 1fr) minmax(150px, 2fr) 1fr minmax(
              140px,
              2fr
            ) minmax(80px, 1fr);
          gap: 1rem;
          padding: 1rem 1.25rem;
          border-radius: 10px;
          align-items: center;
        }

        .table-header {
          background: rgba(255, 255, 255, 0.08);
          font-weight: 700;
          color: rgba(255, 255, 255, 0.9);
          text-transform: uppercase;
          font-size: 0.8rem;
          margin-bottom: 0.75rem;
        }

        .table-row {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 0.75rem;
          color: white;
        }
        .table-row:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .location,
        .timestamp {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .status {
          color: #10b981;
          font-weight: 700;
        }

        .no-alerts {
          text-align: center;
          padding: 2rem;
          color: rgba(255, 255, 255, 0.6);
        }

        /* ✅ Responsive Stacked Cards */
        @media (max-width: 900px) {
          .table-header {
            display: none;
          }
          .table-row {
            grid-template-columns: 1fr;
            padding: 1rem;
            gap: 0.6rem;
          }
          .table-row span {
            display: flex;
            justify-content: space-between;
            font-size: 0.9rem;
            border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
            padding-bottom: 0.3rem;
          }
          .table-row span:last-child {
            border-bottom: none;
          }
          .table-row span::before {
            content: attr(class);
            font-weight: 600;
            text-transform: capitalize;
            color: rgba(255, 255, 255, 0.6);
            margin-right: 0.5rem;
          }
        }

        @media (max-width: 600px) {
          .admin-title {
            font-size: 2rem;
          }
          .stat-number {
            font-size: 1.5rem;
          }
          .section-title {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};




  

// Placeholder components for other admin sections
const AlertsManagement = ({ alertsData, fetchAlerts }) => (
  <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>
    <h2>Alert Management System</h2>
    <p>Comprehensive alert monitoring and response center</p>
    <button 
      onClick={fetchAlerts}
      style={{
        marginTop: '1rem',
        padding: '0.75rem 1.5rem',
        background: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)',
        border: 'none',
        borderRadius: '8px',
        color: 'white',
        cursor: 'pointer'
      }}
    >
      Refresh Alerts
    </button>
  </div>
);

const UserManagement = () => (
  <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>
    <h2>User Management</h2>
    <p>Tourist profile and verification management coming soon...</p>
  </div>
);

const Analytics = () => (
  <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>
    <h2>Analytics & Reports</h2>
    <p>Detailed analytics and reporting dashboard coming soon...</p>
  </div>
);

const SystemSettings = () => (
  <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>
    <h2>System Settings</h2>
    <p>System configuration and preferences coming soon...</p>
  </div>
);

// Admin Footer Component
const AdminFooter = () => {
  return (
    <footer className="admin-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Shield className="footer-icon" />
          <span>TouristGuard Admin Portal</span>
        </div>
        <p className="footer-text">
          © 2024 TouristGuard Administration. Secure tourism management platform.
        </p>
      </div>
      
      <style jsx>{`
        .admin-footer {
          background: rgba(0, 0, 0, 0.2);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 2rem;
          margin-top: 3rem;
        }
        
        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }
        
        .footer-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 1.25rem;
          font-weight: 700;
          color: #FF416C;
          margin-bottom: 1rem;
        }
        
        .footer-icon {
          width: 24px;
          height: 24px;
        }
        
        .footer-text {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
        }
      `}</style>
    </footer>
  );
};

export default AdminApp;