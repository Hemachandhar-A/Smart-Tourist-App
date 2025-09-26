import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Users, MapPin, Clock, TrendingUp, AlertTriangle, User, Navigation } from 'lucide-react';
import L from 'leaflet';

// Custom tourist icons
const createTouristIcon = (type, isMoving = true) => new L.Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${type === 'family' ? '#10b981' : type === 'solo' ? '#3b82f6' : type === 'group' ? '#f59e0b' : '#ef4444'}" stroke="white" stroke-width="2">
      <circle cx="12" cy="8" r="5"/>
      <path d="M20 21a8 8 0 1 0-16 0"/>
      ${isMoving ? '<circle cx="18" cy="6" r="3" fill="#22c55e"/>' : ''}
    </svg>
  `)}`,
  iconSize: isMoving ? [28, 28] : [24, 24],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

// Hardcoded tourist data for Chennai with realistic locations
const generateTouristData = () => [
  // Marina Beach area cluster
  { id: 'TST-001', name: 'John Smith', type: 'family', lat: 13.0490, lng: 80.2825, status: 'moving', lastUpdate: new Date(), speed: 3.2, destination: 'Marina Beach' },
  { id: 'TST-002', name: 'Sarah Johnson', type: 'solo', lat: 13.0485, lng: 80.2820, status: 'stationary', lastUpdate: new Date(Date.now() - 300000), speed: 0, destination: 'Marina Beach Walk' },
  { id: 'TST-003', name: 'Chen Wei', type: 'group', lat: 13.0495, lng: 80.2830, status: 'moving', lastUpdate: new Date(), speed: 2.8, destination: 'Lighthouse' },
  { id: 'TST-004', name: 'Raj Patel', type: 'family', lat: 13.0488, lng: 80.2815, status: 'moving', lastUpdate: new Date(), speed: 1.5, destination: 'Beach Restaurant' },
  
  // T. Nagar shopping area cluster
  { id: 'TST-005', name: 'Emma Wilson', type: 'solo', lat: 13.0418, lng: 80.2341, status: 'stationary', lastUpdate: new Date(Date.now() - 900000), speed: 0, destination: 'Pondy Bazaar' },
  { id: 'TST-006', name: 'Kumar Family', type: 'family', lat: 13.0422, lng: 80.2338, status: 'moving', lastUpdate: new Date(), speed: 2.1, destination: 'Express Avenue Mall' },
  { id: 'TST-007', name: 'Lisa Chen', type: 'group', lat: 13.0425, lng: 80.2345, status: 'moving', lastUpdate: new Date(), speed: 1.8, destination: 'Ranganathan Street' },
  
  // Mylapore temple area cluster
  { id: 'TST-008', name: 'David Miller', type: 'solo', lat: 13.0339, lng: 80.2619, status: 'stationary', lastUpdate: new Date(Date.now() - 1200000), speed: 0, destination: 'Kapaleeshwarar Temple' },
  { id: 'TST-009', name: 'Rodriguez Family', type: 'family', lat: 13.0342, lng: 80.2615, status: 'moving', lastUpdate: new Date(), speed: 1.2, destination: 'Temple Complex' },
  { id: 'TST-010', name: 'Ahmed Group', type: 'group', lat: 13.0345, lng: 80.2622, status: 'moving', lastUpdate: new Date(), speed: 2.5, destination: 'San Thome Cathedral' },
  
  // Fort St. George area
  { id: 'TST-011', name: 'Michael Brown', type: 'solo', lat: 13.0835, lng: 80.2792, status: 'moving', lastUpdate: new Date(), speed: 2.3, destination: 'Fort Museum' },
  { id: 'TST-012', name: 'Singh Family', type: 'family', lat: 13.0838, lng: 80.2795, status: 'stationary', lastUpdate: new Date(Date.now() - 600000), speed: 0, destination: 'Government Museum' },
  
  // Besant Nagar (Elliot's Beach)
  { id: 'TST-013', name: 'Anna Kowalski', type: 'solo', lat: 12.9985, lng: 80.2669, status: 'moving', lastUpdate: new Date(), speed: 3.8, destination: 'Elliot\'s Beach' },
  { id: 'TST-014', name: 'Taylor Group', type: 'group', lat: 12.9988, lng: 80.2665, status: 'moving', lastUpdate: new Date(), speed: 2.7, destination: 'Cafe Mocha' },
  { id: 'TST-015', name: 'Kim Min-jun', type: 'family', lat: 12.9982, lng: 80.2672, status: 'stationary', lastUpdate: new Date(Date.now() - 450000), speed: 0, destination: 'Beach Resort' },
  
  // Scattered individual tourists
  { id: 'TST-016', name: 'Gabriel Santos', type: 'solo', lat: 13.0729, lng: 80.2396, status: 'moving', lastUpdate: new Date(), speed: 4.1, destination: 'Central Station' },
  { id: 'TST-017', name: 'Nakamura Family', type: 'family', lat: 13.0124, lng: 80.2201, status: 'moving', lastUpdate: new Date(), speed: 2.9, destination: 'Phoenix MarketCity' },
  { id: 'TST-018', name: 'Sophie Dubois', type: 'solo', lat: 13.0569, lng: 80.2091, status: 'alert', lastUpdate: new Date(Date.now() - 1800000), speed: 0, destination: 'Unknown' },
  { id: 'TST-019', name: 'Thompson Group', type: 'group', lat: 13.0876, lng: 80.2065, status: 'moving', lastUpdate: new Date(), speed: 3.5, destination: 'IIT Madras' },
  { id: 'TST-020', name: 'María García', type: 'family', lat: 13.0291, lng: 80.2085, status: 'moving', lastUpdate: new Date(), speed: 1.9, destination: 'Guindy National Park' }
];

const LiveTouristMap = () => {
  const [tourists, setTourists] = useState(generateTouristData());
  const [selectedTourist, setSelectedTourist] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [clusters, setClusters] = useState([]);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'clusters', 'alerts'

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTourists(prevTourists => {
        const updatedTourists = prevTourists.map(tourist => {
          if (tourist.status === 'moving') {
            // Simulate movement with small random changes
            const latChange = (Math.random() - 0.5) * 0.0005;
            const lngChange = (Math.random() - 0.5) * 0.0005;
            const speedChange = (Math.random() - 0.5) * 0.5;
            
            return {
              ...tourist,
              lat: tourist.lat + latChange,
              lng: tourist.lng + lngChange,
              speed: Math.max(0.5, Math.min(5.0, tourist.speed + speedChange)),
              lastUpdate: new Date()
            };
          }
          return tourist;
        });
        
        // Calculate clusters
        const newClusters = calculateClusters(updatedTourists);
        setClusters(newClusters);
        setLastUpdate(new Date());
        
        return updatedTourists;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const calculateClusters = (touristList) => {
    const clusterThreshold = 0.01; // ~1km radius
    const foundClusters = [];
    const processed = new Set();

    touristList.forEach(tourist => {
      if (processed.has(tourist.id)) return;
      
      const nearbyTourists = touristList.filter(other => {
        const distance = Math.sqrt(
          Math.pow(tourist.lat - other.lat, 2) + Math.pow(tourist.lng - other.lng, 2)
        );
        return distance <= clusterThreshold && !processed.has(other.id);
      });

      if (nearbyTourists.length >= 3) {
        nearbyTourists.forEach(t => processed.add(t.id));
        foundClusters.push({
          id: `cluster-${foundClusters.length}`,
          center: {
            lat: nearbyTourists.reduce((sum, t) => sum + t.lat, 0) / nearbyTourists.length,
            lng: nearbyTourists.reduce((sum, t) => sum + t.lng, 0) / nearbyTourists.length
          },
          tourists: nearbyTourists,
          count: nearbyTourists.length,
          density: nearbyTourists.length > 5 ? 'high' : 'medium'
        });
      }
    });

    return foundClusters;
  };

  const getStatusColor = (status, lastUpdate) => {
    const timeSinceUpdate = Date.now() - new Date(lastUpdate).getTime();
    if (status === 'alert' || timeSinceUpdate > 1800000) return '#ef4444'; // Red for alerts or 30min+ inactive
    if (status === 'stationary' || timeSinceUpdate > 600000) return '#f59e0b'; // Yellow for stationary or 10min+ inactive
    return '#10b981'; // Green for active/moving
  };

  const getFilteredTourists = () => {
    switch (viewMode) {
      case 'alerts':
        return tourists.filter(t => t.status === 'alert' || (Date.now() - new Date(t.lastUpdate).getTime()) > 1800000);
      case 'clusters':
        return tourists.filter(t => clusters.some(cluster => cluster.tourists.some(ct => ct.id === t.id)));
      default:
        return tourists;
    }
  };

  return (
    <div className="live-tourist-map">
      <div className="map-header">
        <div className="header-title">
          <Users className="header-icon" />
          <div>
            <h2>Live Tourist Tracking - Chennai</h2>
            <p>Real-time location monitoring and cluster analysis</p>
          </div>
        </div>
        
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">{tourists.length}</span>
            <span className="stat-label">Active Tourists</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{clusters.length}</span>
            <span className="stat-label">Hot Clusters</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{tourists.filter(t => t.status === 'alert' || (Date.now() - new Date(t.lastUpdate).getTime()) > 1800000).length}</span>
            <span className="stat-label">Alerts</span>
          </div>
        </div>
      </div>

      <div className="map-controls">
        <div className="view-toggles">
          <button 
            className={`toggle-btn ${viewMode === 'all' ? 'active' : ''}`}
            onClick={() => setViewMode('all')}
          >
            All Tourists
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'clusters' ? 'active' : ''}`}
            onClick={() => setViewMode('clusters')}
          >
            Clusters Only
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'alerts' ? 'active' : ''}`}
            onClick={() => setViewMode('alerts')}
          >
            Alerts Only
          </button>
        </div>
        
        <div className="legend">
          <div className="legend-item">
            <div className="legend-dot" style={{ background: '#10b981' }}></div>
            <span>Active/Moving</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: '#f59e0b' }}></div>
            <span>Stationary</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: '#ef4444' }}></div>
            <span>Alert/Inactive</span>
          </div>
        </div>
        
        <div className="last-update">
          <Clock size={16} />
          <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="map-container">
        <MapContainer 
          center={[13.0569, 80.2091]} // Chennai center
          zoom={12} 
          style={{ height: '600px', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Render cluster circles */}
          {viewMode !== 'alerts' && clusters.map(cluster => (
            <Circle
              key={cluster.id}
              center={[cluster.center.lat, cluster.center.lng]}
              radius={cluster.density === 'high' ? 800 : 500}
              fillColor={cluster.density === 'high' ? '#ef4444' : '#f59e0b'}
              fillOpacity={0.2}
              color={cluster.density === 'high' ? '#ef4444' : '#f59e0b'}
              weight={2}
            >
              <Popup>
                <div className="cluster-popup">
                  <h3>Tourist Cluster</h3>
                  <p><strong>Density:</strong> {cluster.density}</p>
                  <p><strong>Tourist Count:</strong> {cluster.count}</p>
                  <p><strong>Area:</strong> {cluster.density === 'high' ? '800m' : '500m'} radius</p>
                  <div className="cluster-tourists">
                    {cluster.tourists.slice(0, 3).map(tourist => (
                      <div key={tourist.id} className="cluster-tourist-item">
                        <User size={12} />
                        <span>{tourist.name}</span>
                      </div>
                    ))}
                    {cluster.tourists.length > 3 && (
                      <p><em>+{cluster.tourists.length - 3} more tourists</em></p>
                    )}
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}
          
          {/* Render individual tourists */}
          {getFilteredTourists().map(tourist => {
            const timeSinceUpdate = Date.now() - new Date(tourist.lastUpdate).getTime();
            const isMoving = tourist.status === 'moving' && timeSinceUpdate < 300000;
            
            return (
              <Marker 
                key={tourist.id}
                position={[tourist.lat, tourist.lng]}
                icon={createTouristIcon(tourist.type, isMoving)}
                eventHandlers={{
                  click: () => setSelectedTourist(tourist)
                }}
              >
                <Popup>
                  <div className="tourist-popup">
                    <h3>{tourist.name}</h3>
                    <div className="popup-detail">
                      <MapPin size={14} />
                      <span>ID: {tourist.id}</span>
                    </div>
                    <div className="popup-detail">
                      <Users size={14} />
                      <span>Type: {tourist.type}</span>
                    </div>
                    <div className="popup-detail">
                      <Navigation size={14} />
                      <span>Destination: {tourist.destination}</span>
                    </div>
                    <div className="popup-detail">
                      <TrendingUp size={14} />
                      <span>Speed: {tourist.speed.toFixed(1)} km/h</span>
                    </div>
                    <div className="popup-detail" style={{ color: getStatusColor(tourist.status, tourist.lastUpdate) }}>
                      <AlertTriangle size={14} />
                      <span>Status: {tourist.status.toUpperCase()}</span>
                    </div>
                    <div className="popup-detail">
                      <Clock size={14} />
                      <span>Last Update: {new Date(tourist.lastUpdate).toLocaleTimeString()}</span>
                    </div>
                    <div className="popup-location">
                      <strong>Coordinates:</strong><br/>
                      {tourist.lat.toFixed(6)}, {tourist.lng.toFixed(6)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Tourist Details Panel */}
      {selectedTourist && (
        <div className="tourist-details-panel">
          <div className="panel-header">
            <h3>{selectedTourist.name}</h3>
            <button 
              className="close-panel"
              onClick={() => setSelectedTourist(null)}
            >
              ×
            </button>
          </div>
          <div className="panel-content">
            <div className="detail-row">
              <span className="detail-label">Tourist ID:</span>
              <span className="detail-value">{selectedTourist.id}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Type:</span>
              <span className="detail-value">{selectedTourist.type}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Current Status:</span>
              <span 
                className="detail-value status-badge"
                style={{ color: getStatusColor(selectedTourist.status, selectedTourist.lastUpdate) }}
              >
                {selectedTourist.status.toUpperCase()}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Speed:</span>
              <span className="detail-value">{selectedTourist.speed.toFixed(1)} km/h</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Destination:</span>
              <span className="detail-value">{selectedTourist.destination}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Last Update:</span>
              <span className="detail-value">{new Date(selectedTourist.lastUpdate).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .live-tourist-map {
          padding: 2rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin: 2rem;
          position: relative;
        }

        .map-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-icon {
          width: 48px;
          height: 48px;
          color: #ff416c;
          background: rgba(255, 65, 108, 0.2);
          padding: 0.75rem;
          border-radius: 12px;
        }

        .header-title h2 {
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }

        .header-title p {
          color: rgba(255, 255, 255, 0.7);
          margin: 0.25rem 0 0 0;
          font-size: 0.9rem;
        }

        .header-stats {
          display: flex;
          gap: 2rem;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(255, 255, 255, 0.1);
          padding: 1rem;
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: #ff416c;
        }

        .stat-label {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.8);
          margin-top: 0.25rem;
        }

        .map-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .view-toggles {
          display: flex;
          gap: 0.5rem;
        }

        .toggle-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.8);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .toggle-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .toggle-btn.active {
          background: linear-gradient(135deg, #ff416c, #ff4b2b);
          color: white;
          border-color: transparent;
        }

        .legend {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.85rem;
        }

        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .last-update {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.85rem;
        }

        .map-container {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }

        .tourist-popup, .cluster-popup {
          color: #1f2937;
          min-width: 200px;
        }

        .tourist-popup h3, .cluster-popup h3 {
          margin: 0 0 0.75rem 0;
          font-size: 1.1rem;
          color: #ff416c;
        }

        .popup-detail {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
        }

        .popup-location {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e5e7eb;
          font-size: 0.8rem;
        }

        .cluster-tourists {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e5e7eb;
        }

        .cluster-tourist-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          margin-bottom: 0.25rem;
        }

        .tourist-details-panel {
          position: absolute;
          top: 100px;
          right: 20px;
          width: 300px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(20px);
          z-index: 1000;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .panel-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.1rem;
        }

        .close-panel {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #6b7280;
          cursor: pointer;
          padding: 0.25rem;
          line-height: 1;
        }

        .close-panel:hover {
          color: #ef4444;
        }

        .panel-content {
          padding: 1rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          font-size: 0.9rem;
        }

        .detail-label {
          color: #6b7280;
          font-weight: 500;
        }

        .detail-value {
          color: #1f2937;
          font-weight: 600;
        }

        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.1);
          font-size: 0.75rem !important;
          font-weight: 700 !important;
        }

        @media (max-width: 768px) {
          .live-tourist-map {
            margin: 1rem;
            padding: 1rem;
          }

          .map-header {
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
          }

          .header-stats {
            gap: 1rem;
          }

          .map-controls {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .legend {
            flex-wrap: wrap;
            gap: 1rem;
          }

          .tourist-details-panel {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 350px;
          }
        }
      `}</style>
    </div>
  );
};

// Export the LiveTouristMap component
export { LiveTouristMap };