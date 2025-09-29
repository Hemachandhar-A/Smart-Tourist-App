/*
 * INSTALLATION REQUIRED:
 * npm install react-leaflet leaflet
 * 
 * Add to your HTML head or import in your main CSS:
 * <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
 */

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// HARDCODED DATASET - EXACT IMPLEMENTATION AS SPECIFIED
const INITIAL_ZONES = [
  {
    "id": "zone-1",
    "name": "Central Market",
    "polygon": [[28.617,77.200],[28.621,77.202],[28.620,77.210],[28.616,77.208]],
    "numCrimes": 45,
    "remedialCoveragePct": 40,
    "crowdDensity": 0.7,
    "weatherSeverity": 0.2
  },
  {
    "id": "zone-2",
    "name": "Harbor Road",
    "polygon": [[28.605,77.220],[28.608,77.223],[28.606,77.230],[28.603,77.227]],
    "numCrimes": 5,
    "remedialCoveragePct": 85,
    "crowdDensity": 0.15,
    "weatherSeverity": 0.05
  },
  {
    "id": "zone-3",
    "name": "Old Town",
    "polygon": [[28.630,77.190],[28.634,77.193],[28.632,77.200],[28.628,77.197]],
    "numCrimes": 22,
    "remedialCoveragePct": 60,
    "crowdDensity": 0.45,
    "weatherSeverity": 0.5
  },
  {
    "id": "zone-4",
    "name": "Hill Park",
    "polygon": [[28.640,77.210],[28.643,77.213],[28.641,77.220],[28.638,77.217]],
    "numCrimes": 12,
    "remedialCoveragePct": 70,
    "crowdDensity": 0.25,
    "weatherSeverity": 0.1
  }
];

// Geo-fence danger zone
const DANGER_GEOFENCE = {
  polygon: [[28.618,77.205],[28.622,77.207],[28.621,77.212],[28.617,77.210]],
  name: "High Crime Alert Zone"
};

// Tourist movement path
const TOURIST_PATH = [
  [28.615, 77.205],
  [28.617, 77.206],
  [28.619, 77.207], // This point triggers geo-fence alert
  [28.621, 77.208],
  [28.623, 77.209]
];

// Escape route waypoints
const ESCAPE_ROUTE = [
  [28.619, 77.207], // From alert point
  [28.622, 77.204], // Safe waypoint
  [28.625, 77.202]  // Police station
];

// FUZZY SYSTEM IMPLEMENTATION - EXACT RULES AS SPECIFIED
const fuzzyEvaluation = (zone) => {
  // Input mapping
  const crimeLevel = zone.numCrimes <= 5 ? 'Low' : zone.numCrimes <= 20 ? 'Medium' : 'High';
  const remedialLevel = zone.remedialCoveragePct <= 40 ? 'Poor' : zone.remedialCoveragePct <= 70 ? 'Moderate' : 'Good';
  const crowdLevel = zone.crowdDensity <= 0.33 ? 'Low' : zone.crowdDensity <= 0.66 ? 'Medium' : 'High';
  const weatherLevel = zone.weatherSeverity <= 0.33 ? 'Clear' : zone.weatherSeverity <= 0.66 ? 'Moderate' : 'Severe';

  let riskTier = 'Low';
  let rulesFired = [];

  // EXACT FUZZY RULES AS SPECIFIED
  if (crimeLevel === 'High' && remedialLevel === 'Poor') {
    riskTier = 'VeryHigh';
    rulesFired.push('Rule 1: High crimes + Poor remedial → VeryHigh');
  } else if (crimeLevel === 'Medium' && remedialLevel === 'Moderate' && crowdLevel === 'High') {
    riskTier = 'High';
    rulesFired.push('Rule 2: Medium crimes + Moderate remedial + High crowd → High');
  } else if (crimeLevel === 'Low' && remedialLevel === 'Good') {
    riskTier = 'Low';
    rulesFired.push('Rule 3: Low crimes + Good remedial → Low');
  } else {
    riskTier = 'Medium';
    rulesFired.push('Default: Medium risk');
  }

  // Weather and crowd escalation
  if (weatherLevel === 'Severe' && crowdLevel === 'High') {
    const tierMap = { 'Low': 'Medium', 'Medium': 'High', 'High': 'VeryHigh', 'VeryHigh': 'VeryHigh' };
    riskTier = tierMap[riskTier];
    rulesFired.push('Weather + Crowd escalation: +1 tier');
  }

  // Remedial coverage reduction
  if (zone.remedialCoveragePct >= 60) {
    const tierMap = { 'VeryHigh': 'High', 'High': 'Medium', 'Medium': 'Low', 'Low': 'Low' };
    riskTier = tierMap[riskTier];
    rulesFired.push('Good remedial coverage: -1 tier');
  }

  // Distress override
  if (zone.numCrimes > 30) {
    riskTier = 'VeryHigh';
    rulesFired.push('OVERRIDE: Crime spike > 30 → VeryHigh');
  }

  // SCORING/DEFUZZIFICATION AS SPECIFIED
  const tierScores = { 'Low': 20, 'Medium': 50, 'High': 75, 'VeryHigh': 95 };
  let riskScore = tierScores[riskTier];
  
  // Continuous adjustments
  riskScore = riskScore + (zone.crowdDensity * 10) + (zone.weatherSeverity * 8) - ((zone.remedialCoveragePct - 50) / 5);
  riskScore = Math.max(0, Math.min(100, riskScore));

  return {
    score: Math.round(riskScore),
    tier: riskTier,
    rulesFired,
    breakdown: { crimeLevel, remedialLevel, crowdLevel, weatherLevel }
  };
};

// COLOR MAPPING AS SPECIFIED
const getZoneColor = (score) => {
  if (score <= 30) return '#2ECC71'; // Green
  if (score <= 55) return '#F1C40F'; // Yellow
  if (score <= 75) return '#E67E22'; // Orange
  return '#E74C3C'; // Red
};

const RiskZoneMap = () => {
  const [zones, setZones] = useState(INITIAL_ZONES);
  const [predictiveLayerOn, setPredictiveLayerOn] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [touristPosition, setTouristPosition] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [showEscapeRoute, setShowEscapeRoute] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [resolvedZones, setResolvedZones] = useState(new Set());
  const [watchedZones, setWatchedZones] = useState(new Set());
  
  const intervalRef = useRef(null);

  // Auto-play tourist movement
  useEffect(() => {
    if (autoPlay) {
      intervalRef.current = setInterval(() => {
        setTouristPosition(prev => {
          const next = (prev + 1) % TOURIST_PATH.length;
          
          // Check geo-fence intersection at position 2
          if (next === 2 && !showAlert) {
            setShowAlert(true);
            setShowEscapeRoute(true);
            setTimeout(() => setShowAlert(false), 5000);
          }
          
          return next;
        });
      }, 2000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoPlay, showAlert]);

  // Refresh data function
  const refreshData = () => {
    setZones(zones.map(zone => ({
      ...zone,
      numCrimes: Math.max(0, zone.numCrimes + Math.floor((Math.random() - 0.5) * 10)),
      remedialCoveragePct: Math.max(0, Math.min(100, zone.remedialCoveragePct + Math.floor((Math.random() - 0.5) * 20))),
      crowdDensity: Math.max(0, Math.min(1, zone.crowdDensity + (Math.random() - 0.5) * 0.3)),
      weatherSeverity: Math.max(0, Math.min(1, zone.weatherSeverity + (Math.random() - 0.5) * 0.3))
    })));
  };

  const handleZoneClick = (zone) => {
    setSelectedZone(zone);
    setShowPanel(true);
  };

  const resolveZone = (zoneId) => {
    setResolvedZones(prev => new Set([...prev, zoneId]));
  };

  const markWatched = (zoneId) => {
    setWatchedZones(prev => new Set([...prev, zoneId]));
  };

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative', fontFamily: 'Arial, sans-serif' }}>
      {/* Demo Badge */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(231, 76, 60, 0.9)',
        color: 'white',
        padding: '5px 15px',
        borderRadius: '15px',
        fontSize: '12px',
        zIndex: 1000,
        fontWeight: 'bold'
      }}>
        Demo Mode — Simulated Data
      </div>

      {/* Header */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(44, 62, 80, 0.95)',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '8px',
        zIndex: 1000,
        minWidth: '350px'
      }}>
        <h2 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>
          🔴 Predictive Risk Heatmap & Zone Manager
        </h2>
        <p style={{ margin: '0', fontSize: '12px', opacity: '0.8' }}>
          Dynamic safety scoring, geo-fences, and escape routing — simulated for demo
        </p>
      </div>

      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: '120px',
        left: '10px',
        background: 'rgba(52, 73, 94, 0.95)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        zIndex: 1000,
        width: '280px'
      }}>
        <div style={{ marginBottom: '15px' }}>
          <button 
            onClick={refreshData}
            style={{
              background: '#3498db',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            🔄 Refresh Data
          </button>
          <button 
            onClick={() => setAutoPlay(!autoPlay)}
            style={{
              background: autoPlay ? '#e74c3c' : '#27ae60',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {autoPlay ? '⏸️ Pause' : '▶️ Auto-Play'}
          </button>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
            <input 
              type="checkbox" 
              checked={predictiveLayerOn}
              onChange={(e) => setPredictiveLayerOn(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Predictive Layer
          </label>
        </div>

        {/* Legend */}
        <div>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Risk Level Legend:</h4>
          <div style={{ fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ width: '20px', height: '15px', background: '#2ECC71', marginRight: '8px', borderRadius: '2px' }}></div>
              Safe (0-30)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ width: '20px', height: '15px', background: '#F1C40F', marginRight: '8px', borderRadius: '2px' }}></div>
              Caution (31-55)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ width: '20px', height: '15px', background: '#E67E22', marginRight: '8px', borderRadius: '2px' }}></div>
              Risky (56-75)
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '20px', height: '15px', background: '#E74C3C', marginRight: '8px', borderRadius: '2px' }}></div>
              High Risk (76-100)
            </div>
          </div>
        </div>
      </div>

      {/* Alert Toast */}
      {showAlert && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(231, 76, 60, 0.95)',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          zIndex: 2000,
          maxWidth: '400px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>⚠️ Auto-Alert</h3>
          <p style={{ margin: '0 0 15px 0' }}>
            Approaching high-risk zone — Suggested escape route ready
          </p>
          <div style={{ fontSize: '14px', textAlign: 'left' }}>
            <strong>Escape Route:</strong>
            <br />• Walk north 200m
            <br />• Turn right onto Market Lane  
            <br />• Reach Police Booth
          </div>
        </div>
      )}

      {/* Map */}
      <MapContainer 
        center={[28.620, 77.205]} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Zone Polygons */}
        {zones.map(zone => {
          const evaluation = fuzzyEvaluation(zone);
          const color = getZoneColor(evaluation.score);
          const isResolved = resolvedZones.has(zone.id);
          const isWatched = watchedZones.has(zone.id);
          
          return (
            <Polygon
              key={zone.id}
              positions={zone.polygon}
              pathOptions={{
                fillColor: isResolved ? '#95a5a6' : color,
                weight: isWatched ? 4 : 2,
                color: isWatched ? '#3498db' : '#2c3e50',
                opacity: 1,
                fillOpacity: predictiveLayerOn ? 0.6 : 0.3
              }}
              eventHandlers={{
                click: () => handleZoneClick(zone)
              }}
            >
              <Popup>
                <div>
                  <strong>{zone.name}</strong><br />
                  Risk Score: {evaluation.score}<br />
                  Risk Level: {evaluation.tier}<br />
                  <small>Click zone for details</small>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* Heatmap simulation with circles */}
        {predictiveLayerOn && zones.map(zone => {
          const centerLat = zone.polygon.reduce((sum, coord) => sum + coord[0], 0) / zone.polygon.length;
          const centerLng = zone.polygon.reduce((sum, coord) => sum + coord[1], 0) / zone.polygon.length;
          
          return (
            <CircleMarker
              key={`heat-${zone.id}`}
              center={[centerLat, centerLng]}
              radius={Math.max(5, zone.numCrimes * 0.8)}
              pathOptions={{
                fillColor: '#e74c3c',
                color: 'transparent',
                fillOpacity: Math.min(0.4, zone.crowdDensity * 0.6)
              }}
            />
          );
        })}

        {/* Danger Geo-fence */}
        <Polygon
          positions={DANGER_GEOFENCE.polygon}
          pathOptions={{
            fillColor: 'transparent',
            weight: 3,
            color: showAlert ? '#ffffff' : '#e74c3c',
            opacity: showAlert ? 1 : 0.8,
            dashArray: '10, 10',
            fillOpacity: 0
          }}
        />

        {/* Tourist Position */}
        <Marker position={TOURIST_PATH[touristPosition]}>
          <Popup>
            <div>
              <strong>📍 Tourist Location</strong><br />
              Position: {touristPosition + 1} of {TOURIST_PATH.length}
            </div>
          </Popup>
        </Marker>

        {/* Escape Route */}
        {showEscapeRoute && (
          <Polyline
            positions={ESCAPE_ROUTE}
            pathOptions={{
              color: '#27ae60',
              weight: 4,
              opacity: 0.8,
              dashArray: '5, 10'
            }}
          />
        )}

        {/* Incident Icons */}
        <CircleMarker
          center={[28.618, 77.208]}
          radius={8}
          pathOptions={{ color: '#e74c3c', fillColor: '#e74c3c', fillOpacity: 1 }}
        >
          <Popup>
            <div>
              <strong>🔺 High Crime Cluster</strong><br />
              Recent incidents reported
            </div>
          </Popup>
        </CircleMarker>

        <CircleMarker
          center={[28.625, 77.202]}
          radius={8}
          pathOptions={{ color: '#3498db', fillColor: '#3498db', fillOpacity: 1 }}
        >
          <Popup>
            <div>
              <strong>💎 Police Station</strong><br />
              Emergency response center
            </div>
          </Popup>
        </CircleMarker>

        <CircleMarker
          center={[28.632, 77.195]}
          radius={8}
          pathOptions={{ color: '#95a5a6', fillColor: '#95a5a6', fillOpacity: 1 }}
        >
          <Popup>
            <div>
              <strong>☁️ Weather Alert</strong><br />
              Severe weather reported
            </div>
          </Popup>
        </CircleMarker>
      </MapContainer>

      {/* Zone Detail Panel */}
      {showPanel && selectedZone && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          bottom: '10px',
          width: '350px',
          background: 'rgba(44, 62, 80, 0.95)',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          zIndex: 1000,
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>{selectedZone.name}</h3>
            <button 
              onClick={() => setShowPanel(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>

          {(() => {
            const evaluation = fuzzyEvaluation(selectedZone);
            return (
              <div>
                <div style={{ 
                  background: getZoneColor(evaluation.score),
                  padding: '10px',
                  borderRadius: '4px',
                  marginBottom: '15px',
                  textAlign: 'center'
                }}>
                  <strong>Risk Score: {evaluation.score}</strong><br />
                  <small>{evaluation.tier} Risk Level</small>
                </div>

                <div style={{ marginBottom: '15px', fontSize: '14px' }}>
                  <h4>Zone Metrics:</h4>
                  <div>• Crimes: {selectedZone.numCrimes}</div>
                  <div>• Remedial Coverage: {selectedZone.remedialCoveragePct}%</div>
                  <div>• Crowd Density: {Math.round(selectedZone.crowdDensity * 100)}%</div>
                  <div>• Weather Severity: {Math.round(selectedZone.weatherSeverity * 100)}%</div>
                </div>

                <div style={{ marginBottom: '15px', fontSize: '14px' }}>
                  <h4>Fuzzy Analysis:</h4>
                  <div style={{ fontSize: '12px' }}>
                    {evaluation.breakdown.crimeLevel} crimes, {evaluation.breakdown.remedialLevel} remedial, {evaluation.breakdown.crowdLevel} crowd, {evaluation.breakdown.weatherLevel} weather
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '12px' }}>
                    <strong>Rules Fired:</strong>
                    {evaluation.rulesFired.map((rule, idx) => (
                      <div key={idx}>• {rule}</div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => resolveZone(selectedZone.id)}
                    disabled={resolvedZones.has(selectedZone.id)}
                    style={{
                      background: resolvedZones.has(selectedZone.id) ? '#95a5a6' : '#27ae60',
                      border: 'none',
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      cursor: resolvedZones.has(selectedZone.id) ? 'not-allowed' : 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    {resolvedZones.has(selectedZone.id) ? '✓ Resolved' : 'Resolve'}
                  </button>
                  <button 
                    onClick={() => markWatched(selectedZone.id)}
                    disabled={watchedZones.has(selectedZone.id)}
                    style={{
                      background: watchedZones.has(selectedZone.id) ? '#95a5a6' : '#3498db',
                      border: 'none',
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      cursor: watchedZones.has(selectedZone.id) ? 'not-allowed' : 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    {watchedZones.has(selectedZone.id) ? '👁️ Watched' : 'Mark Watched'}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default RiskZoneMap;