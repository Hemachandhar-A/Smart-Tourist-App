import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, Polyline, useMap } from 'react-leaflet';
import { AlertTriangle, Shield, Users, MapPin, Navigation, Phone, X, Eye, Lock, Play, Square, Download, Filter, Settings, Target } from 'lucide-react';
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
  
  const watchId = useRef(null);
  const simulationInterval = useRef(null);
  const dwellTimers = useRef(new Map());
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
    // Don't check intersections during navigation to prevent conflicts
    if (isNavigating) return;
    
    const currentZones = new Set();
    
    geoFences.forEach(fence => {
      const isInside = checkPointInFence(lat, lon, fence);
      const wasInside = activeZones.has(fence.id);
      
      if (isInside) {
        currentZones.add(fence.id);
        // Only alert if not already alerted and not currently in a danger modal
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
    // Don't process exits during navigation to avoid conflicts
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
      // Don't set isNavigating to false here - let navigation complete naturally
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
    
    // Create more realistic waypoints
    const waypoints = [];
    const numWaypoints = 8;
    
    for (let i = 0; i <= numWaypoints; i++) {
      const ratio = i / numWaypoints;
      const distance = 0.004 * ratio; // Gradual exit
      
      // Add slight curve for realism
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
    const R = 6371e3; // Earth radius in meters
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
    
    // Only check fence intersections if not currently navigating
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
    
    // Don't start simulation if navigation is active
    if (isNavigating) return;
    
    const path = generateRoadBasedPath(userLocation.lat, userLocation.lon);
    setSimulationPath(path);
    setCurrentSimStep(0);
    setIsSimulating(true);
    
    let step = 0;
    simulationInterval.current = setInterval(() => {
      // Stop if navigation starts
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
    
    // Stop simulation if running to avoid conflicts
    if (isSimulating && simulationInterval.current) {
      clearInterval(simulationInterval.current);
      setIsSimulating(false);
    }
    
    // Convert modal to snackbar
    setSnackbarMessage(`🚨 Navigating out of ${dangerZone?.name || 'danger zone'}`);
    setShowSnackbar(true);
    
    // Start animated navigation
    if (exitRoute && exitRoute.length > 0) {
      let step = 0;
      const totalSteps = exitRoute.length - 1;
      
      navigationInterval.current = setInterval(() => {
        if (step >= totalSteps) {
          clearInterval(navigationInterval.current);
          setIsNavigating(false);
          setSnackbarMessage('✅ You have reached safety!');
          setTimeout(() => setShowSnackbar(false), 3000);
          return;
        }
        
        const currentPoint = exitRoute[step];
        
        // Update user location directly without triggering fence checks during navigation
        setUserLocation({ lat: currentPoint.lat, lon: currentPoint.lon });
        setMapCenter([currentPoint.lat, currentPoint.lon]);
        
        // Calculate remaining distance
        const remaining = calculateDistance(
          currentPoint.lat, currentPoint.lon,
          exitRoute[totalSteps].lat, exitRoute[totalSteps].lon
        );
        setDistanceRemaining(Math.round(remaining));
        
        // Update instruction
        if (currentPoint.instruction) {
          setCurrentInstruction(currentPoint.instruction);
          if (navigator.vibrate && step > 0) navigator.vibrate(100);
        }
        
        setNavigationProgress((step / totalSteps) * 100);
        step++;
      }, 1500); // Slower movement for smoother navigation
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
    <div style={{ minHeight: '100vh', background: 'transparent', fontFamily: 'system-ui, sans-serif' }}>
      {/* Snackbar for navigation progress */}
      {showSnackbar && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: 'rgba(0,0,0,0.9)', color: 'white', padding: '12px 20px', borderRadius: 8, zIndex: 10000, display: 'flex', alignItems: 'center', gap: 12, maxWidth: 400 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{snackbarMessage}</div>
            {isNavigating && (
              <div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{currentInstruction}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Remaining: {distanceRemaining}m</div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${navigationProgress}%`, height: '100%', background: '#22c55e', transition: 'width 1s ease' }} />
                </div>
              </div>
            )}
          </div>
          <button onClick={() => setShowSnackbar(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={14} color="white" />
          </button>
        </div>
      )}

      {showConsent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(10px)' }}>
          <div style={{ background: 'transparent', borderRadius: 24, padding: 40, maxWidth: 500, width: '90%', color: 'white', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
              <Shield size={64} style={{ margin: '0 auto 20px', color: '#fbbf24' }} />
              <h2 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 10px' }}>Smart Travel Zones</h2>
              <p style={{ opacity: 0.9, fontSize: 16 }}>Enable location-based safety features</p>
            </div>

            <div style={{ marginBottom: 30 }}>
              <h3 style={{ fontSize: 20, marginBottom: 20 }}>Choose Privacy Level</h3>
              {[
                { id: 'only_me', icon: Eye, title: 'Only Me', desc: 'Full privacy, local storage' },
                { id: 'family', icon: Users, title: 'Family', desc: 'Share with family in emergencies' },
                { id: 'authorities', icon: Lock, title: 'Authorities', desc: 'Full emergency services access' }
              ].map(opt => (
                <div key={opt.id} onClick={() => setSelectedPrivacy(opt.id)} style={{ padding: 16, background: selectedPrivacy === opt.id ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.1)', borderRadius: 12, marginBottom: 12, cursor: 'pointer', border: selectedPrivacy === opt.id ? '2px solid #fbbf24' : '2px solid transparent', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <opt.icon size={24} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{opt.title}</div>
                    <div style={{ fontSize: 14, opacity: 0.8 }}>{opt.desc}</div>
                  </div>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid white', background: selectedPrivacy === opt.id ? '#fbbf24' : 'transparent' }} />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowConsent(false)} style={{ flex: 1, padding: '14px 20px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 12, color: 'white', fontWeight: 600, cursor: 'pointer' }}>Skip</button>
              <button onClick={() => requestLocationPermission(selectedPrivacy)} style={{ flex: 1, padding: '14px 20px', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', border: 'none', borderRadius: 12, color: 'white', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(251,191,36,0.4)' }}>Enable Safety</button>
            </div>
          </div>
        </div>
      )}

      {showDangerModal && dangerZone && !showExitRoute && !isNavigating && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(10px)' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.95), rgba(220,38,38,0.95))', borderRadius: 24, padding: 40, maxWidth: 500, width: '90%', color: 'white', boxShadow: '0 20px 60px rgba(239,68,68,0.5)', position: 'relative' }}>
            <button onClick={() => setShowDangerModal(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={20} color="white" />
            </button>

            <div style={{ textAlign: 'center', marginBottom: 30 }}>
              <AlertTriangle size={64} style={{ margin: '0 auto 20px', animation: 'pulse 1.5s infinite' }} />
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 10px' }}>DANGER ZONE ALERT</h2>
              <p style={{ opacity: 0.9 }}>You have entered a restricted area</p>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, marginBottom: 8 }}>{dangerZone.name}</h3>
              <p style={{ opacity: 0.9, marginBottom: 12 }}>{dangerZone.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${dangerZone.safety_score}%`, height: '100%', background: '#fbbf24' }} />
                </div>
                <span style={{ fontWeight: 600 }}>{dangerZone.safety_score}/100</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <button onClick={() => setShowExitRoute(true)} style={{ flex: 1, padding: '14px 20px', background: '#3b82f6', border: 'none', borderRadius: 12, color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Navigation size={20} />
                Exit Route
              </button>
              <button onClick={handleTestSOS} style={{ flex: 1, padding: '14px 20px', background: '#fbbf24', border: 'none', borderRadius: 12, color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, animation: 'pulse 1.5s infinite' }}>
                <Phone size={20} />
                Emergency SOS
              </button>
            </div>

            <div style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.6 }}>
              <strong>Safety Tips:</strong>
              <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                <li>Follow exit route immediately</li>
                <li>Stay alert and move quickly</li>
                <li>Contact authorities if unsafe</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {showExitRoute && exitRoute && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(10px)' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.95), rgba(37,99,235,0.95))', borderRadius: 24, padding: 40, maxWidth: 500, width: '90%', color: 'white', boxShadow: '0 20px 60px rgba(59,130,246,0.5)', position: 'relative' }}>
            <button onClick={() => setShowExitRoute(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={20} color="white" />
            </button>

            <div style={{ textAlign: 'center', marginBottom: 30 }}>
              <Navigation size={64} style={{ margin: '0 auto 20px' }} />
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 10px' }}>Emergency Exit Route</h2>
              <p style={{ opacity: 0.9 }}>Follow this path to reach safety</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <MapPin size={24} style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: 24, fontWeight: 700 }}>250m</div>
                <div style={{ fontSize: 14, opacity: 0.8 }}>Distance</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <Shield size={24} style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: 24, fontWeight: 700 }}>3 min</div>
                <div style={{ fontSize: 14, opacity: 0.8 }}>Walking Time</div>
              </div>
            </div>

            <button onClick={handleStartNavigation} style={{ width: '100%', padding: '16px 24px', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', border: 'none', borderRadius: 12, color: 'white', fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(251,191,36,0.4)' }}>
              <Navigation size={20} />
              Start Navigation
            </button>
          </div>
        </div>
      )}

      <div style={{ padding: '20px 40px', background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Shield size={36} />
              Smart Travel Zones
            </h1>
            <p style={{ margin: '8px 0 0', opacity: 0.9, color: 'white' }}>Real-time safety with intelligent geo-fencing</p>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ padding: '8px 16px', background: locationPermission ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, color: 'white' }}>
              <MapPin size={18} />
              <span style={{ fontSize: 14 }}>{locationPermission ? 'Active' : 'Disabled'}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, padding: 24, maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 16, overflow: 'hidden', height: 600, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
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
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px', color: '#1f2937' }}>Demo Controls</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button 
                onClick={handleSimulateWalk} 
                disabled={isNavigating}
                style={{ 
                  padding: '14px 20px', 
                  background: isNavigating ? '#9ca3af' : (isSimulating ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #6366f1, #4f46e5)'), 
                  border: 'none', 
                  borderRadius: 12, 
                  color: 'white', 
                  fontWeight: 600, 
                  cursor: isNavigating ? 'not-allowed' : 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 8, 
                  boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                  opacity: isNavigating ? 0.5 : 1
                }}
              >
                {isSimulating ? <Square size={18} /> : <Play size={18} />}
                {isNavigating ? 'Navigation Active' : (isSimulating ? 'Stop' : 'Simulate Walk')}
              </button>
              
              {isNavigating && (
                <button 
                  onClick={() => {
                    setIsNavigating(false);
                    setShowSnackbar(false);
                    if (navigationInterval.current) clearInterval(navigationInterval.current);
                  }}
                  style={{ 
                    padding: '14px 20px', 
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
                    border: 'none', 
                    borderRadius: 12, 
                    color: 'white', 
                    fontWeight: 600, 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: 8, 
                    boxShadow: '0 4px 12px rgba(239,68,68,0.3)'
                  }}
                >
                  <X size={18} />
                  Stop Navigation
                </button>
              )}
              
              <button 
                onClick={handleTestSOS} 
                style={{ 
                  padding: '14px 20px', 
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', 
                  border: 'none', 
                  borderRadius: 12, 
                  color: 'white', 
                  fontWeight: 600, 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 8, 
                  boxShadow: '0 4px 12px rgba(251,191,36,0.3)' 
                }}
              >
                <Phone size={18} />
                Emergency SOS
              </button>
            </div>
            <div style={{ marginTop: 16, padding: 12, background: '#f3f4f6', borderRadius: 8, fontSize: 12, color: '#4b5563', lineHeight: 1.6 }}>
              <strong>Instructions:</strong> Click "Simulate Walk" to automatically navigate through zones and trigger realistic alerts based on road patterns. {isNavigating && "Navigation is currently active - simulation is disabled."}
            </div>
          </div>


          <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxHeight: 400, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1f2937' }}>Travel Journal</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 12, background: 'white', color: '#1f2937' }}>
                  <option value="all">All</option>
                  <option value="danger">Danger</option>
                  <option value="entries">Entries</option>
                </select>
                <button onClick={() => setShowExportMenu(!showExportMenu)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>
                  <Download size={16} color="#1f2937" />
                </button>
                {showExportMenu && (
                  <div style={{ position: 'absolute', marginTop: 35, right: 24, background: 'white', border: '1px solid #d1d5db', borderRadius: 8, padding: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 1000 }}>
                    <button onClick={exportJournal} style={{ display: 'block', width: '100%', padding: '8px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 14, color: '#1f2937', borderRadius: 6 }}>Export JSON</button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredAlerts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
                  <Shield size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <div style={{ fontSize: 14 }}>No events yet</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {filteredAlerts.map(alert => (
                    <div key={alert.id} style={{ padding: 12, background: '#f9fafb', borderRadius: 10, borderLeft: `4px solid ${alert.type === 'sos' ? '#ef4444' : alert.fence_type === 'danger' ? '#ef4444' : '#6366f1'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 4 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937' }}>{alert.fence_name}</div>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>{alert.timestamp.toLocaleTimeString()}</div>
                      </div>
                      <div style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.4 }}>{alert.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#6366f1' }}>{alerts.length}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Events</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#6366f1' }}>{alerts.filter(a => a.type === 'entry').length}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Entries</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#ef4444' }}>{alerts.filter(a => a.fence_type === 'danger' || a.type === 'sos').length}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Alerts</div>
              </div>
            </div>
          </div>


          <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px', color: '#1f2937' }}>Active Shields</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              {[
                { icon: Shield, name: 'Geo-Fencing', status: `${geoFences.length} zones`, active: true },
                { icon: AlertTriangle, name: 'Danger Alerts', status: 'Armed', active: true },
                { icon: Users, name: 'Family Link', status: privacySetting === 'only_me' ? 'Off' : 'Active', active: privacySetting !== 'only_me' },
                { icon: Phone, name: 'Emergency SOS', status: 'Ready', active: true }
              ].map((shield, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: shield.active ? 'rgba(34,197,94,0.1)' : 'rgba(156,163,175,0.1)', borderRadius: 10, border: `2px solid ${shield.active ? '#22c55e' : '#9ca3af'}` }}>
                  <shield.icon size={20} color={shield.active ? '#22c55e' : '#9ca3af'} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937' }}>{shield.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{shield.status}</div>
                  </div>
                </div>
              ))}
            </div>

            {activeZones.size > 0 && (
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #e5e7eb' }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px', color: '#1f2937' }}>Current Zones</h4>
                {Array.from(activeZones).map(zoneId => {
                  const zone = geoFences.find(f => f.id === zoneId);
                  return zone ? (
                    <div key={zoneId} style={{ padding: 10, background: 'rgba(99,102,241,0.1)', borderRadius: 8, marginBottom: 8, borderLeft: '4px solid #6366f1' }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937' }}>{zone.name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>Safety: {zone.safety_score}/100</div>
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>       
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        
        .leaflet-container {
          font-family: system-ui, sans-serif;
        }
        
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(99,102,241,0.3) transparent;
        }
        
        *::-webkit-scrollbar {
          width: 6px;
        }
        
        *::-webkit-scrollbar-track {
          background: transparent;
        }
        
        *::-webkit-scrollbar-thumb {
          background-color: rgba(99,102,241,0.3);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default SmartTravelZones;