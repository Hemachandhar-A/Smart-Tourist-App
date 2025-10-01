import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Play, Pause, Download, MapPin, Users, Clock, TrendingUp, Filter, Layers } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Dummy Data Generator
const generateGaussianSample = (mean, stdDev) => {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdDev;
};

const ATTRACTIONS = [
  'Heritage Fort', 'Royal Palace', 'City Museum', 'Botanical Garden',
  'Ancient Temple', 'Art Gallery', 'Historic Monument', 'Cultural Center',
  'Scenic Viewpoint', 'Traditional Market'
];

const NATIONALITIES = [
  { code: 'IN', weight: 65 }, { code: 'US', weight: 8 }, { code: 'UK', weight: 6 },
  { code: 'DE', weight: 5 }, { code: 'FR', weight: 4 }, { code: 'AU', weight: 3 },
  { code: 'JP', weight: 3 }, { code: 'CN', weight: 3 }, { code: 'CA', weight: 2 }, { code: 'IT', weight: 1 }
];

const AGE_RANGES = ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'];

const generateDummyData = (adminLocation, count = 5000, seed = 42) => {
  let rng = seed;
  const seededRandom = () => {
    rng = (rng * 9301 + 49297) % 233280;
    return rng / 233280;
  };

  const hotspots = [
    { lat: adminLocation.lat, lng: adminLocation.lng, sigma: 0.008, weight: 0.3 },
    { lat: adminLocation.lat + 0.015, lng: adminLocation.lng + 0.01, sigma: 0.006, weight: 0.25 },
    { lat: adminLocation.lat - 0.01, lng: adminLocation.lng + 0.015, sigma: 0.007, weight: 0.2 },
    { lat: adminLocation.lat + 0.005, lng: adminLocation.lng - 0.012, sigma: 0.005, weight: 0.15 },
    { lat: adminLocation.lat - 0.018, lng: adminLocation.lng - 0.008, sigma: 0.009, weight: 0.1 }
  ];

  const startDate = new Date('2025-09-20T06:00:00Z');
  const endDate = new Date('2025-09-30T22:00:00Z');
  const timeRange = endDate - startDate;

  const pickWeighted = (items) => {
    const total = items.reduce((sum, item) => sum + (item.weight || 1), 0);
    let rand = seededRandom() * total;
    for (const item of items) {
      rand -= (item.weight || 1);
      if (rand <= 0) return item;
    }
    return items[items.length - 1];
  };

  const data = [];
  for (let i = 0; i < count; i++) {
    const hotspot = pickWeighted(hotspots);
    const u1 = seededRandom();
    const u2 = seededRandom();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
    
    const lat = hotspot.lat + z0 * hotspot.sigma;
    const lng = hotspot.lng + z1 * hotspot.sigma;
    
    const timestamp = new Date(startDate.getTime() + seededRandom() * timeRange);
    const groupSizeRand = seededRandom();
    const groupSize = groupSizeRand < 0.4 ? 1 : groupSizeRand < 0.7 ? 2 : groupSizeRand < 0.85 ? 3 : Math.floor(seededRandom() * 4) + 4;
    
    data.push({
      id: `visitor-${i}`,
      lat,
      lng,
      timestamp: timestamp.toISOString(),
      attraction: ATTRACTIONS[Math.floor(seededRandom() * ATTRACTIONS.length)],
      nationality: pickWeighted(NATIONALITIES).code,
      groupSize,
      dwellTimeMinutes: Math.floor(10 + seededRandom() * 230),
      ageRange: AGE_RANGES[Math.floor(seededRandom() * AGE_RANGES.length)]
    });
  }

  return data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};

// Heatmap Layer Component
const HeatmapLayer = ({ data, timeWindow }) => {
  const map = useMap();
  const heatLayerRef = useRef(null);

  useEffect(() => {
    if (!window.L.heatLayer) {
      // Simple heatmap implementation
      window.L.heatLayer = function(latlngs, options) {
        const layer = L.layerGroup();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        layer.onAdd = function(map) {
          const pane = map.getPanes().overlayPane;
          pane.appendChild(canvas);
          canvas.style.position = 'absolute';
          canvas.style.pointerEvents = 'none';
          
          const update = () => {
            const size = map.getSize();
            canvas.width = size.x;
            canvas.height = size.y;
            canvas.style.width = size.x + 'px';
            canvas.style.height = size.y + 'px';
            
            const bounds = map.getBounds();
            canvas.style.left = '0px';
            canvas.style.top = '0px';
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            latlngs.forEach(point => {
              const pos = map.latLngToContainerPoint([point[0], point[1]]);
              const intensity = point[2] || 1;
              
              const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 30);
              gradient.addColorStop(0, `rgba(220, 30, 50, ${0.4 * intensity})`);
              gradient.addColorStop(0.5, `rgba(255, 200, 80, ${0.2 * intensity})`);
              gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
              
              ctx.fillStyle = gradient;
              ctx.fillRect(pos.x - 30, pos.y - 30, 60, 60);
            });
          };
          
          map.on('moveend', update);
          map.on('zoomend', update);
          update();
        };
        
        layer.onRemove = function(map) {
          map.off('moveend');
          map.off('zoomend');
          if (canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
          }
        };
        
        return layer;
      };
    }

    const filteredData = data.filter(d => {
      const time = new Date(d.timestamp);
      return time >= timeWindow.start && time <= timeWindow.end;
    });

    const heatData = filteredData.map(d => [d.lat, d.lng, 1]);

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    heatLayerRef.current = window.L.heatLayer(heatData, { radius: 25, blur: 15 });
    heatLayerRef.current.addTo(map);

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [data, timeWindow, map]);

  return null;
};

// Main Dashboard Component
const TouristAnalyticsDashboard = () => {
  const adminLocation = { lat: 28.6139, lng: 77.2090, name: 'New Delhi' };
  const [allData] = useState(() => generateDummyData(adminLocation, 5000, 42));
  const [timeWindow, setTimeWindow] = useState(() => {
    const start = new Date(allData[0].timestamp);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return { start, end };
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [filters, setFilters] = useState({
    nationality: 'all',
    attraction: 'all',
    groupSize: 'all'
  });
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date(allData[0].timestamp));

  const filteredData = useMemo(() => {
    return allData.filter(d => {
      const time = new Date(d.timestamp);
      if (time < timeWindow.start || time > timeWindow.end) return false;
      if (filters.nationality !== 'all' && d.nationality !== filters.nationality) return false;
      if (filters.attraction !== 'all' && d.attraction !== filters.attraction) return false;
      if (filters.groupSize !== 'all') {
        const size = parseInt(filters.groupSize);
        if (size === 1 && d.groupSize !== 1) return false;
        if (size === 2 && (d.groupSize < 2 || d.groupSize > 3)) return false;
        if (size === 4 && d.groupSize < 4) return false;
      }
      return true;
    });
  }, [allData, timeWindow, filters]);

  const visibleMarkers = useMemo(() => {
    return filteredData.filter(d => new Date(d.timestamp) <= currentTime).slice(-100);
  }, [filteredData, currentTime]);

  const metrics = useMemo(() => {
    const total = filteredData.length;
    const hourCounts = {};
    let totalDwell = 0;
    let totalGroup = 0;

    filteredData.forEach(d => {
      const hour = new Date(d.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      totalDwell += d.dwellTimeMinutes;
      totalGroup += d.groupSize;
    });

    const peakHour = Object.keys(hourCounts).reduce((a, b) => 
      hourCounts[a] > hourCounts[b] ? a : b, '0');

    return {
      total,
      peakHour: `${peakHour}:00`,
      avgDwell: total ? Math.round(totalDwell / total) : 0,
      avgGroupSize: total ? (totalGroup / total).toFixed(1) : 0
    };
  }, [filteredData]);

  const chartData = useMemo(() => {
    const hourly = {};
    filteredData.forEach(d => {
      const date = new Date(d.timestamp);
      const key = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`;
      hourly[key] = (hourly[key] || 0) + 1;
    });

    return Object.keys(hourly).slice(-24).map(key => ({
      time: key,
      visitors: hourly[key]
    }));
  }, [filteredData]);

  const topAttractions = useMemo(() => {
    const counts = {};
    filteredData.forEach(d => {
      counts[d.attraction] = (counts[d.attraction] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [filteredData]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = new Date(prev.getTime() + 60000 * playSpeed * 10);
        if (next > timeWindow.end) {
          setIsPlaying(false);
          return timeWindow.start;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, playSpeed, timeWindow]);

  const handleExport = () => {
    const csv = [
      ['ID', 'Latitude', 'Longitude', 'Timestamp', 'Attraction', 'Nationality', 'Group Size', 'Dwell Time', 'Age Range'],
      ...filteredData.map(d => [
        d.id, d.lat, d.lng, d.timestamp, d.attraction, d.nationality, d.groupSize, d.dwellTimeMinutes, d.ageRange
      ])
    ].map(row => row.join(',\'')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'visitor-analytics.csv';
    a.click();
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Visitor Analytics Dashboard</h1>
          <p style={styles.subtitle}>
            <MapPin size={14} style={styles.icon} />
            {adminLocation.name} ({adminLocation.lat.toFixed(4)}, {adminLocation.lng.toFixed(4)})
            <span style={styles.divider}>•</span>
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </header>
      <hr></hr>
      <div style={styles.mainContent}>
        <aside style={styles.sidebar}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              <Filter size={16} style={styles.icon} />
              Filters
            </h3>
            <div style={styles.filterGroup}>
              <label style={styles.label}>Nationality</label>
              <select
                style={styles.select}
                value={filters.nationality}
                onChange={e => setFilters({ ...filters, nationality: e.target.value })}
              >
                <option value="all">All Countries</option>
                {NATIONALITIES.map(n => <option key={n.code} value={n.code}>{n.code}</option>)}
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.label}>Attraction</label>
              <select
                style={styles.select}
                value={filters.attraction}
                onChange={e => setFilters({ ...filters, attraction: e.target.value })}
              >
                <option value="all">All Attractions</option>
                {ATTRACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.label}>Group Size</label>
              <select
                style={styles.select}
                value={filters.groupSize}
                onChange={e => setFilters({ ...filters, groupSize: e.target.value })}
              >
                <option value="all">All Sizes</option>
                <option value="1">Solo (1)</option>
                <option value="2">Small (2-3)</option>
                <option value="4">Large (4+)</option>
              </select>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              <Clock size={16} style={styles.icon} />
              Playback
            </h3>
            <div style={styles.playbackControls}>
              <button
                style={styles.playButton}
                onClick={() => setIsPlaying(!isPlaying)}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <div style={styles.speedControl}>
                {[1, 2, 5].map(speed => (
                  <button
                    key={speed}
                    style={{
                      ...styles.speedButton,
                      ...(playSpeed === speed ? styles.speedButtonActive : {})
                    }}
                    onClick={() => setPlaySpeed(speed)}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
            <div style={styles.timeDisplay}>
              {currentTime.toLocaleString()}
            </div>
            <input
              type="range"
              style={styles.slider}
              min={new Date(allData[0].timestamp).getTime()}
              max={new Date(allData[allData.length - 1].timestamp).getTime()}
              value={currentTime.getTime()}
              onChange={e => setCurrentTime(new Date(parseInt(e.target.value)))}
            />
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              <Layers size={16} style={styles.icon} />
              Map Layers
            </h3>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={showHeatmap}
                onChange={e => setShowHeatmap(e.target.checked)}
              />
              Show Heatmap
            </label>
          </div>

          <button style={styles.exportButton} onClick={handleExport}>
            <Download size={16} style={styles.icon} />
            Export CSV
          </button>
        </aside>

        <main style={styles.mapContainer}>
          <MapContainer
            center={[adminLocation.lat, adminLocation.lng]}
            zoom={13}
            style={styles.map}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {showHeatmap && <HeatmapLayer data={filteredData} timeWindow={timeWindow} />}
            {visibleMarkers.map(marker => (
              <Marker key={marker.id} position={[marker.lat, marker.lng]}>
                <Popup>
                  <div style={styles.popup}>
                    <strong>{marker.attraction}</strong>
                    <p>Time: {new Date(marker.timestamp).toLocaleTimeString()}</p>
                    <p>Nationality: {marker.nationality}</p>
                    <p>Group: {marker.groupSize} people</p>
                    <p>Dwell: {marker.dwellTimeMinutes} min</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </main>

        <aside style={styles.rightPanel}>
          <div style={styles.metricsGrid}>
            <div style={styles.metricCard}>
              <div style={styles.metricIcon} style={{background: 'linear-gradient(135deg, #06b6d4, #0891b2)'}}>
                <Users size={20} color="white" />
              </div>
              <div style={styles.metricContent}>
                <div style={styles.metricValue}>{metrics.total.toLocaleString()}</div>
                <div style={styles.metricLabel}>Total Visitors</div>
              </div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricIcon} style={{background: 'linear-gradient(135deg, #f59e0b, #d97706)'}}>
                <TrendingUp size={20} color="white" />
              </div>
              <div style={styles.metricContent}>
                <div style={styles.metricValue}>{metrics.peakHour}</div>
                <div style={styles.metricLabel}>Peak Hour</div>
              </div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricIcon} style={{background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'}}>
                <Clock size={20} color="white" />
              </div>
              <div style={styles.metricContent}>
                <div style={styles.metricValue}>{metrics.avgDwell} min</div>
                <div style={styles.metricLabel}>Avg Dwell Time</div>
              </div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricIcon} style={{background: 'linear-gradient(135deg, #ec4899, #db2777)'}}>
                <Users size={20} color="white" />
              </div>
              <div style={styles.metricContent}>
                <div style={styles.metricValue}>{metrics.avgGroupSize}</div>
                <div style={styles.metricLabel}>Avg Group Size</div>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Visitors Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{fontSize: 11}} />
                <YAxis tick={{fontSize: 11}} />
                <RechartsTooltip />
                <Line type="monotone" dataKey="visitors" stroke="#06b6d4" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Top Attractions</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topAttractions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{fontSize: 10}} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{fontSize: 11}} />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Recent Visitors</h3>
            <div style={styles.table}>
              {filteredData.slice(-5).reverse().map(visitor => (
                <div key={visitor.id} style={styles.tableRow}>
                  <div style={styles.tableCellMain}>
                    <strong>{visitor.attraction}</strong>
                    <span style={styles.tableTime}>
                      {new Date(visitor.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={styles.tableCell}>{visitor.nationality}</div>
                  <div style={styles.tableCell}>{visitor.groupSize} ppl</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const styles = {
  
  container: {
    minHeight: '100vh',
    background: '#ffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
background: '#ffff',
    color: 'black',
    padding: '1.5rem 2rem',
  },
  title: {
    margin: 0,
    fontSize: '1.75rem',
    fontWeight: '700'
  },
  subtitle: {
    margin: '0.5rem 0 0 0',
    fontSize: '0.875rem',
    opacity: 0.9,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  icon: {
    display: 'inline',
    verticalAlign: 'middle'
  },
  divider: {
    margin: '0 0.5rem'
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr 320px',
    gap: '1.5rem',
    padding: '1.5rem',
    maxWidth: '1800px',
    margin: '0 auto'
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  card: {
    background: 'white',
    borderRadius: '1rem',
    padding: '1.25rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  cardTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  filterGroup: {
    marginBottom: '1rem'
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    marginBottom: '0.5rem',
    color: '#475569'
  },
  select: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    border: '1px solid #e2e8f0',
    fontSize: '0.875rem',
    background: 'white'
  },
  playbackControls: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1rem'
  },
  playButton: {
    background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  speedControl: {
    display: 'flex',
    gap: '0.25rem',
    flex: 1
  },
  speedButton: {
    flex: 1,
    padding: '0.5rem',
    border: '1px solid #e2e8f0',
    background: 'white',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    cursor: 'pointer'
  },
  speedButtonActive: {
    background: '#06b6d4',
    color: 'white',
    borderColor: '#06b6d4'
  },
  timeDisplay: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginBottom: '0.5rem',
    textAlign: 'center'
  },
  slider: {
    width: '100%',
    cursor: 'pointer'
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    cursor: 'pointer'
  },
  exportButton: {
    width: '100%',
    padding: '0.75rem',
    background: '#8b5cf6',
    color: 'white',
    border: 'none',
    borderRadius: '0.75rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  },
  mapContainer: {
    background: 'white',
    borderRadius: '1rem',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    height: 'calc(100vh - 180px)'
  },
  map: {
    width: '100%',
    height: '100%'
  },
  popup: {
    fontSize: '0.875rem'
  },
  rightPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    maxHeight: 'calc(100vh - 180px)',
    overflowY: 'auto'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  },
  metricCard: {
    background: 'white',
    borderRadius: '1rem',
    padding: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    gap: '0.75rem'
  },
  metricIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  metricContent: {
    flex: 1
  },
  metricValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 1.2
  },
  metricLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '0.25rem'
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  tableRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    background: '#f8fafc',
    color:'black',
    borderRadius: '0.5rem',
    fontSize: '0.875rem'
  },
  tableCellMain: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  tableTime: {
    fontSize: '0.75rem',
    color: '#64748b'
  },
  tableCell: {
    fontSize: '0.75rem',
    color: '#475569',
    whiteSpace: 'nowrap'
  }
};

export default TouristAnalyticsDashboard;