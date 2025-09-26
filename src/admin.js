import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, X, Shield, MessageCircle, Users, Globe, Calendar, User, MapPin, Clock, AlertTriangle, Phone, Edit, QrCode, Send, TrendingUp, CheckCircle, Settings, Database, BarChart3, UserCheck, Activity, Bell } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { UserX, Navigation, Zap } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import RiskZoneMap from './Riskzone'; // Adjust path as needed
// Fix for default markers in react-leaflet
import L from 'leaflet';


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
      user: "John Doe",
      type: "drop_off",
      message: "Sudden GPS signal loss detected - Tourist disappeared from tracking in crowded market area",
      location: { lat: 28.6139, lng: 77.2090, name: "Connaught Place, Delhi" },
      timestamp: "2025-09-24 10:05",
      severity: "high",
      priority: "urgent"
    },
    {
      id: 2,
      user: "Alice Chen",
      type: "deviation",
      message: "Major route deviation detected - Tourist 5km off planned itinerary in unfamiliar area",
      location: { lat: 19.076, lng: 72.8777, name: "Mumbai Central" },
      timestamp: "2025-09-24 10:10",
      severity: "medium",
      priority: "moderate",
      plannedRoute: [
        [19.07, 72.87],
        [19.09, 72.88],
        [19.11, 72.89],
        [19.13, 72.90]
      ],
      actualRoute: [
        [19.07, 72.87],
        [19.05, 72.85],
        [19.03, 72.83],
        [19.01, 72.81]
      ]
    },
    {
      id: 3,
      user: "Ravi Kumar",
      type: "inactivity",
      message: "Extended stationary period - No movement detected for 6+ hours, possible emergency",
      location: { lat: 12.9716, lng: 77.5946, name: "Bangalore City Center" },
      timestamp: "2025-09-24 10:15",
      severity: "high",
      priority: "urgent"
    }
  ],
  [
    {
      id: 4,
      user: "Mei Ling",
      type: "distress",
      message: "AI detected distress patterns - Irregular movement + communication silence",
      location: { lat: 13.0827, lng: 80.2707, name: "Chennai Marina Beach" },
      timestamp: "2025-09-24 10:20",
      severity: "critical",
      priority: "emergency"
    },
    {
      id: 5,
      user: "Sarah Johnson",
      type: "drop_off",
      message: "Unexpected GPS disconnection in remote mountain area - Search required",
      location: { lat: 15.2993, lng: 74.1240, name: "Goa Remote Hills" },
      timestamp: "2025-09-24 10:25",
      severity: "high",
      priority: "urgent"
    },
    {
      id: 6,
      user: "Carlos Rodriguez",
      type: "deviation",
      message: "Tourist entered restricted zone - Left designated safe tourist areas",
      location: { lat: 26.9124, lng: 75.7873, name: "Jaipur Old City" },
      timestamp: "2025-09-24 10:30",
      severity: "medium",
      priority: "moderate",
      plannedRoute: [
        [26.91, 75.78],
        [26.92, 75.79],
        [26.93, 75.80]
      ],
      actualRoute: [
        [26.91, 75.78],
        [26.89, 75.76],
        [26.87, 75.74]
      ]
    }
  ],
  [
    {
      id: 7,
      user: "Emma Watson",
      type: "inactivity",
      message: "Wellness check required - Tourist stationary in heritage site for unusual duration",
      location: { lat: 22.5726, lng: 88.3639, name: "Kolkata Heritage Area" },
      timestamp: "2025-09-24 10:35",
      severity: "medium",
      priority: "moderate"
    },
    {
      id: 8,
      user: "Ahmed Hassan",
      type: "distress",
      message: "Emergency keywords detected in last communication + rapid location changes",
      location: { lat: 25.3176, lng: 82.9739, name: "Varanasi Ghats" },
      timestamp: "2025-09-24 10:40",
      severity: "critical",
      priority: "emergency"
    },
    {
      id: 9,
      user: "Lisa Park",
      type: "drop_off",
      message: "Communication blackout - All tracking signals lost simultaneously",
      location: { lat: 27.1767, lng: 78.0081, name: "Agra Taj Mahal Area" },
      timestamp: "2025-09-24 10:45",
      severity: "high",
      priority: "urgent"
    }
  ]
];

const AdminAnomalyDashboard = () => {
  const [currentDatasetIndex, setCurrentDatasetIndex] = useState(0);
  const [anomalies, setAnomalies] = useState(anomalyDatasets[0]);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [resolvedCount, setResolvedCount] = useState(0);
  const [totalProcessed, setTotalProcessed] = useState(847);

  // Rotate datasets every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDatasetIndex(prev => {
        const nextIndex = (prev + 1) % anomalyDatasets.length;
        const newAnomalies = anomalyDatasets[nextIndex];
        setAnomalies(newAnomalies);
        setLastUpdate(new Date());
        
        // Add new timeline events
        newAnomalies.forEach(anomaly => {
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
            ...prev.slice(0, 9) // Keep only last 10 events
          ]);
        });
        
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
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          🚨 AI-Based Anomaly Detection System
        </h1>
        <div className="ai-status-indicator">
          <div className="ai-pulse"></div>
          <span>Neural Network Active</span>
        </div>
        <div className="status-bar">
          <div className="status-item critical">
            <Activity size={16} />
            <span>Live Monitoring</span>
          </div>
          <div className="status-item">
            <Clock size={16} />
            <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
          <div className="status-item alert">
            <AlertTriangle size={16} />
            <span>{anomalies.length} Active Alerts</span>
          </div>
          <div className="status-item success">
            <CheckCircle size={16} />
            <span>{resolvedCount} Resolved Today</span>
          </div>
        </div>
      </div>

      <div className="metrics-bar">
        <div className="metric-card">
          <span className="metric-value">{totalProcessed}</span>
          <span className="metric-label">Total Processed</span>
        </div>
        <div className="metric-card">
          <span className="metric-value">{anomalies.length}</span>
          <span className="metric-label">Active Anomalies</span>
        </div>
        <div className="metric-card">
          <span className="metric-value">{Math.round((resolvedCount / (resolvedCount + anomalies.length)) * 100)}%</span>
          <span className="metric-label">Resolution Rate</span>
        </div>
        <div className="metric-card">
          <span className="metric-value">96.7%</span>
          <span className="metric-label">AI Accuracy</span>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="anomalies-section">
          <h2 className="section-title">🎯 Detected Anomalies</h2>
          <div className="anomalies-grid">
            {anomalies.map(anomaly => (
              <div 
                key={anomaly.id} 
                className={`anomaly-card ${anomaly.type} ${anomaly.severity}`}
                onClick={() => openModal(anomaly)}
              >
                <div className="card-header">
                  <div className="anomaly-icon">
                    {getAnomalyIcon(anomaly.type)}
                  </div>
                  <div className="badges">
                    <div className="severity-badge" style={{ backgroundColor: getSeverityBadge(anomaly.severity) }}>
                      {anomaly.severity.toUpperCase()}
                    </div>
                    <div className="priority-badge" style={{ backgroundColor: getPriorityBadge(anomaly.priority) }}>
                      {anomaly.priority.toUpperCase()}
                    </div>
                  </div>
                </div>
                
                <div className="card-content">
                  <h3 className="anomaly-title">
                    {getTypeDisplayName(anomaly.type)}
                  </h3>
                  <div className="user-info">
                    <User size={16} />
                    <span>{anomaly.user}</span>
                  </div>
                  <p className="anomaly-message">{anomaly.message}</p>
                  <div className="location-info">
                    <MapPin size={16} />
                    <span>{anomaly.location.name}</span>
                  </div>
                  <div className="timestamp">
                    <Clock size={16} />
                    <span>{anomaly.timestamp}</span>
                  </div>
                </div>
                
                <div className="card-actions">
                  <button 
                    className="resolve-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResolveAnomaly(anomaly.id);
                    }}
                  >
                    <CheckCircle size={16} />
                    Resolve
                  </button>
                  <button className="view-map-btn">
                    <Navigation size={16} />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="timeline-section">
          <h2 className="timeline-title">📡 AI Activity Feed</h2>
          <div className="ai-indicator">
            <div className="processing-dots">
              <span></span><span></span><span></span>
            </div>
            <span>Neural network processing...</span>
          </div>
          <div className="timeline-container">
            {timelineEvents.map(event => (
              <div key={event.id} className={`timeline-event ${event.severity}`}>
                <span className="event-time">[{event.time}]</span>
                <span className="event-severity">{event.severity?.toUpperCase()}</span>
                <span className="event-user">{event.user}</span>
                <span className="event-type">- {event.type.replace('_', ' ')}</span>
                <div className="event-location">📍 {event.location}</div>
                <div className="event-message">{event.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Modal with Map */}
      {showModal && selectedAnomaly && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-section">
                <h2>{getTypeDisplayName(selectedAnomaly.type)} - {selectedAnomaly.user}</h2>
                <div className="modal-badges">
                  <span className="modal-severity" style={{ backgroundColor: getSeverityBadge(selectedAnomaly.severity) }}>
                    {selectedAnomaly.severity}
                  </span>
                  <span className="modal-priority" style={{ backgroundColor: getPriorityBadge(selectedAnomaly.priority) }}>
                    {selectedAnomaly.priority}
                  </span>
                </div>
              </div>
              <button className="close-btn" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="map-container">
                <div className="map-header">
                  <h3>📍 Location Analysis</h3>
                  <div className="map-legend">
                    {selectedAnomaly.type === 'deviation' && (
                      <>
                        <span><div className="legend-line blue"></div> Planned Route</span>
                        <span><div className="legend-line red"></div> Actual Route</span>
                      </>
                    )}
                  </div>
                </div>
                <MapContainer 
                  center={[selectedAnomaly.location.lat, selectedAnomaly.location.lng]} 
                  zoom={13} 
                  style={{ height: '400px', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {selectedAnomaly.type === 'deviation' && selectedAnomaly.plannedRoute && (
                    <>
                      <Polyline 
                        positions={selectedAnomaly.plannedRoute} 
                        color="#3b82f6" 
                        weight={4}
                        opacity={0.8}
                        dashArray="10, 5"
                      />
                      <Polyline 
                        positions={selectedAnomaly.actualRoute} 
                        color="#ef4444" 
                        weight={4}
                        opacity={0.8}
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
                      <div className="popup-content">
                        <strong>🚨 {selectedAnomaly.type.toUpperCase()} DETECTED</strong><br/>
                        <strong>Tourist:</strong> {selectedAnomaly.user}<br/>
                        <strong>Time:</strong> {selectedAnomaly.timestamp}<br/>
                        <strong>Location:</strong> {selectedAnomaly.location.name}<br/>
                        <strong>Severity:</strong> {selectedAnomaly.severity.toUpperCase()}<br/>
                        <strong>Details:</strong> {selectedAnomaly.message}
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
              
              <div className="anomaly-details">
                <h3>🔍 AI Analysis Report</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Tourist ID:</strong>
                    <span>{selectedAnomaly.user}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Anomaly Type:</strong>
                    <span>{getTypeDisplayName(selectedAnomaly.type)}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Severity Level:</strong>
                    <span style={{ color: getSeverityBadge(selectedAnomaly.severity) }}>
                      {selectedAnomaly.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Priority:</strong>
                    <span style={{ color: getPriorityBadge(selectedAnomaly.priority) }}>
                      {selectedAnomaly.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Location:</strong>
                    <span>{selectedAnomaly.location.name}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Coordinates:</strong>
                    <span>{selectedAnomaly.location.lat.toFixed(6)}, {selectedAnomaly.location.lng.toFixed(6)}</span>
                  </div>
                  <div className="detail-item full-width">
                    <strong>AI Assessment:</strong>
                    <span>{selectedAnomaly.message}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Detection Time:</strong>
                    <span>{selectedAnomaly.timestamp}</span>
                  </div>
                </div>
                
                <div className="action-recommendations">
                  <h4>🎯 Recommended Actions:</h4>
                  <ul>
                    {selectedAnomaly.type === 'distress' && (
                      <>
                        <li>• Immediate emergency response required</li>
                        <li>• Contact local authorities and emergency services</li>
                        <li>• Dispatch nearest safety personnel</li>
                      </>
                    )}
                    {selectedAnomaly.type === 'drop_off' && (
                      <>
                        <li>• Attempt communication via backup channels</li>
                        <li>• Check last known location for signals</li>
                        <li>• Coordinate with local search teams if needed</li>
                      </>
                    )}
                    {selectedAnomaly.type === 'deviation' && (
                      <>
                        <li>• Send navigation assistance to tourist</li>
                        <li>• Verify route change was intentional</li>
                        <li>• Provide safe zone recommendations</li>
                      </>
                    )}
                    {selectedAnomaly.type === 'inactivity' && (
                      <>
                        <li>• Perform wellness check via communication</li>
                        <li>• Send location-based assistance if needed</li>
                        <li>• Monitor for any movement changes</li>
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
        .anomaly-dashboard {
          padding: 2rem;
          min-height: calc(100vh - 80px);
          background: rgba(0, 0, 0, 0.1);
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 2rem;
          animation: fadeInUp 0.8s ease;
        }

        .dashboard-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .ai-status-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          color: #10b981;
          font-weight: 600;
        }

        .ai-pulse {
          width: 12px;
          height: 12px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .status-bar {
          display: flex;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.9);
          background: rgba(255, 255, 255, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .status-item.critical {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .status-item.alert {
          border-color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
        }

        .status-item.success {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }

        .metrics-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .metric-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .metric-value {
          display: block;
          font-size: 2rem;
          font-weight: 700;
          color: #ff416c;
          margin-bottom: 0.5rem;
        }

        .metric-label {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
        }

        .dashboard-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }

        .anomalies-section {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 2rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .section-title {
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .anomalies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .anomaly-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          border: 2px solid transparent;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .anomaly-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.05), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }

        .anomaly-card:hover::before {
          transform: translateX(100%);
        }

        .anomaly-card.drop_off {
          border-color: #ef4444;
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
        }

        .anomaly-card.deviation {
          border-color: #eab308;
          box-shadow: 0 0 20px rgba(234, 179, 8, 0.3);
        }

        .anomaly-card.inactivity {
          border-color: #f97316;
          box-shadow: 0 0 20px rgba(249, 115, 22, 0.3);
        }

        .anomaly-card.distress {
          border-color: #dc2626;
          box-shadow: 0 0 30px rgba(220, 38, 38, 0.5);
          animation: distressPulse 2s infinite;
        }

        @keyframes distressPulse {
          0%, 100% { box-shadow: 0 0 30px rgba(220, 38, 38, 0.5); }
          50% { box-shadow: 0 0 40px rgba(220, 38, 38, 0.8); }
        }

        .anomaly-card.critical {
          animation: criticalFlash 3s infinite;
        }

        @keyframes criticalFlash {
          0%, 90%, 100% { border-color: #dc2626; }
          95% { border-color: #ffffff; }
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .anomaly-icon {
          color: #ff416c;
          background: rgba(255, 65, 108, 0.2);
          padding: 0.75rem;
          border-radius: 12px;
        }

        .badges {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          align-items: flex-end;
        }

        .severity-badge, .priority-badge {
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .card-content {
          color: white;
          margin-bottom: 1.5rem;
        }

        .anomaly-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          color: #ff416c;
        }

        .user-info, .location-info, .timestamp {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .anomaly-message {
          margin: 0.75rem 0;
          line-height: 1.4;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
        }

        .card-actions {
          display: flex;
          gap: 1rem;
        }

        .resolve-btn, .view-map-btn {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .resolve-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .resolve-btn:hover {
          background: linear-gradient(135deg, #059669, #047857);
          transform: translateY(-2px);
        }

        .view-map-btn {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .view-map-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .timeline-section {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          height: fit-content;
        }

        .timeline-title {
          color: white;
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .ai-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
        }

        .processing-dots {
          display: flex;
          gap: 0.25rem;
        }

        .processing-dots span {
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          animation: processingPulse 1.5s infinite;
        }

        .processing-dots span:nth-child(2) {
          animation-delay: 0.3s;
        }

        .processing-dots span:nth-child(3) {
          animation-delay: 0.6s;
        }

        @keyframes processingPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        .timeline-container {
          max-height: 600px;
          overflow-y: auto;
        }

        .timeline-event {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.85rem;
          line-height: 1.6;
          margin-bottom: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border-left: 3px solid #ff416c;
          transition: all 0.3s ease;
        }

        .timeline-event:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateX(5px);
        }

        .timeline-event.critical {
          border-left-color: #dc2626;
          background: rgba(220, 38, 38, 0.1);
        }

        .timeline-event.high {
          border-left-color: #ef4444;
        }

        .timeline-event.resolved {
          border-left-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }

        .event-time {
          color: #ff416c;
          font-weight: 600;
        }

        .event-severity {
          color: #f59e0b;
          font-weight: 700;
          font-size: 0.75rem;
        }

        .event-user {
          color: #60a5fa;
          font-weight: 600;
        }

        .event-type {
          color: #fbbf24;
        }

        .event-location {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.8rem;
          margin-top: 0.25rem;
        }

        .event-message {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.8rem;
          margin-top: 0.5rem;
          font-style: italic;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          backdrop-filter: blur(5px);
        }

        .modal-content {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          max-width: 900px;
          width: 90%;
          max-height: 90vh;
          overflow: hidden;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1.5rem;
          background: rgba(255, 65, 108, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .modal-title-section h2 {
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .modal-badges {
          display: flex;
          gap: 0.5rem;
        }

        .modal-severity, .modal-priority {
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .close-btn {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .modal-body {
          padding: 1.5rem;
          max-height: calc(90vh - 120px);
          overflow-y: auto;
        }

        .map-container {
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 1.5rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .map-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(255, 65, 108, 0.1);
          color: #1f2937;
        }

        .map-legend {
          display: flex;
          gap: 1rem;
          font-size: 0.85rem;
        }

        .legend-line {
          width: 20px;
          height: 3px;
          border-radius: 2px;
        }

        .legend-line.blue {
          background: #3b82f6;
        }

        .legend-line.red {
          background: #ef4444;
        }

        .anomaly-details {
          background: rgba(255, 255, 255, 0.5);
          padding: 1.5rem;
          border-radius: 12px;
          color: #1f2937;
        }

        .anomaly-details h3 {
          margin-bottom: 1rem;
          color: #1f2937;
          font-size: 1.25rem;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-item.full-width {
          grid-column: 1 / -1;
        }

        .detail-item strong {
          color: #374151;
          font-size: 0.9rem;
        }

        .detail-item span {
          color: #1f2937;
          font-weight: 500;
        }

        .action-recommendations {
          background: rgba(59, 130, 246, 0.1);
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
        }

        .action-recommendations h4 {
          margin-bottom: 0.75rem;
          color: #1f2937;
        }

        .action-recommendations ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .action-recommendations li {
          color: #374151;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }

        .popup-content {
          color: #1f2937;
          line-height: 1.4;
        }

        @keyframes fadeInUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @media (max-width: 768px) {
          .dashboard-content {
            grid-template-columns: 1fr;
          }
          
          .anomalies-grid {
            grid-template-columns: 1fr;
          }
          
          .status-bar {
            gap: 1rem;
          }
          
          .modal-content {
            margin: 1rem;
            width: calc(100% - 2rem);
          }

          .metrics-bar {
            grid-template-columns: repeat(2, 1fr);
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};


const AdminApp = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [alertsData, setAlertsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch alerts from backend
  const fetchAlerts = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/get_alerts/`);
      if (response.ok) {
        const data = await response.json();
        setAlertsData(data);
      } else {
        // Fallback mock data if API fails
        setAlertsData([
          { id: 1, touristId: 'TST-2024-001', latitude: 28.6139, longitude: 77.2090, timestamp: '2024-01-15 14:30:00' },
          { id: 2, touristId: 'TST-2024-002', latitude: 28.5355, longitude: 77.3910, timestamp: '2024-01-15 13:45:00' },
          { id: 3, touristId: 'TST-2024-003', latitude: 28.7041, longitude: 77.1025, timestamp: '2024-01-15 12:20:00' }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      // Fallback mock data
      setAlertsData([
        { id: 1, touristId: 'TST-2024-001', latitude: 28.6139, longitude: 77.2090, timestamp: '2024-01-15 14:30:00' },
        { id: 2, touristId: 'TST-2024-002', latitude: 28.5355, longitude: 77.3910, timestamp: '2024-01-15 13:45:00' },
        { id: 3, touristId: 'TST-2024-003', latitude: 28.7041, longitude: 77.1025, timestamp: '2024-01-15 12:20:00' }
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
      case 'ai-anomaly':
        return <AdminAnomalyDashboard />;
      case 'alerts':
        return <AdminAnomalies alertsData={alertsData} fetchAlerts={fetchAlerts} />;
      case 'users':
        return <UserManagement />;
      case 'analytics':
        return <Analytics />;
      case 'risk-zones':
        return <RiskZoneMap />;
      default:
        return <AdminDashboard alertsData={alertsData} loading={loading} />;
    }
  };

  return (
    <div className="admin-app">
      <div className="background-carousel">
        <div className="background-slides">
          <div className="background-slide slide-1"></div>
          <div className="background-slide slide-2"></div>
          <div className="background-slide slide-3"></div>
          <div className="background-slide slide-4"></div>
          <div className="background-slide slide-5"></div>
        </div>
      </div>
      
      <AdminNavbar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      
      <main className="main-content">
        {renderPage()}
      </main>
      
      <AdminFooter />
      
      <style jsx>{`
        .admin-app {
          min-height: 100vh;
          position: relative;
          color: white;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          overflow-x: hidden;
          background: rgba(0, 0, 0, 0.4);
        }
        
        .background-carousel {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          overflow: hidden;
        }
        
        .background-slides {
          display: flex;
          width: 500%;
          height: 100%;
          animation: slideCarousel 25s infinite step-end;
        }
        
        .background-slide {
          width: 20%;
          height: 100%;
          background-size: cover;
          background-position: center;
          position: relative;
        }
        
        .background-slide::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
        }
        
        .slide-1 { background-image: url('https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'); }
        .slide-2 { background-image: url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2015&q=80'); }
        .slide-3 { background-image: url('https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2076&q=80'); }
        .slide-4 { background-image: url('https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80'); }
        .slide-5 { background-image: url('https://images.unsplash.com/photo-1596402184320-417e7178b2cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'); }
        
        @keyframes slideCarousel {
          0%, 20% { transform: translateX(0); }
          20%, 40% { transform: translateX(-20%); }
          40%, 60% { transform: translateX(-40%); }
          60%, 80% { transform: translateX(-60%); }
          80%, 100% { transform: translateX(-80%); }
        }
        
        .main-content {
          padding-top: 80px;
          min-height: calc(100vh - 80px);
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        @keyframes fadeInUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideInFromRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
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
    { id: 'users', label: 'User Management', icon: <UserCheck size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <Activity size={20} /> },
    { id: 'risk-zones', label: 'Risk Zones', icon: <Globe size={20} /> }
  ];

  return (
    <nav className="admin-navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <Shield className="brand-icon" />
          <span className="nav-brand-span">TouristGuard Admin</span>
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

// Admin Dashboard Component - Using the simpler version from document 2 with Hems styling
const AdminDashboard = ({ alertsData, loading }) => {
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
        <style jsx>{`
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
            border-top: 3px solid #FF416C;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <div className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">Monitor and manage tourist safety alerts</p>
        </div>
        
        <div className="alerts-section">
          <h2 className="section-title">Recent Alerts</h2>
          <div className="alerts-table">
            <div className="table-header">
              <span>Tourist ID</span>
              <span>Location</span>
              <span>Timestamp</span>
              <span>Status</span>
            </div>
            {alertsData.length > 0 ? (
              alertsData.map(alert => (
                <div key={alert.id} className="table-row">
                  <span className="tourist-id">{alert.touristId || alert.tourist_id}</span>
                  <span className="location">
                    <MapPin className="location-icon" />
                    {typeof alert.latitude === 'number' ? alert.latitude.toFixed(4) : alert.latitude}, {typeof alert.longitude === 'number' ? alert.longitude.toFixed(4) : alert.longitude}
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
        
        <div className="stats-section">
          <div className="stat-card">
            <h3>Total Alerts</h3>
            <span className="stat-number">{alertsData.length}</span>
          </div>
          <div className="stat-card">
            <h3>Active Cases</h3>
            <span className="stat-number">{alertsData.length > 0 ? Math.min(alertsData.length, 3) : 0}</span>
          </div>
          <div className="stat-card">
            <h3>Resolved</h3>
            <span className="stat-number">{Math.max(0, alertsData.length - 3)}</span>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .admin-dashboard {
          padding: 2rem;
          min-height: calc(100vh - 80px);
        }
        
        .admin-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .admin-header {
          text-align: center;
          margin-bottom: 3rem;
          animation: fadeInUp 0.8s ease;
        }
        
        .admin-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .admin-subtitle {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.1rem;
        }
        
        .alerts-section {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 2rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 2rem;
          animation: fadeInUp 0.8s ease 0.2s both;
        }
        
        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: white;
        }
        
        .alerts-table {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .table-header {
          display: grid;
          grid-template-columns: 150px 1fr 200px 100px;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          font-weight: 600;
          color: white;
        }
        
        .table-row {
          display: grid;
          grid-template-columns: 150px 1fr 200px 100px;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          align-items: center;
          transition: all 0.3s ease;
        }
        
        .table-row:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateX(5px);
        }
        
        .tourist-id {
          font-weight: 600;
          color: #FF416C;
        }
        
        .location {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.9);
        }
        
        .location-icon, .time-icon {
          width: 16px;
          height: 16px;
          color: #FF416C;
        }
        
        .timestamp {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.8);
        }
        
        .status {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          text-align: center;
        }
        
        .status.active {
          background: rgba(34, 197, 94, 0.2);
          color: #22C55E;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }
        
        .no-alerts {
          text-align: center;
          padding: 2rem;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }
        
        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          animation: fadeInUp 0.8s ease 0.4s both;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        
        .stat-card h3 {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 0.5rem;
        }
        
        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: #FF416C;
        }
        
        @media (max-width: 768px) {
          .table-header, .table-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
          
          .admin-dashboard {
            padding: 1rem;
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