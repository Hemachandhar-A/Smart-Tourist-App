import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, Polyline, useMap } from 'react-leaflet';
import { AlertTriangle, Shield, Users, MapPin, Navigation, Phone, X, Eye, Lock, Play, Square, Download, Menu, ChevronDown } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOCIgZmlsbD0iIzAwN0FGRiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIzIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjMiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
};

const SmartTravelZones = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [showConsent, setShowConsent] = useState(true);
  const [locationPermission, setLocationPermission] = useState(false);
  const [privacySetting, setPrivacySetting] = useState('family');
  const [selectedPrivacy, setSelectedPrivacy] = useState('family');
  const [geoFences, setGeoFences] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activeZones, setActiveZones] = useState(new Set());
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [showExitRoute, setShowExitRoute] = useState(false);
  const [exitRoute, setExitRoute] = useState(null);
  const [dangerZone, setDangerZone] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationPath, setSimulationPath] = useState([]);
  const [currentSimStep, setCurrentSimStep] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);
  const [navigationProgress, setNavigationProgress] = useState(0);
  const [currentInstruction, setCurrentInstruction] = useState('');
  const [distanceRemaining, setDistanceRemaining] = useState(0);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  
  const watchId = useRef(null);
  const simulationInterval = useRef(null);
  const navigationInterval = useRef(null);
  const alertedZones = useRef(new Set());

  const generateGeoFences = (lat, lon) => {
    return [
      {
        id: 'danger-01',
        name: 'Construction Zone',
        type: 'danger',
        geometry: { type: 'Point', coordinates: [lon + 0.003, lat + 0.002] },
        radius: 120,
        safety_score: 25,
        description: 'Active construction. Restricted access.'
      },
      {
        id: 'tourist-01',
        name: 'Heritage Plaza',
        type: 'tourist',
        geometry: { 
          type: 'Polygon', 
          coordinates: [[
            [lon - 0.002, lat + 0.0015],
            [lon - 0.001, lat + 0.003],
            [lon + 0.0005, lat + 0.0025],
            [lon + 0.001, lat + 0.001],
            [lon - 0.0005, lat + 0.0005],
            [lon - 0.002, lat + 0.0015]
          ]]
        },
        safety_score: 85,
        description: 'Historic district with guided tours.'
      },
      {
        id: 'market-01',
        name: 'Main Market',
        type: 'market',
        geometry: { type: 'Point', coordinates: [lon - 0.0025, lat - 0.002] },
        radius: 180,
        safety_score: 70,
        description: 'Busy marketplace. Watch for crowds.'
      }
    ];
  };

  const generateRoadBasedPath = (startLat, startLon) => {
    const path = [];
    const roadSegments = [
      { lat: 0, lon: 0 },
      { lat: 0.0003, lon: 0.0004 },
      { lat: 0.0006, lon: 0.0008 },
      { lat: 0.001, lon: 0.0012 },
      { lat: 0.0015, lon: 0.0015 },
      { lat: 0.002, lon: 0.002 },
      { lat: 0.0025, lon: 0.0022 },
      { lat: 0.003, lon: 0.0025 }
    ];

    roadSegments.forEach(segment => {
      const steps = 15;
      const prevSegment = path.length > 0 ? roadSegments[roadSegments.indexOf(segment) - 1] : segment;
      
      for (let i = 0; i <= steps; i++) {
        const ratio = i / steps;
        path.push({
          lat: startLat + prevSegment.lat + (segment.lat - prevSegment.lat) * ratio,
          lon: startLon + prevSegment.lon + (segment.lon - prevSegment.lon) * ratio
        });
      }
    });
    
    return path;
  };

  const checkPointInFence = (lat, lon, fence) => {
    if (fence.geometry.type === 'Point' && fence.radius) {
      const R = 6371e3;
      const φ1 = lat * Math.PI/180;
      const φ2 = fence.geometry.coordinates[1] * Math.PI/180;
      const Δφ = (fence.geometry.coordinates[1] - lat) * Math.PI/180;
      const Δλ = (fence.geometry.coordinates[0] - lon) * Math.PI/180;
      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c <= fence.radius;
    } else if (fence.geometry.type === 'Polygon') {
      let inside = false;
      const coords = fence.geometry.coordinates[0];
      for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
        const xi = coords[i][0], yi = coords[i][1];
        const xj = coords[j][0], yj = coords[j][1];
        const intersect = ((yi > lat) !== (yj > lat)) &&
                         (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      return inside;
    }
    return false;
  };

  const checkFenceIntersections = (lat, lon) => {
    if (isNavigating) return;
    
    const currentZones = new Set();
    
    geoFences.forEach(fence => {
      const isInside = checkPointInFence(lat, lon, fence);
      const wasInside = activeZones.has(fence.id);
      
      if (isInside) {
        currentZones.add(fence.id);
        if (!wasInside && !alertedZones.current.has(fence.id) && !showDangerModal) {
          handleFenceEntry(fence, lat, lon);
          alertedZones.current.add(fence.id);
        }
      } else if (wasInside) {
        handleFenceExit(fence, lat, lon);
        alertedZones.current.delete(fence.id);
      }
    });
    
    setActiveZones(currentZones);
  };

  const handleFenceEntry = (fence, lat, lon) => {
    const alert = {
      id: Date.now() + Math.random(),
      type: 'entry',
      fence_id: fence.id,
      fence_name: fence.name,
      fence_type: fence.type,
      timestamp: new Date(),
      location: { lat, lon },
      message: `Entered ${fence.name}`
    };
    setAlerts(prev => [alert, ...prev]);

    if (fence.type === 'danger') {
      setDangerZone(fence);
      setShowDangerModal(true);
      const route = generateExitRoute(lat, lon, fence);
      setExitRoute(route);
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }
  };

  const handleFenceExit = (fence, lat, lon) => {
    if (isNavigating) return;
    
    const alert = {
      id: Date.now() + Math.random(),
      type: 'exit',
      fence_id: fence.id,
      fence_name: fence.name,
      fence_type: fence.type,
      timestamp: new Date(),
      location: { lat, lon },
      message: `Exited ${fence.name}`
    };
    setAlerts(prev => [alert, ...prev]);

    if (fence.type === 'danger' && fence.id === dangerZone?.id) {
      setShowDangerModal(false);
      setDangerZone(null);
      setExitRoute(null);
    }
  };

  const generateExitRoute = (userLat, userLon, dangerFence) => {
    const centerCoords = dangerFence.geometry.type === 'Point' 
      ? dangerFence.geometry.coordinates 
      : [dangerFence.geometry.coordinates[0][0][0], dangerFence.geometry.coordinates[0][0][1]];
    
    const [centerLon, centerLat] = centerCoords;
    const vectorLon = userLon - centerLon;
    const vectorLat = userLat - centerLat;
    const magnitude = Math.sqrt(vectorLon * vectorLon + vectorLat * vectorLat);
    const normalizedLon = vectorLon / magnitude;
    const normalizedLat = vectorLat / magnitude;
    
    const waypoints = [];
    const numWaypoints = 8;
    
    for (let i = 0; i <= numWaypoints; i++) {
      const ratio = i / numWaypoints;
      const distance = 0.004 * ratio;
      
      const perpLon = -normalizedLat * 0.0005 * Math.sin(ratio * Math.PI);
      const perpLat = normalizedLon * 0.0005 * Math.sin(ratio * Math.PI);
      
      waypoints.push({
        lat: userLat + normalizedLat * distance + perpLat,
        lon: userLon + normalizedLon * distance + perpLon,
        instruction: i === 0 ? 'Starting navigation' : 
                    i === Math.floor(numWaypoints * 0.3) ? 'Continue straight for 80 meters' :
                    i === Math.floor(numWaypoints * 0.6) ? 'Bear right towards safe zone' :
                    i === numWaypoints ? 'You have reached safety' : ''
      });
    }
    
    return waypoints;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2 - lat1) * Math.PI/180;
    const Δλ = (lon2 - lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const updateLocation = (lat, lon) => {
    setUserLocation({ lat, lon });
    setMapCenter([lat, lon]);
    
    if (!isNavigating) {
      checkFenceIntersections(lat, lon);
    }
  };

  const requestLocationPermission = async (privacy) => {
    setPrivacySetting(privacy);
    
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });
        
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lon: longitude });
        setMapCenter([latitude, longitude]);
        setLocationPermission(true);
        setShowConsent(false);
        setGeoFences(generateGeoFences(latitude, longitude));
        
        watchId.current = navigator.geolocation.watchPosition(
          (pos) => updateLocation(pos.coords.latitude, pos.coords.longitude),
          (error) => console.error('Location error:', error),
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
        );
      } catch (error) {
        const fallback = { lat: 28.6139, lon: 77.2090 };
        setUserLocation(fallback);
        setMapCenter([fallback.lat, fallback.lon]);
        setGeoFences(generateGeoFences(fallback.lat, fallback.lon));
        setShowConsent(false);
      }
    }
  };

  const handleSimulateWalk = () => {
    if (!userLocation) return;
    
    if (isSimulating) {
      setIsSimulating(false);
      if (simulationInterval.current) clearInterval(simulationInterval.current);
      return;
    }
    
    if (isNavigating) return;
    
    const path = generateRoadBasedPath(userLocation.lat, userLocation.lon);
    setSimulationPath(path);
    setCurrentSimStep(0);
    setIsSimulating(true);
    
    let step = 0;
    simulationInterval.current = setInterval(() => {
      if (isNavigating) {
        setIsSimulating(false);
        clearInterval(simulationInterval.current);
        return;
      }
      
      if (step >= path.length) {
        setIsSimulating(false);
        clearInterval(simulationInterval.current);
        return;
      }
      const pos = path[step];
      updateLocation(pos.lat, pos.lon);
      setCurrentSimStep(step);
      step++;
    }, 1000);
  };

  const handleStartNavigation = () => {
    setIsNavigating(true);
    setShowExitRoute(false);
    setShowDangerModal(false);
    setNavigationProgress(0);
    
    if (isSimulating && simulationInterval.current) {
      clearInterval(simulationInterval.current);
      setIsSimulating(false);
    }
    
    setSnackbarMessage(`Navigating out of ${dangerZone?.name || 'danger zone'}`);
    setShowSnackbar(true);
    
    if (exitRoute && exitRoute.length > 0) {
      let step = 0;
      const totalSteps = exitRoute.length - 1;
      
      navigationInterval.current = setInterval(() => {
        if (step >= totalSteps) {
          clearInterval(navigationInterval.current);
          setIsNavigating(false);
          setSnackbarMessage('You have reached safety!');
          setTimeout(() => setShowSnackbar(false), 3000);
          return;
        }
        
        const currentPoint = exitRoute[step];
        
        setUserLocation({ lat: currentPoint.lat, lon: currentPoint.lon });
        setMapCenter([currentPoint.lat, currentPoint.lon]);
        
        const remaining = calculateDistance(
          currentPoint.lat, currentPoint.lon,
          exitRoute[totalSteps].lat, exitRoute[totalSteps].lon
        );
        setDistanceRemaining(Math.round(remaining));
        
        if (currentPoint.instruction) {
          setCurrentInstruction(currentPoint.instruction);
          if (navigator.vibrate && step > 0) navigator.vibrate(100);
        }
        
        setNavigationProgress((step / totalSteps) * 100);
        step++;
      }, 1500);
    }
  };

  const handleTestSOS = () => {
    if (!userLocation) return;
    const alert = {
      id: Date.now(),
      type: 'sos',
      fence_name: 'Emergency Services',
      fence_type: 'emergency',
      timestamp: new Date(),
      location: userLocation,
      message: 'Emergency SOS activated. Help is on the way.'
    };
    setAlerts(prev => [alert, ...prev]);
    if (navigator.vibrate) navigator.vibrate([300, 200, 300]);
  };

  const exportJournal = () => {
    const data = JSON.stringify(alerts.map(a => ({
      time: a.timestamp.toLocaleTimeString(),
      type: a.type,
      location: a.fence_name,
      message: a.message
    })), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `travel-journal-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  useEffect(() => {
    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
      if (simulationInterval.current) clearInterval(simulationInterval.current);
      if (navigationInterval.current) clearInterval(navigationInterval.current);
    };
  }, []);

  const filteredAlerts = alerts.filter(a => {
    if (filterType === 'all') return true;
    if (filterType === 'danger') return a.fence_type === 'danger' || a.type === 'sos';
    if (filterType === 'entries') return a.type === 'entry';
    return true;
  });

  return (
    <div className="app-container">
      {/* Snackbar */}
      {showSnackbar && (
        <div className="snackbar">
          <div style={{ flex: 1 }}>
            <div className="snackbar-title">{snackbarMessage}</div>
            {isNavigating && (
              <div>
                <div className="snackbar-text">{currentInstruction}</div>
                <div className="snackbar-text">Remaining: {distanceRemaining}m</div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${navigationProgress}%` }} />
                </div>
              </div>
            )}
          </div>
          <button onClick={() => setShowSnackbar(false)} className="snackbar-close">
            <X size={14} color="white" />
          </button>
        </div>
      )}

      {/* Consent Modal */}
      {showConsent && (
        <div className="modal-overlay">
          <div className="consent-modal">
            <div className="consent-header">
              <Shield size={56} style={{ margin: '0 auto 16px', color: '#fbbf24' }} />
              <h2 className="consent-title">Smart Travel Zones</h2>
              <p className="consent-subtitle">Enable location-based safety features</p>
            </div>

            <div className="privacy-section">
              <h3 className="privacy-title">Choose Privacy Level</h3>
              {[
                { id: 'only_me', icon: Eye, title: 'Only Me', desc: 'Full privacy, local storage' },
                { id: 'family', icon: Users, title: 'Family', desc: 'Share with family in emergencies' },
                { id: 'authorities', icon: Lock, title: 'Authorities', desc: 'Full emergency services access' }
              ].map(opt => (
                <div 
                  key={opt.id} 
                  onClick={() => setSelectedPrivacy(opt.id)} 
                  className={`privacy-option ${selectedPrivacy === opt.id ? 'privacy-option-selected' : ''}`}
                >
                  <opt.icon size={22} />
                  <div style={{ flex: 1 }}>
                    <div className="privacy-option-title">{opt.title}</div>
                    <div className="privacy-option-desc">{opt.desc}</div>
                  </div>
                  <div className={`privacy-radio ${selectedPrivacy === opt.id ? 'privacy-radio-selected' : ''}`} />
                </div>
              ))}
            </div>

            <div className="consent-buttons">
              <button onClick={() => setShowConsent(false)} className="btn-secondary">Skip</button>
              <button onClick={() => requestLocationPermission(selectedPrivacy)} className="btn-primary">Enable Safety</button>
            </div>
          </div>
        </div>
      )}

      {/* Danger Modal */}
      {showDangerModal && dangerZone && !showExitRoute && !isNavigating && (
        <div className="modal-overlay">
          <div className="danger-modal">
            <button onClick={() => setShowDangerModal(false)} className="modal-close">
              <X size={18} color="white" />
            </button>

            <div className="danger-header">
              <AlertTriangle size={56} className="danger-icon" />
              <h2 className="danger-title">DANGER ZONE ALERT</h2>
              <p className="danger-subtitle">You have entered a restricted area</p>
            </div>

            <div className="danger-info">
              <h3 className="danger-zone-name">{dangerZone.name}</h3>
              <p className="danger-description">{dangerZone.description}</p>
              <div className="safety-bar">
                <div className="safety-bar-bg">
                  <div className="safety-bar-fill" style={{ width: `${dangerZone.safety_score}%` }} />
                </div>
                <span className="safety-score">{dangerZone.safety_score}/100</span>
              </div>
            </div>

            <div className="danger-actions">
              <button onClick={() => setShowExitRoute(true)} className="btn-route">
                <Navigation size={18} />
                <span>Exit Route</span>
              </button>
              <button onClick={handleTestSOS} className="btn-sos">
                <Phone size={18} />
                <span>Emergency SOS</span>
              </button>
            </div>

            <div className="danger-tips">
              <strong>Safety Tips:</strong>
              <ul>
                <li>Follow exit route immediately</li>
                <li>Stay alert and move quickly</li>
                <li>Contact authorities if unsafe</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Exit Route Modal */}
      {showExitRoute && exitRoute && (
        <div className="modal-overlay">
          <div className="route-modal">
            <button onClick={() => setShowExitRoute(false)} className="modal-close">
              <X size={18} color="white" />
            </button>

            <div className="route-header">
              <Navigation size={56} style={{ margin: '0 auto 16px' }} />
              <h2 className="route-title">Emergency Exit Route</h2>
              <p className="route-subtitle">Follow this path to reach safety</p>
            </div>

            <div className="route-stats">
              <div className="route-stat">
                <MapPin size={22} style={{ margin: '0 auto 6px' }} />
                <div className="route-stat-value">250m</div>
                <div className="route-stat-label">Distance</div>
              </div>
              <div className="route-stat">
                <Shield size={22} style={{ margin: '0 auto 6px' }} />
                <div className="route-stat-value">3 min</div>
                <div className="route-stat-label">Walking Time</div>
              </div>
            </div>

            <button onClick={handleStartNavigation} className="btn-navigate">
              <Navigation size={20} />
              Start Navigation
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <Shield size={28} color="#fbbf24" />
            <div>
              <h1 className="header-title">Smart Travel Zones</h1>
              <p className="header-subtitle">Real-time safety with intelligent geo-fencing</p>
            </div>
          </div>
          <div className="header-right">
            <div className={`status-badge ${locationPermission ? 'status-active' : 'status-inactive'}`}>
              <MapPin size={16} />
              <span>{locationPermission ? 'Active' : 'Disabled'}</span>
            </div>
            <button onClick={() => setShowSidebar(!showSidebar)} className="menu-btn">
              <Menu size={20} color="white" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Map Section */}
        <div className="map-section">
          {userLocation && (
            <MapContainer center={mapCenter || [userLocation.lat, userLocation.lon]} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapController center={mapCenter} zoom={isNavigating ? 17 : 15} />
              
              <Marker position={[userLocation.lat, userLocation.lon]} icon={userIcon}>
                <Popup>Your Location</Popup>
              </Marker>

              {geoFences.map(fence => {
                const colors = { danger: '#ef4444', tourist: '#22c55e', market: '#f59e0b' };
                
                if (fence.geometry.type === 'Point' && fence.radius) {
                  return (
                    <Circle
                      key={fence.id}
                      center={[fence.geometry.coordinates[1], fence.geometry.coordinates[0]]}
                      radius={fence.radius}
                      pathOptions={{ color: colors[fence.type], fillColor: colors[fence.type], fillOpacity: 0.15, weight: 2 }}
                    >
                      <Popup>
                        <strong>{fence.name}</strong><br />
                        {fence.description}<br />
                        Safety: {fence.safety_score}/100
                      </Popup>
                    </Circle>
                  );
                } else if (fence.geometry.type === 'Polygon') {
                  const coords = fence.geometry.coordinates[0].map(([lon, lat]) => [lat, lon]);
                  return (
                    <Polygon
                      key={fence.id}
                      positions={coords}
                      pathOptions={{ color: colors[fence.type], fillColor: colors[fence.type], fillOpacity: 0.15, weight: 2 }}
                    >
                      <Popup>
                        <strong>{fence.name}</strong><br />
                        {fence.description}<br />
                        Safety: {fence.safety_score}/100
                      </Popup>
                    </Polygon>
                  );
                }
                return null;
              })}

              {isNavigating && exitRoute && (
                <Polyline
                  positions={exitRoute.map(p => [p.lat, p.lon])}
                  pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.8, dashArray: '10, 5' }}
                />
              )}

              {simulationPath.length > 0 && (
                <Polyline
                  positions={simulationPath.slice(0, currentSimStep + 1).map(p => [p.lat, p.lon])}
                  pathOptions={{ color: '#8b5cf6', weight: 3, opacity: 0.6 }}
                />
              )}
            </MapContainer>
          )}

          {/* Quick Stats Overlay */}
          <div className="stats-overlay">
            <div className="stat-card">
              <div className="stat-label">Active Zones</div>
              <div className="stat-value">{geoFences.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Events</div>
              <div className="stat-value">{alerts.length}</div>
            </div>
            <div className="stat-card stat-danger">
              <div className="stat-label">Danger Alerts</div>
              <div className="stat-value">{alerts.filter(a => a.fence_type === 'danger' || a.type === 'sos').length}</div>
            </div>
          </div>

          {/* Quick Actions Overlay */}
          <div className="actions-overlay">
            <button 
              onClick={handleSimulateWalk} 
              disabled={isNavigating}
              className={`action-btn ${isNavigating ? 'action-btn-disabled' : (isSimulating ? 'action-btn-stop' : 'action-btn-simulate')}`}
            >
              {isSimulating ? <Square size={16} /> : <Play size={16} />}
              <span>{isNavigating ? 'Nav Active' : (isSimulating ? 'Stop' : 'Simulate')}</span>
            </button>
            
            <button onClick={handleTestSOS} className="action-btn action-btn-sos">
              <Phone size={16} />
              <span>SOS</span>
            </button>
          </div>
        </div>

        {/* Sidebar - Responsive */}
        <div className={`sidebar ${showSidebar ? 'sidebar-open' : ''}`}>
          {/* Mobile overlay backdrop */}
          {showSidebar && <div className="sidebar-backdrop" onClick={() => setShowSidebar(false)} />}
          
          <div className="sidebar-content">
            {/* Travel Journal */}
            <div className="sidebar-section">
              <div className="section-header">
                <h3 className="section-title">Travel Journal</h3>
                <div className="section-actions">
                  <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
                    <option value="all">All</option>
                    <option value="danger">Danger</option>
                    <option value="entries">Entries</option>
                  </select>
                  <button onClick={() => setShowExportMenu(!showExportMenu)} className="export-btn">
                    <Download size={14} color="white" />
                    {showExportMenu && (
                      <div className="export-menu">
                        <button onClick={exportJournal} className="export-option">Export JSON</button>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              <div className="alerts-container">
                {filteredAlerts.length === 0 ? (
                  <div className="empty-state">
                    <Shield size={40} style={{ margin: '0 auto 10px', opacity: 0.5, color: '#9ca3af' }} />
                    <div className="empty-text">No events yet</div>
                  </div>
                ) : (
                  <div className="alerts-list">
                    {filteredAlerts.map(alert => (
                      <div key={alert.id} className={`alert-item alert-${alert.fence_type || 'default'}`}>
                        <div className="alert-header">
                          <div className="alert-name">{alert.fence_name}</div>
                          <div className="alert-time">{alert.timestamp.toLocaleTimeString()}</div>
                        </div>
                        <div className="alert-message">{alert.message}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Active Shields */}
            <div className="sidebar-section">
              <h3 className="section-title">Active Shields</h3>
              <div className="shields-grid">
                {[
                  { icon: Shield, name: 'Geo-Fencing', status: `${geoFences.length} zones`, active: true },
                  { icon: AlertTriangle, name: 'Danger Alerts', status: 'Armed', active: true },
                  { icon: Users, name: 'Family Link', status: privacySetting === 'only_me' ? 'Off' : 'Active', active: privacySetting !== 'only_me' },
                  { icon: Phone, name: 'Emergency SOS', status: 'Ready', active: true }
                ].map((shield, i) => (
                  <div key={i} className={`shield-item ${shield.active ? 'shield-active' : 'shield-inactive'}`}>
                    <shield.icon size={18} color={shield.active ? '#22c55e' : '#9ca3af'} />
                    <div className="shield-info">
                      <div className="shield-name">{shield.name}</div>
                      <div className="shield-status">{shield.status}</div>
                    </div>
                  </div>
                ))}
              </div>

              {activeZones.size > 0 && (
                <div className="current-zones">
                  <h4 className="zones-title">Current Zones</h4>
                  {Array.from(activeZones).map(zoneId => {
                    const zone = geoFences.find(f => f.id === zoneId);
                    return zone ? (
                      <div key={zoneId} className="zone-item">
                        <div className="zone-name">{zone.name}</div>
                        <div className="zone-safety">Safety: {zone.safety_score}/100</div>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Demo Controls */}
            <div className="sidebar-section">
              <h3 className="section-title">Demo Controls</h3>
              <div className="controls-grid">
                <button 
                  onClick={handleSimulateWalk} 
                  disabled={isNavigating}
                  className={`control-btn ${isNavigating ? 'control-btn-disabled' : (isSimulating ? 'control-btn-stop' : 'control-btn-simulate')}`}
                >
                  {isSimulating ? <Square size={16} /> : <Play size={16} />}
                  <span>{isNavigating ? 'Navigation Active' : (isSimulating ? 'Stop Walk' : 'Simulate Walk')}</span>
                </button>
                
                {isNavigating && (
                  <button 
                    onClick={() => {
                      setIsNavigating(false);
                      setShowSnackbar(false);
                      if (navigationInterval.current) clearInterval(navigationInterval.current);
                    }}
                    className="control-btn control-btn-cancel"
                  >
                    <X size={16} />
                    <span>Stop Navigation</span>
                  </button>
                )}
                
                <button onClick={handleTestSOS} className="control-btn control-btn-sos">
                  <Phone size={16} />
                  <span>Emergency SOS</span>
                </button>
              </div>
              <div className="controls-info">
                <strong>Instructions:</strong> Click "Simulate Walk" to navigate through zones and trigger alerts. {isNavigating && "Navigation is active - simulation disabled."}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .app-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          font-family: system-ui, -apple-system, sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* Snackbar */
        .snackbar {
          position: fixed;
          top: 80px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.95);
          color: white;
          padding: 16px 24px;
          border-radius: 12px;
          z-index: 10000;
          display: flex;
          align-items: center;
          gap: 12px;
          max-width: 90%;
          width: 400px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }

        .snackbar-title {
          font-weight: 600;
          margin-bottom: 4px;
          font-size: 14px;
        }

        .snackbar-text {
          font-size: 12px;
          opacity: 0.8;
          margin-bottom: 2px;
        }

        .progress-bar-bg {
          height: 4px;
          background: rgba(255,255,255,0.2);
          border-radius: 2px;
          overflow: hidden;
          margin-top: 4px;
        }

        .progress-bar-fill {
          height: 100%;
          background: #22c55e;
          transition: width 1s ease;
        }

        .snackbar-close {
          background: rgba(255,255,255,0.2);
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* Modals */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          backdrop-filter: blur(10px);
          padding: 20px;
        }

        .consent-modal, .danger-modal, .route-modal {
          background: linear-gradient(135deg, #1e293b, #334155);
          border-radius: 24px;
          padding: 32px;
          max-width: 500px;
          width: 100%;
          color: white;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          position: relative;
          max-height: 90vh;
          overflow-y: auto;
        }

        .danger-modal {
          background: linear-gradient(135deg, rgba(239,68,68,0.95), rgba(220,38,38,0.95));
        }

        .route-modal {
          background: linear-gradient(135deg, rgba(59,130,246,0.95), rgba(37,99,235,0.95));
        }

        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(255,255,255,0.2);
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .consent-header, .danger-header, .route-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .consent-title, .danger-title, .route-title {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 8px;
        }

        .consent-subtitle, .danger-subtitle, .route-subtitle {
          opacity: 0.9;
          font-size: 14px;
        }

        .privacy-section {
          margin-bottom: 24px;
        }

        .privacy-title {
          font-size: 16px;
          margin-bottom: 16px;
          font-weight: 600;
        }

        .privacy-option {
          padding: 14px;
          background: rgba(255,255,255,0.08);
          border-radius: 12px;
          margin-bottom: 10px;
          cursor: pointer;
          border: 2px solid transparent;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s;
        }

        .privacy-option-selected {
          background: rgba(251,191,36,0.2);
          border-color: #fbbf24;
        }

        .privacy-option-title {
          font-weight: 600;
          font-size: 14px;
        }

        .privacy-option-desc {
          font-size: 12px;
          opacity: 0.8;
        }

        .privacy-radio {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid white;
          background: transparent;
        }

        .privacy-radio-selected {
          background: #fbbf24;
        }

        .consent-buttons {
          display: flex;
          gap: 12px;
        }

        .btn-secondary, .btn-primary {
          flex: 1;
          padding: 12px 20px;
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
        }

        .btn-secondary {
          background: rgba(255,255,255,0.1);
        }

        .btn-primary {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          box-shadow: 0 4px 12px rgba(251,191,36,0.4);
        }

        .danger-icon {
          margin: 0 auto 16px;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }

        .danger-info {
          background: rgba(0,0,0,0.25);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .danger-zone-name {
          font-size: 16px;
          margin-bottom: 6px;
          font-weight: 600;
        }

        .danger-description {
          opacity: 0.9;
          margin-bottom: 10px;
          font-size: 13px;
        }

        .safety-bar {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .safety-bar-bg {
          flex: 1;
          height: 6px;
          background: rgba(255,255,255,0.2);
          border-radius: 3px;
          overflow: hidden;
        }

        .safety-bar-fill {
          height: 100%;
          background: #fbbf24;
        }

        .safety-score {
          font-weight: 600;
          font-size: 14px;
        }

        .danger-actions {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
        }

        .btn-route, .btn-sos {
          flex: 1;
          padding: 12px 16px;
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
        }

        .btn-route {
          background: #3b82f6;
        }

        .btn-sos {
          background: #fbbf24;
          animation: pulse 1.5s infinite;
        }

        .danger-tips {
          font-size: 12px;
          opacity: 0.9;
          line-height: 1.5;
        }

        .danger-tips ul {
          margin: 6px 0;
          padding-left: 18px;
        }

        .route-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }

        .route-stat {
          background: rgba(0,0,0,0.25);
          border-radius: 12px;
          padding: 14px;
          text-align: center;
        }

        .route-stat-value {
          font-size: 20px;
          font-weight: 700;
        }

        .route-stat-label {
          font-size: 12px;
          opacity: 0.8;
        }

        .btn-navigate {
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(251,191,36,0.4);
        }

        /* Header */
        .header {
          padding: 16px 20px;
          background: rgba(0,0,0,0.3);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.1);
          flex-shrink: 0;
        }

        .header-content {
          max-width: 1600px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-title {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          color: white;
        }

        .header-subtitle {
          margin: 0;
          font-size: 12px;
          opacity: 0.8;
          color: white;
        }

        .header-right {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          color: white;
          font-size: 13px;
          font-weight: 600;
        }

        .status-active {
          background: rgba(34,197,94,0.2);
          border: 1px solid rgba(34,197,94,0.4);
        }

        .status-inactive {
          background: rgba(239,68,68,0.2);
          border: 1px solid rgba(239,68,68,0.4);
        }

        .menu-btn {
          display: none;
          padding: 8px;
          background: rgba(255,255,255,0.1);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          align-items: center;
          justify-content: center;
        }

        /* Main Content */
        .main-content {
          flex: 1;
          display: flex;
          overflow: hidden;
          position: relative;
        }

        .map-section {
          flex: 1;
          position: relative;
          min-width: 0;
        }

        .stats-overlay {
          position: absolute;
          top: 16px;
          left: 16px;
          right: 16px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          pointer-events: none;
          z-index: 400;
        }

        .stat-card {
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 10px 16px;
          color: white;
          pointer-events: auto;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .stat-danger {
          background: rgba(239,68,68,0.9);
        }

        .stat-label {
          font-size: 11px;
          opacity: 0.8;
          margin-bottom: 2px;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 700;
        }

        .actions-overlay {
          position: absolute;
          bottom: 16px;
          left: 16px;
          right: 16px;
          display: flex;
          gap: 10px;
          z-index: 400;
        }

        .action-btn {
          flex: 1;
          padding: 12px 20px;
          backdrop-filter: blur(10px);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          font-size: 14px;
        }

        .action-btn-simulate {
          background: rgba(99,102,241,0.95);
        }

        .action-btn-stop {
          background: rgba(239,68,68,0.95);
        }

        .action-btn-sos {
          background: rgba(251,191,36,0.95);
        }

        .action-btn-disabled {
          background: rgba(156,163,175,0.9);
          cursor: not-allowed;
          opacity: 0.6;
        }

        /* Sidebar */
        .sidebar {
          width: 380px;
          background: rgba(15,23,42,0.95);
          backdrop-filter: blur(20px);
          border-left: 1px solid rgba(255,255,255,0.1);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }

        .sidebar-content {
          flex: 1;
        }

        .sidebar-section {
          padding: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 700;
          margin: 0;
          color: white;
        }

        .section-actions {
          display: flex;
          gap: 8px;
        }

        .filter-select {
          padding: 6px 10px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.2);
          font-size: 12px;
          background: rgba(255,255,255,0.1);
          color: white;
          cursor: pointer;
        }

        .export-btn {
          padding: 6px 10px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.1);
          cursor: pointer;
          position: relative;
        }

        .export-menu {
          position: absolute;
          top: 40px;
          right: 0;
          background: #1e293b;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          padding: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 1000;
          min-width: 140px;
        }

        .export-option {
          display: block;
          width: 100%;
          padding: 8px 12px;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          font-size: 13px;
          color: white;
          border-radius: 6px;
          font-weight: 500;
        }

        .export-option:hover {
          background: rgba(255,255,255,0.1);
        }

        .alerts-container {
          max-height: 300px;
          overflow-y: auto;
        }

        .empty-state {
          text-align: center;
          padding: 32px 16px;
          color: #9ca3af;
        }

        .empty-text {
          font-size: 13px;
        }

        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .alert-item {
          padding: 12px;
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
          border-left: 3px solid #6366f1;
        }

        .alert-danger {
          border-left-color: #ef4444;
        }

        .alert-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 4px;
        }

        .alert-name {
          font-weight: 600;
          font-size: 13px;
          color: white;
        }

        .alert-time {
          font-size: 10px;
          color: #9ca3af;
        }

        .alert-message {
          font-size: 12px;
          color: #cbd5e1;
          line-height: 1.4;
        }

        .shields-grid {
          display: grid;
          gap: 10px;
        }

        .shield-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border-radius: 10px;
          border: 1.5px solid;
        }

        .shield-active {
          background: rgba(34,197,94,0.15);
          border-color: rgba(34,197,94,0.3);
        }

        .shield-inactive {
          background: rgba(156,163,175,0.1);
          border-color: rgba(156,163,175,0.2);
        }

        .shield-info {
          flex: 1;
        }

        .shield-name {
          font-weight: 600;
          font-size: 13px;
          color: white;
        }

        .shield-status {
          font-size: 11px;
          color: #9ca3af;
        }

        .current-zones {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .zones-title {
          font-size: 13px;
          font-weight: 600;
          margin: 0 0 10px;
          color: white;
        }

        .zone-item {
          padding: 10px;
          background: rgba(99,102,241,0.15);
          border-radius: 8px;
          margin-bottom: 8px;
          border-left: 3px solid #6366f1;
        }

        .zone-name {
          font-weight: 600;
          font-size: 13px;
          color: white;
        }

        .zone-safety {
          font-size: 11px;
          color: #cbd5e1;
        }

        .controls-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .control-btn {
          padding: 12px 18px;
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          font-size: 14px;
        }

        .control-btn-simulate {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
        }

        .control-btn-stop {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }

        .control-btn-sos {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          box-shadow: 0 4px 12px rgba(251,191,36,0.3);
        }

        .control-btn-disabled {
          background: rgba(156,163,175,0.3);
          cursor: not-allowed;
          opacity: 0.5;
        }

        .control-btn-cancel {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow: 0 4px 12px rgba(239,68,68,0.3);
        }

        .controls-info {
          margin-top: 14px;
          padding: 12px;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          font-size: 11px;
          color: #cbd5e1;
          line-height: 1.5;
          border: 1px solid rgba(255,255,255,0.1);
        }

        /* Scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(99,102,241,0.5) rgba(255,255,255,0.05);
        }

        *::-webkit-scrollbar {
          width: 6px;
        }

        *::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
        }

        *::-webkit-scrollbar-thumb {
          background-color: rgba(99,102,241,0.5);
          border-radius: 3px;
        }

        /* Mobile Responsive */
        @media (max-width: 1024px) {
          .header-subtitle {
            display: none;
          }

          .header-title {
            font-size: 18px;
          }

          .menu-btn {
            display: flex;
          }

          .sidebar {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            max-width: 400px;
            z-index: 9000;
            transform: translateX(100%);
            box-shadow: -4px 0 20px rgba(0,0,0,0.5);
          }

          .sidebar-open {
            transform: translateX(0);
          }

          .sidebar-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.6);
            z-index: 8999;
          }

          .stats-overlay {
            flex-wrap: nowrap;
            overflow-x: auto;
            gap: 8px;
            left: 12px;
            right: 12px;
            top: 12px;
          }

          .stat-card {
            padding: 8px 12px;
            flex-shrink: 0;
          }

          .stat-label {
            font-size: 10px;
          }

          .stat-value {
            font-size: 18px;
          }

          .actions-overlay {
            left: 12px;
            right: 12px;
            bottom: 12px;
            gap: 8px;
          }

          .action-btn {
            padding: 10px 16px;
            font-size: 13px;
          }

          .snackbar {
            top: 70px;
            padding: 14px 20px;
            width: 350px;
          }
        }

        @media (max-width: 640px) {
          .header {
            padding: 12px 16px;
          }

          .header-title {
            font-size: 16px;
          }

          .status-badge {
            padding: 4px 8px;
            font-size: 12px;
          }

          .status-badge span {
            display: none;
          }

          .consent-modal, .danger-modal, .route-modal {
            padding: 24px;
            border-radius: 20px;
          }

          .consent-title, .danger-title, .route-title {
            font-size: 20px;
          }

          .stats-overlay {
            left: 8px;
            right: 8px;
            top: 8px;
            gap: 6px;
          }

          .stat-card {
            padding: 6px 10px;
          }

          .stat-label {
            font-size: 9px;
          }

          .stat-value {
            font-size: 16px;
          }

          .actions-overlay {
            left: 8px;
            right: 8px;
            bottom: 8px;
            flex-direction: column;
          }

          .action-btn {
            padding: 12px;
            font-size: 14px;
          }

          .sidebar {
            max-width: 100%;
          }

          .sidebar-section {
            padding: 16px;
          }

          .section-title {
            font-size: 15px;
          }

          .alerts-container {
            max-height: 250px;
          }

          .snackbar {
            top: 60px;
            padding: 12px 16px;
            width: calc(100% - 32px);
            max-width: none;
          }

          .snackbar-title {
            font-size: 13px;
          }

          .snackbar-text {
            font-size: 11px;
          }
        }

        @media (max-width: 480px) {
          .header-left {
            gap: 8px;
          }

          .header-title {
            font-size: 14px;
          }

          .stats-overlay {
            gap: 4px;
          }

          .stat-card {
            padding: 6px 8px;
          }

          .stat-label {
            font-size: 8px;
          }

          .stat-value {
            font-size: 14px;
          }

          .action-btn {
            padding: 10px;
            font-size: 13px;
          }

          .action-btn svg {
            width: 14px;
            height: 14px;
          }
        }

        /* Landscape Mobile */
        @media (max-width: 1024px) and (max-height: 600px) and (orientation: landscape) {
          .stats-overlay {
            top: 8px;
            left: 8px;
            right: auto;
            flex-direction: column;
            max-height: calc(100vh - 120px);
            overflow-y: auto;
          }

          .actions-overlay {
            flex-direction: row;
            bottom: 8px;
            left: 8px;
            right: 8px;
          }

          .action-btn {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default SmartTravelZones;