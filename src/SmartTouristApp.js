import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle, useMap, useMapEvents } from 'react-leaflet';
import { 
  Shield, AlertTriangle, Users, Heart, Navigation, 
  Bell, Settings, Map as MapIcon, Clock, Share2,
  Download, X, ChevronRight, ShoppingBag, Phone,
  Battery, Wifi, WifiOff, Volume2, VolumeX, Play,
  Target, Zap, UserPlus, FileText, Eye, EyeOff
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const API_BASE_URL = 'http://localhost:8000';

// Geofencing utility functions
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

const pointInPolygon = (point, polygon) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    
    const intersect = ((yi > point[1]) !== (yj > point[1]))
        && (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

// Mock geofences for demo
const mockGeofences = [
  {
    id: 'fence-taj-main',
    name: 'Taj Mahal Main Gate',
    description: 'High security zone with crowd monitoring',
    fence_type: 'restricted',
    geometry: {
      type: 'circle',
      center: [27.1751, 78.0421],
      radius: 300
    },
    triggers: {
      on_entry: ['audio_guide', 'log', 'show_vendors'],
      on_exit: ['notify_family'],
      on_dwell: ['crowd_alert']
    },
    active: true,
    safety_score: 85,
    audio_guide_url: '/audio/taj-guide.mp3'
  },
  {
    id: 'fence-market',
    name: 'Kinari Bazaar',
    description: 'Verified vendor marketplace',
    fence_type: 'market',
    geometry: {
      type: 'polygon',
      coordinates: [
        [27.1780, 78.0390],
        [27.1790, 78.0390],
        [27.1790, 78.0410],
        [27.1780, 78.0410]
      ]
    },
    triggers: {
      on_entry: ['show_vendors', 'log'],
      on_exit: ['log']
    },
    active: true,
    safety_score: 75,
    vendors: [
      { name: 'Sharma Handicrafts', verified: true, rating: 4.8 },
      { name: 'Taj Souvenirs', verified: true, rating: 4.5 }
    ]
  },
  {
    id: 'fence-danger',
    name: 'Construction Zone',
    description: 'Restricted area - high risk',
    fence_type: 'restricted',
    geometry: {
      type: 'circle',
      center: [27.1800, 78.0450],
      radius: 200
    },
    triggers: {
      on_entry: ['danger_alert', 'show_exit_route', 'log'],
      on_dwell: ['escalate_alert']
    },
    active: true,
    safety_score: 20
  }
];

// Smart Travel Zones Main Component
const SmartTravelZonesPage = () => {
  const [userLocation, setUserLocation] = useState({ lat: 27.1751, lng: 78.0421 });
  const [geofences, setGeofences] = useState(mockGeofences);
  const [activeEvents, setActiveEvents] = useState([]);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [privacyLevel, setPrivacyLevel] = useState('family'); // 'only_me', 'family', 'authorities'
  const [batteryMode, setBatteryMode] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showModal, setShowModal] = useState(null);
  const [familyContacts, setFamilyContacts] = useState([]);
  const [travelJournal, setTravelJournal] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [currentFence, setCurrentFence] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  
  const locationWatchRef = useRef(null);
  const [mapLayers, setMapLayers] = useState({
    geofences: true,
    heatmap: true,
    emergency: true
  });

  // Initialize location tracking
  useEffect(() => {
    if (locationEnabled && !demoMode) {
      if (navigator.geolocation) {
        locationWatchRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const newLoc = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setUserLocation(newLoc);
            checkGeofences(newLoc);
          },
          (error) => console.error('Location error:', error),
          {
            enableHighAccuracy: !batteryMode,
            maximumAge: batteryMode ? 60000 : 10000,
            timeout: 5000
          }
        );
      }
    }
    
    return () => {
      if (locationWatchRef.current) {
        navigator.geolocation.clearWatch(locationWatchRef.current);
      }
    };
  }, [locationEnabled, batteryMode, demoMode]);

  // Check geofence crossings
  const checkGeofences = (location) => {
    geofences.forEach(fence => {
      const isInside = isInsideFence(location, fence);
      const wasInside = currentFence === fence.id;
      
      if (isInside && !wasInside) {
        handleFenceEvent('enter', fence, location);
      } else if (!isInside && wasInside) {
        handleFenceEvent('exit', fence, location);
      }
    });
  };

  const isInsideFence = (location, fence) => {
    if (fence.geometry.type === 'circle') {
      const distance = haversineDistance(
        location.lat, location.lng,
        fence.geometry.center[0], fence.geometry.center[1]
      );
      return distance <= fence.geometry.radius;
    } else if (fence.geometry.type === 'polygon') {
      return pointInPolygon(
        [location.lat, location.lng],
        fence.geometry.coordinates
      );
    }
    return false;
  };

  const handleFenceEvent = async (eventType, fence, location) => {
    const event = {
      id: `evt-${Date.now()}`,
      type: eventType,
      fence: fence,
      location: location,
      timestamp: new Date().toISOString(),
      actions: fence.triggers[`on_${eventType}`] || []
    };

    setActiveEvents(prev => [event, ...prev].slice(0, 20));
    
    if (eventType === 'enter') {
      setCurrentFence(fence.id);
      
      // Add to travel journal
      setTravelJournal(prev => [...prev, {
        id: `journal-${Date.now()}`,
        fence: fence.name,
        timestamp: new Date(),
        duration: 0
      }]);
    } else if (eventType === 'exit') {
      setCurrentFence(null);
    }

    // Execute actions
    event.actions.forEach(action => {
      switch(action) {
        case 'danger_alert':
          setShowModal({
            type: 'danger',
            fence: fence,
            event: event
          });
          break;
        case 'audio_guide':
          if (audioEnabled && fence.audio_guide_url) {
            playAudioGuide(fence.audio_guide_url);
          }
          break;
        case 'show_vendors':
          if (fence.vendors) {
            setShowModal({
              type: 'vendors',
              fence: fence
            });
          }
          break;
      }
    });

    // Send to backend
    if (!offlineMode) {
      try {
        await fetch(`${API_BASE_URL}/api/geoevents/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 'demo-user-123',
            fence_id: fence.id,
            event_type: eventType,
            lat: location.lat,
            lon: location.lng,
            timestamp: event.timestamp,
            meta: { privacy_level: privacyLevel }
          })
        });
      } catch (error) {
        console.error('Failed to send event:', error);
        // Queue for later if offline
        queueOfflineEvent(event);
      }
    } else {
      queueOfflineEvent(event);
    }
  };

  const queueOfflineEvent = (event) => {
    const queue = JSON.parse(localStorage.getItem('offline_events') || '[]');
    queue.push(event);
    localStorage.setItem('offline_events', JSON.stringify(queue));
  };

  const playAudioGuide = (url) => {
    const audio = new Audio(url);
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const handleSOS = async () => {
    const sosEvent = {
      user_id: 'demo-user-123',
      lat: userLocation.lat,
      lon: userLocation.lng,
      severity: 'high',
      notes: 'Emergency SOS triggered',
      timestamp: new Date().toISOString()
    };

    setActiveEvents(prev => [{
      id: `sos-${Date.now()}`,
      type: 'sos',
      location: userLocation,
      timestamp: new Date().toISOString(),
      fence: { name: 'SOS Alert', fence_type: 'emergency' }
    }, ...prev]);

    try {
      const response = await fetch(`${API_BASE_URL}/api/sos/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sosEvent)
      });
      
      if (response.ok) {
        setShowModal({
          type: 'sos_sent',
          message: 'Emergency alert sent! Help is on the way.'
        });
      }
    } catch (error) {
      queueOfflineEvent({ type: 'sos', ...sosEvent });
      setShowModal({
        type: 'sos_queued',
        message: 'You are offline. Alert will be sent when connection is restored.'
      });
    }
  };

  const simulateGPS = (fenceId, eventType) => {
    setDemoMode(true);
    const fence = geofences.find(f => f.id === fenceId);
    if (fence) {
      let simulatedLocation;
      if (fence.geometry.type === 'circle') {
        simulatedLocation = {
          lat: fence.geometry.center[0],
          lng: fence.geometry.center[1]
        };
      } else {
        simulatedLocation = {
          lat: fence.geometry.coordinates[0][0],
          lng: fence.geometry.coordinates[0][1]
        };
      }
      setUserLocation(simulatedLocation);
      setTimeout(() => {
        handleFenceEvent(eventType, fence, simulatedLocation);
      }, 500);
    }
  };

  const testAlert = () => {
    setShowModal({
      type: 'test',
      message: 'This is a test alert. In a real emergency, authorities and your family would be notified.'
    });
    setTimeout(() => setShowModal(null), 5000);
  };

  const getFenceColor = (fenceType, safetyScore) => {
    if (safetyScore < 30) return '#ef4444'; // red
    if (fenceType === 'restricted') return '#f59e0b'; // orange
    if (fenceType === 'market') return '#10b981'; // green
    if (fenceType === 'tourist') return '#3b82f6'; // blue
    return '#8b5cf6'; // purple
  };

  return (
    <div className="smart-zones-page">
      {/* Header Hero */}
      <section className="zones-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Shield size={20} />
            <span>Real-time Protection Active</span>
          </div>
          <h1 className="zones-title">Smart Travel Zones</h1>
          <p className="zones-subtitle">
            AI-powered geofencing • Real-time safety monitoring • Emergency response
          </p>
          <div className="hero-actions">
            <button className="btn-test" onClick={testAlert}>
              <Bell size={18} />
              Test Alert
            </button>
            <button 
              className="btn-location"
              onClick={() => setLocationEnabled(!locationEnabled)}
            >
              <Navigation size={18} />
              {locationEnabled ? 'Location ON' : 'Location OFF'}
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="zones-container">
        
        {/* Left Sidebar - Controls & Stats */}
        <aside className="zones-sidebar">
          
          {/* Quick Stats */}
          <div className="stat-card">
            <div className="stat-grid">
              <div className="stat-item">
                <Shield size={24} className="stat-icon safe" />
                <div>
                  <div className="stat-value">{geofences.filter(f => f.active).length}</div>
                  <div className="stat-label">Active Zones</div>
                </div>
              </div>
              <div className="stat-item">
                <AlertTriangle size={24} className="stat-icon warning" />
                <div>
                  <div className="stat-value">{activeEvents.length}</div>
                  <div className="stat-label">Recent Events</div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="control-card">
            <h3 className="card-title">
              <Settings size={20} />
              Controls
            </h3>
            
            <div className="control-group">
              <label className="control-label">Privacy Level</label>
              <select 
                className="control-select"
                value={privacyLevel}
                onChange={(e) => setPrivacyLevel(e.target.value)}
              >
                <option value="only_me">Only Me</option>
                <option value="family">Share with Family</option>
                <option value="authorities">Authorities Visible</option>
              </select>
            </div>

            <div className="toggle-group">
              <label className="toggle-item">
                <input 
                  type="checkbox"
                  checked={audioEnabled}
                  onChange={(e) => setAudioEnabled(e.target.checked)}
                />
                <span className="toggle-icon">
                  {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </span>
                <span>Audio Guides</span>
              </label>
              
              <label className="toggle-item">
                <input 
                  type="checkbox"
                  checked={batteryMode}
                  onChange={(e) => setBatteryMode(e.target.checked)}
                />
                <span className="toggle-icon">
                  <Battery size={18} />
                </span>
                <span>Battery Saver</span>
              </label>
              
              <label className="toggle-item">
                <input 
                  type="checkbox"
                  checked={offlineMode}
                  onChange={(e) => setOfflineMode(e.target.checked)}
                />
                <span className="toggle-icon">
                  {offlineMode ? <WifiOff size={18} /> : <Wifi size={18} />}
                </span>
                <span>Offline Mode</span>
              </label>
            </div>

            <div className="control-group">
              <label className="control-label">Map Layers</label>
              <div className="toggle-group">
                <label className="toggle-item small">
                  <input 
                    type="checkbox"
                    checked={mapLayers.geofences}
                    onChange={(e) => setMapLayers({...mapLayers, geofences: e.target.checked})}
                  />
                  <span>Geofences</span>
                </label>
                <label className="toggle-item small">
                  <input 
                    type="checkbox"
                    checked={mapLayers.heatmap}
                    onChange={(e) => setMapLayers({...mapLayers, heatmap: e.target.checked})}
                  />
                  <span>Heatmap</span>
                </label>
              </div>
            </div>
          </div>

          {/* Demo Controls */}
          <div className="control-card demo-card">
            <h3 className="card-title">
              <Target size={20} />
              Demo Controls
            </h3>
            <p className="demo-description">Simulate GPS events for testing</p>
            
            {geofences.slice(0, 3).map(fence => (
              <div key={fence.id} className="demo-fence-item">
                <div className="demo-fence-name">{fence.name}</div>
                <div className="demo-buttons">
                  <button 
                    className="btn-demo-small"
                    onClick={() => simulateGPS(fence.id, 'enter')}
                  >
                    Enter
                  </button>
                  <button 
                    className="btn-demo-small"
                    onClick={() => simulateGPS(fence.id, 'exit')}
                  >
                    Exit
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Emergency SOS */}
          <button className="sos-button" onClick={handleSOS}>
            <AlertTriangle size={24} />
            EMERGENCY SOS
          </button>
        </aside>

        {/* Center - Map */}
        <main className="zones-map-container">
          <div className="map-wrapper">
            <MapContainer 
              center={[userLocation.lat, userLocation.lng]} 
              zoom={14} 
              className="leaflet-map"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              
              {/* User marker */}
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>
                  <strong>Your Location</strong>
                  <br />
                  Lat: {userLocation.lat.toFixed(6)}
                  <br />
                  Lng: {userLocation.lng.toFixed(6)}
                </Popup>
              </Marker>

              {/* Geofences */}
              {mapLayers.geofences && geofences.map(fence => {
                const color = getFenceColor(fence.fence_type, fence.safety_score);
                
                if (fence.geometry.type === 'circle') {
                  return (
                    <Circle
                      key={fence.id}
                      center={fence.geometry.center}
                      radius={fence.geometry.radius}
                      pathOptions={{ 
                        color: color, 
                        fillColor: color, 
                        fillOpacity: 0.2 
                      }}
                    >
                      <Popup>
                        <strong>{fence.name}</strong>
                        <br />
                        {fence.description}
                        <br />
                        Safety Score: {fence.safety_score}/100
                      </Popup>
                    </Circle>
                  );
                } else if (fence.geometry.type === 'polygon') {
                  return (
                    <Polygon
                      key={fence.id}
                      positions={fence.geometry.coordinates}
                      pathOptions={{ 
                        color: color, 
                        fillColor: color, 
                        fillOpacity: 0.2 
                      }}
                    >
                      <Popup>
                        <strong>{fence.name}</strong>
                        <br />
                        {fence.description}
                      </Popup>
                    </Polygon>
                  );
                }
                return null;
              })}
              
              <MapUpdater center={[userLocation.lat, userLocation.lng]} />
            </MapContainer>

            {/* Map Legend */}
            <div className="map-legend">
              <h4>Zone Types</h4>
              <div className="legend-item">
                <span className="legend-dot" style={{background: '#ef4444'}}></span>
                Danger/Restricted
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{background: '#f59e0b'}}></span>
                Caution
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{background: '#10b981'}}></span>
                Market/Safe
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{background: '#3b82f6'}}></span>
                Tourist Zone
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Events & Journal */}
        <aside className="zones-events">
          
          {/* Alerts Feed */}
          <div className="events-card">
            <h3 className="card-title">
              <Bell size={20} />
              Recent Events
            </h3>
            <div className="events-list">
              {activeEvents.length === 0 ? (
                <div className="empty-state">
                  <Shield size={32} />
                  <p>No events yet. Travel safely!</p>
                </div>
              ) : (
                activeEvents.map(event => (
                  <div key={event.id} className={`event-item event-${event.type}`}>
                    <div className="event-icon">
                      {event.type === 'enter' && <ChevronRight size={18} />}
                      {event.type === 'exit' && <X size={18} />}
                      {event.type === 'sos' && <AlertTriangle size={18} />}
                    </div>
                    <div className="event-content">
                      <div className="event-title">
                        {event.type.toUpperCase()}: {event.fence.name}
                      </div>
                      <div className="event-time">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Travel Journal */}
          <div className="journal-card">
            <div className="card-header">
              <h3 className="card-title">
                <FileText size={20} />
                Travel Journal
              </h3>
              <button className="btn-icon" title="Export PDF">
                <Download size={16} />
              </button>
            </div>
            <div className="journal-list">
              {travelJournal.slice(-5).reverse().map(entry => (
                <div key={entry.id} className="journal-item">
                  <Clock size={16} className="journal-icon" />
                  <div className="journal-content">
                    <div className="journal-place">{entry.fence}</div>
                    <div className="journal-time">
                      {entry.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Family Connect */}
          <div className="family-card">
            <h3 className="card-title">
              <Heart size={20} />
              Family Connect
            </h3>
            <button className="btn-secondary full-width">
              <UserPlus size={16} />
              Add Family Member
            </button>
            {familyContacts.length > 0 && (
              <div className="family-list">
                {familyContacts.map(contact => (
                  <div key={contact.id} className="family-item">
                    <Users size={16} />
                    <span>{contact.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Modals */}
      {showModal && (
        <Modal 
          modal={showModal} 
          onClose={() => setShowModal(null)}
          onSOS={handleSOS}
        />
      )}

      <style jsx>{`
        .smart-zones-page {
          min-height: 100vh;
          padding-bottom: 2rem;
        }

        .zones-hero {
          padding: 3rem 2rem 2rem;
          text-align: center;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 20px;
          color: #22c55e;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .zones-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #fafafaff 0%, #f0eae9ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .zones-subtitle {
          font-size: 1rem;
          opacity: 0.8;
          margin-bottom: 1.5rem;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-test, .btn-location {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-test {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
        }

        .btn-test:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
        }

        .btn-location {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .btn-location:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .zones-container {
          display: grid;
          grid-template-columns: 320px 1fr 320px;
          gap: 1.5rem;
          padding: 2rem;
          max-width: 1800px;
          margin: 0 auto;
        }

        .zones-sidebar, .zones-events {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .stat-card, .control-card, .events-card, .journal-card, .family-card, .demo-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
        }

        .stat-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          padding: 8px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.1);
        }

        .stat-icon.safe { color: #22c55e; }
        .stat-icon.warning { color: #f59e0b; }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
        }

        .stat-label {
          font-size: 0.75rem;
          opacity: 0.7;
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: white;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .control-group {
          margin-bottom: 1rem;
        }

        .control-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          opacity: 0.9;
        }

        .control-select {
          width: 100%;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          font-size: 0.875rem;
        }

        .control-select option {
          background: #1a1a2e;
          color: white;
        }

        .toggle-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .toggle-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          transition: background 0.2s;
        }

        .toggle-item:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .toggle-item.small {
          padding: 0.5rem;
          font-size: 0.875rem;
        }

        .toggle-item input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .toggle-icon {
          color: #3b82f6;
        }

        .demo-card {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .demo-description {
          font-size: 0.875rem;
          opacity: 0.8;
          margin-bottom: 1rem;
        }

        .demo-fence-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          margin-bottom: 0.5rem;
        }

        .demo-fence-name {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .demo-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .btn-demo-small {
          padding: 0.375rem 0.75rem;
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 6px;
          color: #3b82f6;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-demo-small:hover {
          background: rgba(59, 130, 246, 0.3);
          transform: translateY(-1px);
        }

        .sos-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          animation: pulse 2s infinite;
        }

        .sos-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(239, 68, 68, 0.4);
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        .zones-map-container {
          position: relative;
        }

        .map-wrapper {
          position: relative;
          height: 700px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          overflow: hidden;
        }

        .leaflet-map {
          width: 100%;
          height: 100%;
          border-radius: 16px;
        }

        .map-legend {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 1000;
        }

        .map-legend h4 {
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: white;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          margin-bottom: 0.5rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .events-list, .journal-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .events-list::-webkit-scrollbar, .journal-list::-webkit-scrollbar {
          width: 4px;
        }

        .events-list::-webkit-scrollbar-track, .journal-list::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 2px;
        }

        .events-list::-webkit-scrollbar-thumb, .journal-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          opacity: 0.6;
        }

        .empty-state svg {
          margin-bottom: 0.5rem;
          opacity: 0.5;
        }

        .event-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          margin-bottom: 0.5rem;
          border-left: 3px solid;
        }

        .event-item.event-enter {
          border-left-color: #22c55e;
        }

        .event-item.event-exit {
          border-left-color: #3b82f6;
        }

        .event-item.event-sos {
          border-left-color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .event-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          flex-shrink: 0;
        }

        .event-content {
          flex: 1;
        }

        .event-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
          margin-bottom: 0.25rem;
        }

        .event-time {
          font-size: 0.75rem;
          opacity: 0.7;
        }

        .journal-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          margin-bottom: 0.5rem;
        }

        .journal-icon {
          color: #3b82f6;
          flex-shrink: 0;
        }

        .journal-content {
          flex: 1;
        }

        .journal-place {
          font-size: 0.875rem;
          font-weight: 500;
          color: white;
        }

        .journal-time {
          font-size: 0.75rem;
          opacity: 0.7;
        }

        .btn-secondary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .btn-secondary.full-width {
          width: 100%;
        }

        .btn-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-icon:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .family-list {
          margin-top: 1rem;
        }

        .family-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 6px;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        @media (max-width: 1400px) {
          .zones-container {
            grid-template-columns: 280px 1fr 280px;
          }
        }

        @media (max-width: 1024px) {
          .zones-container {
            grid-template-columns: 1fr;
          }

          .zones-sidebar {
            order: 2;
          }

          .zones-map-container {
            order: 1;
          }

          .zones-events {
            order: 3;
          }

          .map-wrapper {
            height: 500px;
          }
        }

        @media (max-width: 768px) {
          .zones-hero {
            padding: 2rem 1rem 1rem;
          }

          .zones-title {
            font-size: 2rem;
          }

          .zones-container {
            padding: 1rem;
          }

          .map-wrapper {
            height: 400px;
          }

          .map-legend {
            bottom: 10px;
            right: 10px;
            padding: 0.75rem;
          }

          .stat-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

// Map center updater component
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

// Modal Component
const Modal = ({ modal, onClose, onSOS }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        {modal.type === 'danger' && (
          <div className="modal-danger">
            <AlertTriangle size={48} className="modal-icon danger" />
            <h2 className="modal-title">DANGER ZONE</h2>
            <p className="modal-text">
              You have entered <strong>{modal.fence.name}</strong>
            </p>
            <p className="modal-description">{modal.fence.description}</p>
            <div className="modal-actions">
              <button className="btn-modal-sos" onClick={onSOS}>
                <AlertTriangle size={18} />
                Send SOS
              </button>
              <button className="btn-modal-secondary" onClick={onClose}>
                Show Exit Route
              </button>
            </div>
          </div>
        )}

        {modal.type === 'vendors' && (
          <div className="modal-vendors">
            <ShoppingBag size={48} className="modal-icon safe" />
            <h2 className="modal-title">Verified Vendors</h2>
            <p className="modal-text">Government verified marketplace</p>
            <div className="vendor-list">
              {modal.fence.vendors?.map((vendor, idx) => (
                <div key={idx} className="vendor-item">
                  <div className="vendor-info">
                    <div className="vendor-name">{vendor.name}</div>
                    <div className="vendor-rating">⭐ {vendor.rating}</div>
                  </div>
                  {vendor.verified && (
                    <span className="vendor-badge">✓ Verified</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {modal.type === 'test' && (
          <div className="modal-test">
            <Bell size={48} className="modal-icon info" />
            <h2 className="modal-title">Test Alert</h2>
            <p className="modal-text">{modal.message}</p>
          </div>
        )}

        {(modal.type === 'sos_sent' || modal.type === 'sos_queued') && (
          <div className="modal-sos">
            {modal.type === 'sos_sent' ? (
              <Shield size={48} className="modal-icon safe" />
            ) : (
              <WifiOff size={48} className="modal-icon warning" />
            )}
            <h2 className="modal-title">
              {modal.type === 'sos_sent' ? 'SOS Sent' : 'SOS Queued'}
            </h2>
            <p className="modal-text">{modal.message}</p>
          </div>
        )}

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 1rem;
          }

          .modal-content {
            position: relative;
            background: linear-gradient(135deg, rgba(30, 30, 50, 0.95), rgba(20, 20, 35, 0.95));
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 2rem;
            max-width: 500px;
            width: 100%;
            animation: modalSlideIn 0.3s ease;
          }

          @keyframes modalSlideIn {
            from {
              transform: translateY(-50px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          .modal-close {
            position: absolute;
            top: 1rem;
            right: 1rem;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 8px;
            color: white;
            cursor: pointer;
            transition: all 0.2s;
          }

          .modal-close:hover {
            background: rgba(255, 255, 255, 0.2);
          }

          .modal-danger, .modal-vendors, .modal-test, .modal-sos {
            text-align: center;
          }

          .modal-icon {
            margin: 0 auto 1rem;
          }

          .modal-icon.danger {
            color: #ef4444;
          }

          .modal-icon.safe {
            color: #22c55e;
          }

          .modal-icon.info {
            color: #3b82f6;
          }

          .modal-icon.warning {
            color: #f59e0b;
          }

          .modal-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: white;
            margin-bottom: 0.5rem;
          }

          .modal-text {
            font-size: 1rem;
            opacity: 0.9;
            margin-bottom: 1rem;
          }

          .modal-description {
            font-size: 0.875rem;
            opacity: 0.7;
            margin-bottom: 1.5rem;
          }

          .modal-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
          }

          .btn-modal-sos {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.875rem 1.5rem;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            border: none;
            border-radius: 12px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
          }

          .btn-modal-sos:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(239, 68, 68, 0.3);
          }

          .btn-modal-secondary {
            padding: 0.875rem 1.5rem;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-modal-secondary:hover {
            background: rgba(255, 255, 255, 0.15);
          }

          .vendor-list {
            margin-top: 1.5rem;
          }

          .vendor-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            margin-bottom: 0.75rem;
          }

          .vendor-info {
            text-align: left;
          }

          .vendor-name {
            font-weight: 600;
            color: white;
            margin-bottom: 0.25rem;
          }

          .vendor-rating {
            font-size: 0.875rem;
            opacity: 0.8;
          }

          .vendor-badge {
            padding: 0.375rem 0.75rem;
            background: rgba(34, 197, 94, 0.2);
            border: 1px solid rgba(34, 197, 94, 0.3);
            border-radius: 6px;
            color: #22c55e;
            font-size: 0.75rem;
            font-weight: 600;
          }

          @media (max-width: 480px) {
            .modal-content {
              padding: 1.5rem;
            }

            .modal-title {
              font-size: 1.5rem;
            }

            .modal-actions {
              flex-direction: column;
            }

            .btn-modal-sos, .btn-modal-secondary {
              width: 100%;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default SmartTravelZonesPage;