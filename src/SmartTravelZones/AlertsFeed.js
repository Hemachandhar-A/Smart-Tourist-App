import React, { useState } from 'react';
import { Clock, MapPin, AlertTriangle, Users, Shield, Phone, Download, Filter } from 'lucide-react';

const AlertsFeed = ({ alerts }) => {
  const [filterType, setFilterType] = useState('all');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'entry': return <MapPin className="alert-icon entry" />;
      case 'exit': return <MapPin className="alert-icon exit" />;
      case 'dwell': return <Clock className="alert-icon dwell" />;
      case 'danger_entry': return <AlertTriangle className="alert-icon danger" />;
      case 'crowd_spike': return <Users className="alert-icon crowd" />;
      case 'family_notified': return <Users className="alert-icon family" />;
      case 'sos': return <Phone className="alert-icon sos" />;
      default: return <Shield className="alert-icon default" />;
    }
  };

  const getAlertColor = (type, fenceType) => {
    if (type === 'sos') return 'sos';
    if (type === 'family_notified') return 'family';
    if (type === 'crowd_spike') return 'crowd';
    
    switch (fenceType) {
      case 'danger': return 'danger';
      case 'tourist': return 'tourist';
      case 'market': return 'market';
      case 'event': return 'event';
      default: return 'default';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filterType === 'all') return true;
    if (filterType === 'danger') return alert.fence_type === 'danger' || alert.type === 'sos';
    if (filterType === 'entries') return alert.type === 'entry';
    if (filterType === 'notifications') return alert.type === 'family_notified';
    return true;
  });

  const exportJournal = () => {
    const journalData = alerts.map(alert => ({
      time: formatTime(alert.timestamp),
      type: alert.type,
      location: alert.fence_name || 'Unknown',
      message: alert.message,
      coordinates: `${alert.location?.lat?.toFixed(6)}, ${alert.location?.lon?.toFixed(6)}`
    }));

    const jsonStr = JSON.stringify(journalData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `travel-journal-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  return (
    <div className="alerts-feed">
      <div className="feed-header">
        <h3>Travel Journal & Alerts</h3>
        <div className="feed-controls">
          <div className="filter-dropdown">
            <button 
              className="filter-btn"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <Filter className="btn-icon" />
            </button>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Events</option>
              <option value="danger">Danger & SOS</option>
              <option value="entries">Zone Entries</option>
              <option value="notifications">Notifications</option>
            </select>
          </div>
          
          <div className="export-menu">
            <button 
              className="export-btn"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <Download className="btn-icon" />
            </button>
            {showExportMenu && (
              <div className="export-dropdown">
                <button onClick={exportJournal}>Export as JSON</button>
                <button onClick={() => window.print()}>Print Journal</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="alerts-container">
        {filteredAlerts.length === 0 ? (
          <div className="no-alerts">
            <Shield className="no-alerts-icon" />
            <h4>No events yet</h4>
            <p>Your travel journal will appear here as you move through different zones</p>
          </div>
        ) : (
          <div className="alerts-timeline">
            {filteredAlerts.map(alert => (
              <div 
                key={alert.id} 
                className={`alert-item ${getAlertColor(alert.type, alert.fence_type)}`}
              >
                <div className="alert-time">
                  {formatTime(alert.timestamp)}
                </div>
                <div className="alert-icon-container">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="alert-content">
                  <div className="alert-header">
                    <h4>{alert.fence_name}</h4>
                    <span className="alert-type">{alert.type.replace('_', ' ')}</span>
                  </div>
                  <p className="alert-message">{alert.message}</p>
                  {alert.location && (
                    <div className="alert-location">
                      <MapPin className="location-icon" />
                      <span>
                        {alert.location.lat.toFixed(4)}, {alert.location.lon.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="feed-stats">
        <div className="stat-item">
          <span className="stat-number">{alerts.length}</span>
          <span className="stat-label">Total Events</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {alerts.filter(a => a.type === 'entry').length}
          </span>
          <span className="stat-label">Zone Entries</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {alerts.filter(a => a.fence_type === 'danger' || a.type === 'sos').length}
          </span>
          <span className="stat-label">Safety Alerts</span>
        </div>
      </div>
    </div>
  );
};

export default AlertsFeed;