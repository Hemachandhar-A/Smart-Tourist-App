import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom user location icon
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOCIgZmlsbD0iIzAwN0FGRiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIzIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjMiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

// Map controller component to handle center updates
const MapController = ({ userLocation }) => {
  const map = useMap();
  
  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lon], map.getZoom());
    }
  }, [userLocation, map]);
  
  return null;
};

const GeoMapLeaflet = ({ 
  userLocation, 
  geoFences, 
  exitRoute, 
  simulationPath, 
  currentSimStep, 
  crowdSpike 
}) => {
  const mapRef = useRef();

  // Color scheme for different fence types
  const getFenceColor = (type) => {
    switch (type) {
      case 'danger': return { color: '#FF3B30', fillColor: '#FF3B30', fillOpacity: 0.2 };
      case 'tourist': return { color: '#22C55E', fillColor: '#22C55E', fillOpacity: 0.2 };
      case 'market': return { color: '#F59E0B', fillColor: '#F59E0B', fillOpacity: 0.2 };
      case 'event': return { color: '#8B5CF6', fillColor: '#8B5CF6', fillOpacity: 0.2 };
      default: return { color: '#6B7280', fillColor: '#6B7280', fillOpacity: 0.2 };
    }
  };

  // Get fence icon
  const getFenceIcon = (type) => {
    switch (type) {
      case 'danger': return '⚠️';
      case 'tourist': return '🏛️';
      case 'market': return '🛒';
      case 'event': return '🎭';
      default: return '📍';
    }
  };

  const defaultCenter = userLocation ? [userLocation.lat, userLocation.lon] : [28.6139, 77.2090];

  return (
    <div className="geo-map-container">
      <MapContainer
        center={defaultCenter}
        zoom={16}
        className="geo-map"
        ref={mapRef}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController userLocation={userLocation} />
        
        {/* User location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lon]} icon={userIcon}>
            <Popup>
              <div className="user-popup">
                <h3>Your Location</h3>
                <p>Lat: {userLocation.lat.toFixed(6)}</p>
                <p>Lon: {userLocation.lon.toFixed(6)}</p>
                <p className="location-status">🟢 Location Active</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Geo-fences */}
        {geoFences.map(fence => {
          const colors = getFenceColor(fence.type);
          
          if (fence.geometry.geometry.type === 'Point' && fence.radius) {
            // Circle fence
            const [lon, lat] = fence.geometry.geometry.coordinates;
            return (
              <Circle
                key={fence.id}
                center={[lat, lon]}
                radius={fence.radius}
                pathOptions={colors}
              >
                <Popup>
                  <div className="fence-popup">
                    <h3>{getFenceIcon(fence.type)} {fence.name}</h3>
                    <p><strong>Type:</strong> {fence.type}</p>
                    <p><strong>Safety Score:</strong> {fence.safety_score}/100</p>
                    <p>{fence.description}</p>
                    {fence.audio_guide_url && (
                      <button className="audio-guide-btn">
                        🎧 Start Audio Guide
                      </button>
                    )}
                  </div>
                </Popup>
              </Circle>
            );
          } else if (fence.geometry.geometry.type === 'Polygon') {
            // Polygon fence
            const coordinates = fence.geometry.geometry.coordinates[0].map(([lon, lat]) => [lat, lon]);
            return (
              <Polygon
                key={fence.id}
                positions={coordinates}
                pathOptions={colors}
              >
                <Popup>
                  <div className="fence-popup">
                    <h3>{getFenceIcon(fence.type)} {fence.name}</h3>
                    <p><strong>Type:</strong> {fence.type}</p>
                    <p><strong>Safety Score:</strong> {fence.safety_score}/100</p>
                    <p>{fence.description}</p>
                    {fence.audio_guide_url && (
                      <button className="audio-guide-btn">
                        🎧 Start Audio Guide
                      </button>
                    )}
                  </div>
                </Popup>
              </Polygon>
            );
          }
          return null;
        })}
        
        {/* Exit route */}
        {exitRoute && (
          <Polyline
            positions={exitRoute.map(point => [point.lat, point.lon])}
            pathOptions={{
              color: '#FF3B30',
              weight: 4,
              opacity: 0.8,
              dashArray: '10, 5'
            }}
          >
            <Popup>
              <div className="route-popup">
                <h3>🚨 Emergency Exit Route</h3>
                <p>Follow the red dashed line to exit the danger zone safely</p>
              </div>
            </Popup>
          </Polyline>
        )}
        
        {/* Simulation path */}
        {simulationPath.length > 0 && (
          <Polyline
            positions={simulationPath.slice(0, currentSimStep + 1).map(point => [point.lat, point.lon])}
            pathOptions={{
              color: '#007AFF',
              weight: 3,
              opacity: 0.7
            }}
          />
        )}
        
        {/* Crowd spike overlay */}
        {crowdSpike && geoFences.find(f => f.id === crowdSpike.fence_id) && (
          (() => {
            const fence = geoFences.find(f => f.id === crowdSpike.fence_id);
            if (fence.geometry.geometry.type === 'Point' && fence.radius) {
              const [lon, lat] = fence.geometry.geometry.coordinates;
              return (
                <Circle
                  key={`crowd-${fence.id}`}
                  center={[lat, lon]}
                  radius={fence.radius}
                  pathOptions={{
                    color: '#FF6B6B',
                    fillColor: '#FF6B6B',
                    fillOpacity: 0.4,
                    weight: 3,
                    dashArray: '5, 5'
                  }}
                >
                  <Popup>
                    <div className="crowd-popup">
                      <h3>🚶‍♂️ High Crowd Density</h3>
                      <p>Elevated crowd levels detected in {fence.name}</p>
                      <p>Consider taking alternate routes</p>
                    </div>
                  </Popup>
                </Circle>
              );
            }
            return null;
          })()
        )}
      </MapContainer>
      
      <div className="map-legend">
        <h4>Zone Types</h4>
        <div className="legend-item">
          <div className="legend-color danger"></div>
          <span>⚠️ Danger/Restricted</span>
        </div>
        <div className="legend-item">
          <div className="legend-color tourist"></div>
          <span>🏛️ Tourist/Heritage</span>
        </div>
        <div className="legend-item">
          <div className="legend-color market"></div>
          <span>🛒 Market/Commercial</span>
        </div>
        <div className="legend-item">
          <div className="legend-color event"></div>
          <span>🎭 Event/Festival</span>
        </div>
      </div>
    </div>
  );
};

export default GeoMapLeaflet;