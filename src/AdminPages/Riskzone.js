import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Globe, AlertTriangle, Users, Map, Plus, Edit, Trash2, X, Bell, Activity, Shield, Navigation } from 'lucide-react';
import L from 'leaflet';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Realistic Zone Data
const INITIAL_ZONES = [
  {
    id: 'z1',
    name: 'Marina Beach',
    type: 'crowded',
    polygon: [[13.050, 80.282], [13.055, 80.285], [13.053, 80.290], [13.048, 80.287]],
    touristCount: 450,
    lastAlert: '2 mins ago'
  },
  {
    id: 'z2',
    name: 'Old Town Market',
    type: 'danger',
    polygon: [[13.060, 80.270], [13.065, 80.273], [13.063, 80.278], [13.058, 80.275]],
    touristCount: 80,
    lastAlert: '5 mins ago'
  },
  {
    id: 'z3',
    name: 'Temple Complex',
    type: 'safe',
    polygon: [[13.040, 80.265], [13.045, 80.268], [13.043, 80.273], [13.038, 80.270]],
    touristCount: 120,
    lastAlert: 'None'
  },
  {
    id: 'z4',
    name: 'Shopping District',
    type: 'crowded',
    polygon: [[13.070, 80.280], [13.075, 80.283], [13.073, 80.288], [13.068, 80.285]],
    touristCount: 320,
    lastAlert: '1 min ago'
  },
  {
    id: 'z5',
    name: 'Dark Alley Area',
    type: 'danger',
    polygon: [[13.055, 80.260], [13.058, 80.262], [13.056, 80.265], [13.053, 80.263]],
    touristCount: 15,
    lastAlert: 'Just now'
  }
];

const DUMMY_TOURISTS = [
  { id: 't1', name: 'Tourist A', position: [13.052, 80.284] },
  { id: 't2', name: 'Tourist B', position: [13.062, 80.272] },
  { id: 't3', name: 'Tourist C', position: [13.042, 80.267] }
];

const getZoneColor = (type) => {
  const colors = {
    danger: '#ef4444',
    crowded: '#f97316',
    safe: '#10b981'
  };
  return colors[type] || '#6b7280';
};

const getZoneStyle = (type, isHovered) => ({
  fillColor: getZoneColor(type),
  fillOpacity: isHovered ? 0.7 : 0.5,
  color: getZoneColor(type),
  weight: isHovered ? 3 : 2,
  opacity: 0.9
});

// Heatmap simulation component
const HeatmapLayer = ({ zones }) => {
  const map = useMap();
  
  useEffect(() => {
    const heatPoints = zones.flatMap(zone => {
      const centerLat = zone.polygon.reduce((sum, coord) => sum + coord[0], 0) / zone.polygon.length;
      const centerLng = zone.polygon.reduce((sum, coord) => sum + coord[1], 0) / zone.polygon.length;
      const intensity = zone.type === 'danger' ? 1 : zone.type === 'crowded' ? 0.7 : 0.3;
      
      return Array(Math.ceil(zone.touristCount / 20)).fill([centerLat, centerLng, intensity]);
    });

    // Simulate heatmap with circle markers
    return () => {};
  }, [zones, map]);

  return null;
};

const RiskZoneMap = () => {
  const [zones, setZones] = useState(INITIAL_ZONES);
  const [tourists, setTourists] = useState(DUMMY_TOURISTS);
  const [selectedZone, setSelectedZone] = useState(null);
  const [showAddZone, setShowAddZone] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [hoveredZone, setHoveredZone] = useState(null);
  const [stats, setStats] = useState({
    totalTourists: 985,
    dangerAlerts: 12,
    crowdedZones: 2,
    safeZones: 1
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        totalTourists: prev.totalTourists + Math.floor(Math.random() * 10 - 5),
        dangerAlerts: Math.max(0, prev.dangerAlerts + Math.floor(Math.random() * 3 - 1)),
        crowdedZones: zones.filter(z => z.type === 'crowded').length,
        safeZones: zones.filter(z => z.type === 'safe').length
      }));

      // Simulate tourist movement
      setTourists(prev => prev.map(t => ({
        ...t,
        position: [
          t.position[0] + (Math.random() - 0.5) * 0.001,
          t.position[1] + (Math.random() - 0.5) * 0.001
        ]
      })));

      // Check for danger zone alerts
      tourists.forEach(tourist => {
        zones.forEach(zone => {
          if (zone.type === 'danger') {
            const centerLat = zone.polygon.reduce((sum, coord) => sum + coord[0], 0) / zone.polygon.length;
            const centerLng = zone.polygon.reduce((sum, coord) => sum + coord[1], 0) / zone.polygon.length;
            const distance = Math.sqrt(
              Math.pow(tourist.position[0] - centerLat, 2) + 
              Math.pow(tourist.position[1] - centerLng, 2)
            );
            
            if (distance < 0.005 && Math.random() > 0.95) {
              addAlert(`${tourist.name} entered ${zone.name}!`, 'danger');
            }
          }
        });
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [tourists, zones]);

  const addAlert = (message, type) => {
    const newAlert = {
      id: Date.now(),
      message,
      type,
      time: new Date().toLocaleTimeString()
    };
    setAlerts(prev => [newAlert, ...prev].slice(0, 5));
    
    // Console log for demo
    console.log(`🚨 ALERT: ${message}`);
    console.log(`📧 Email sent to admin@tourism.gov.in`);
    console.log(`📱 SMS sent to +91-XXXX-XXXX`);
  };

  const deleteZone = (id) => {
    setZones(zones.filter(z => z.id !== id));
    setSelectedZone(null);
  };

  const updateZoneType = (id, newType) => {
    setZones(zones.map(z => z.id === id ? { ...z, type: newType } : z));
  };

  // Chart data
  const zoneDistribution = [
    { name: 'Safe', value: zones.filter(z => z.type === 'safe').length, color: '#10b981' },
    { name: 'Crowded', value: zones.filter(z => z.type === 'crowded').length, color: '#f97316' },
    { name: 'Danger', value: zones.filter(z => z.type === 'danger').length, color: '#ef4444' }
  ];

  const topRiskyZones = zones
    .filter(z => z.type !== 'safe')
    .sort((a, b) => b.touristCount - a.touristCount)
    .slice(0, 5);

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      color: 'black',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Sidebar */}
      <div style={{
        width: '380px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        overflowY: 'auto',
        boxShadow: '2px 0 20px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.40), rgba(0,0,0,0.55))', 
          // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Shield size={32} />
            <div>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Tourist Safety</h1>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <StatCard icon={<Users size={20} />} label="Total Tourists" value={stats.totalTourists} color="#667eea" />
          <StatCard icon={<AlertTriangle size={20} />} label="Danger Alerts" value={stats.dangerAlerts} color="#ef4444" />
          <StatCard icon={<Activity size={20} />} label="Crowded Zones" value={stats.crowdedZones} color="#f97316" />
          <StatCard icon={<Shield size={20} />} label="Safe Zones" value={stats.safeZones} color="#10b981" />
        </div>

        {/* Live Alerts */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Bell size={18} color="#ef4444" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Live Alerts</h3>
          </div>
          <div style={{ 
            background: '#fff', 
            borderRadius: '12px', 
            padding: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {alerts.length === 0 ? (
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>
                No recent alerts
              </p>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} style={{
                  padding: '10px',
                  marginBottom: '8px',
                  background: alert.type === 'danger' ? '#fef2f2' : '#fefce8',
                  borderRadius: '8px',
                  borderLeft: `3px solid ${alert.type === 'danger' ? '#ef4444' : '#f97316'}`
                }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                    {alert.message}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>{alert.time}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Zone Distribution Chart */}
        <div style={{ padding: '0 20px 20px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>Zone Distribution</h3>
          <div style={{ 
            background: '#fff', 
            borderRadius: '12px', 
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={zoneDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {zoneDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '12px' }}>
              {zoneDistribution.map(item => (
                <div key={item.name} style={{ textAlign: 'center' }}>
                  <div style={{ width: '12px', height: '12px', background: item.color, borderRadius: '50%', margin: '0 auto 4px' }}></div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>{item.name}</div>
                  <div style={{ fontSize: '16px', fontWeight: '700' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Risky Zones */}
        <div style={{ padding: '0 20px 20px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>Top Risky Zones</h3>
          <div style={{ 
            background: '#fff', 
            borderRadius: '12px', 
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            {topRiskyZones.map((zone, idx) => (
              <div key={zone.id} style={{
                padding: '12px 16px',
                borderBottom: idx < topRiskyZones.length - 1 ? '1px solid #f3f4f6' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>{zone.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    <span style={{ 
                      color: getZoneColor(zone.type),
                      fontWeight: '600'
                    }}>
                      {zone.type.toUpperCase()}
                    </span> • {zone.lastAlert}
                  </div>
                </div>
                <div style={{
                  background: getZoneColor(zone.type),
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {zone.touristCount}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zone Management */}
        <div style={{ padding: '0 20px 20px' }}>
          <button
            onClick={() => setShowAddZone(!showAddZone)}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
          >
            <Plus size={18} />
            Add New Zone
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Map */}
        <MapContainer 
          center={[13.055, 80.275]} 
          zoom={14} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          <HeatmapLayer zones={zones} />

          {/* Zone Polygons */}
          {zones.map(zone => (
            <Polygon
              key={zone.id}
              positions={zone.polygon}
              pathOptions={getZoneStyle(zone.type, hoveredZone === zone.id)}
              eventHandlers={{
                click: () => setSelectedZone(zone),
                mouseover: () => setHoveredZone(zone.id),
                mouseout: () => setHoveredZone(null)
              }}
            >
              <Popup>
                <div style={{ minWidth: '150px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>{zone.name}</h4>
                  <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                    Type: <span style={{ 
                      color: getZoneColor(zone.type),
                      fontWeight: '600'
                    }}>{zone.type.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                    Tourists: {zone.touristCount}
                  </div>
                  <div style={{ fontSize: '12px' }}>
                    Last Alert: {zone.lastAlert}
                  </div>
                </div>
              </Popup>
            </Polygon>
          ))}

          {/* Heatmap circles for visual effect */}
          {zones.map(zone => {
            const centerLat = zone.polygon.reduce((sum, coord) => sum + coord[0], 0) / zone.polygon.length;
            const centerLng = zone.polygon.reduce((sum, coord) => sum + coord[1], 0) / zone.polygon.length;
            const radius = zone.type === 'danger' ? 80 : zone.type === 'crowded' ? 60 : 40;
            
            return (
              <CircleMarker
                key={`heat-${zone.id}`}
                center={[centerLat, centerLng]}
                radius={radius}
                pathOptions={{
                  fillColor: getZoneColor(zone.type),
                  color: 'transparent',
                  fillOpacity: 0.2
                }}
              />
            );
          })}

          {/* Tourist Markers */}
          {tourists.map(tourist => (
            <Marker key={tourist.id} position={tourist.position}>
              <Popup>
                <div style={{ fontSize: '12px' }}>
                  <strong>{tourist.name}</strong>
                  <div>Status: Active</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating Badge */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '12px 20px',
          borderRadius: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontSize: '13px',
          fontWeight: '600',
          color: '#667eea',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 1000
        }}>
          <Activity size={16} />
          Live Mode • SIH 2025
        </div>

        {/* Zone Editor Panel */}
        {selectedZone && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '20px',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            width: '300px',
            zIndex: 1000
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700' }}>
                  {selectedZone.name}
                </h3>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  ID: {selectedZone.id}
                </div>
              </div>
              <button
                onClick={() => setSelectedZone(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#6b7280'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                Zone Type
              </label>
              <select
                value={selectedZone.type}
                onChange={(e) => updateZoneType(selectedZone.id, e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '13px'
                }}
              >
                <option value="safe">Safe</option>
                <option value="crowded">Crowded</option>
                <option value="danger">Danger</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Edit size={14} />
                Edit
              </button>
              <button
                onClick={() => deleteZone(selectedZone.id)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    background: '#fff',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    position: 'relative',
    overflow: 'hidden'
  }}>
    <div style={{
      position: 'absolute',
      top: '-10px',
      right: '-10px',
      width: '60px',
      height: '60px',
      background: color,
      opacity: 0.1,
      borderRadius: '50%'
    }}></div>
    <div style={{ color, marginBottom: '8px' }}>
      {icon}
    </div>
    <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
      {value}
    </div>
    <div style={{ fontSize: '12px', color: '#6b7280' }}>
      {label}
    </div>
  </div>
);

export default RiskZoneMap;