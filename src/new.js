import React, { useState } from 'react';
import { Phone, User, MapPin, Maximize, Settings, BarChart3, Bug, TrendingUp, FileText, Sprout, Cloud, UserCircle, MessageCircle, ChevronRight, Leaf, Droplets, Sun, AlertTriangle, Camera, Upload, CheckCircle, Star } from 'lucide-react';

const KisanMitra = () => {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [language, setLanguage] = useState('en');
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Language translations
  const translations = {
    en: {
      appName: 'KisanMitra',
      tagline: 'Your Smart Farming Partner',
      login: 'Login with Phone',
      phoneNumber: 'Phone Number',
      continue: 'Continue',
      name: 'Full Name',
      village: 'Village/Location',
      landArea: 'Land Area (Acres)',
      register: 'Complete Registration',
      dashboard: 'Dashboard',
      soilHealth: 'Soil Health',
      pestDetective: 'Pest Detective',
      marketMonitor: 'Market Monitor',
      schemeFinder: 'Scheme Finder',
      cropTracker: 'Crop Tracker',
      weather: 'Weather',
      network: 'Network',
      profile: 'Profile'
    },
    hi: {
      appName: 'किसानमित्र',
      tagline: 'आपका स्मार्ट खेती साथी',
      login: 'फोन से लॉगिन',
      phoneNumber: 'फोन नंबर',
      continue: 'जारी रखें',
      name: 'पूरा नाम',
      village: 'गाँव/स्थान',
      landArea: 'भूमि क्षेत्र (एकड़)',
      register: 'पंजीकरण पूरा करें',
      dashboard: 'डैशबोर्ड',
      soilHealth: 'मिट्टी स्वास्थ्य',
      pestDetective: 'कीट जासूस',
      marketMonitor: 'बाज़ार मॉनिटर',
      schemeFinder: 'योजना खोजी',
      cropTracker: 'फसल ट्रैकर',
      weather: 'मौसम',
      network: 'नेटवर्क',
      profile: 'प्रोफाइल'
    },
    pa: {
      appName: 'ਕਿਸਾਨਮਿੱਤਰ',
      tagline: 'ਤੁਹਾਡਾ ਸਮਾਰਟ ਖੇਤੀ ਸਾਥੀ',
      login: 'ਫੋਨ ਨਾਲ ਲਾਗਇਨ',
      phoneNumber: 'ਫੋਨ ਨੰਬਰ',
      continue: 'ਜਾਰੀ ਰੱਖੋ',
      name: 'ਪੂਰਾ ਨਾਮ',
      village: 'ਪਿੰਡ/ਸਥਾਨ',
      landArea: 'ਜ਼ਮੀਨ ਖੇਤਰ (ਏਕੜ)',
      register: 'ਰਜਿਸਟਰੇਸ਼ਨ ਪੂਰਾ ਕਰੋ',
      dashboard: 'ਡੈਸ਼ਬੋਰਡ',
      soilHealth: 'ਮਿੱਟੀ ਸਿਹਤ',
      pestDetective: 'ਕੀਟ ਜਾਸੂਸ',
      marketMonitor: 'ਮਾਰਕਿਟ ਮਾਨੀਟਰ',
      schemeFinder: 'ਸਕੀਮ ਖੋਜੀ',
      cropTracker: 'ਫਸਲ ਟਰੈਕਰ',
      weather: 'ਮੌਸਮ',
      network: 'ਨੈੱਟਵਰਕ',
      profile: 'ਪ੍ਰੋਫਾਈਲ'
    }
  };

  const t = translations[language];

  // Login Screen
  const LoginScreen = () => (
    <div className="login-container">
      <div className="login-content">
        <div className="login-header">
          <div className="app-logo">
            <Leaf />
          </div>
          <h1 className="app-title">{t.appName}</h1>
          <p className="app-tagline">{t.tagline}</p>
        </div>

        <div className="login-form">
          <div className="language-selector">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="language-dropdown"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="pa">ਪੰਜਾਬੀ</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t.phoneNumber}</label>
            <div className="input-group">
              <Phone className="input-icon" />
              <input
                type="tel"
                className="form-input"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <button 
            onClick={() => setCurrentScreen('register')}
            className="primary-button"
          >
            {t.continue}
          </button>
        </div>
      </div>
    </div>
  );

  // Registration Screen
  const RegisterScreen = () => (
    <div className="register-container">
      <div className="register-content">
        <div className="register-form">
          <h2 className="form-title">Complete Profile</h2>
          
          <div className="form-fields">
            <div className="form-group">
              <label className="form-label">{t.name}</label>
              <div className="input-group">
                <User className="input-icon" />
                <input className="form-input" placeholder="राजवीर सिंह" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t.village}</label>
              <div className="input-group">
                <MapPin className="input-icon" />
                <input className="form-input" placeholder="जालंधर, पंजाब" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t.landArea}</label>
              <div className="input-group">
                <Maximize className="input-icon" />
                <input className="form-input" placeholder="5.5" type="number" step="0.1" />
              </div>
            </div>

            <button 
              onClick={() => {
                setUser({name: 'राजवीर सिंह', village: 'जालंधर, पंजाब', land: '5.5'});
                setCurrentScreen('dashboard');
              }}
              className="primary-button"
            >
              {t.register}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Dashboard Screen
  const DashboardScreen = () => (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-info">
            <h1 className="header-title">{t.appName}</h1>
            <p className="header-subtitle">नमस्ते राजवीर जी</p>
          </div>
          <button 
            onClick={() => setLanguage(language === 'en' ? 'hi' : language === 'hi' ? 'pa' : 'en')}
            className="header-button"
          >
            <Settings />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue">
              <Droplets />
            </div>
            <p className="stat-label">Soil Moisture</p>
            <p className="stat-value stat-value-blue">68%</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-yellow">
              <Sun />
            </div>
            <p className="stat-label">Temperature</p>
            <p className="stat-value stat-value-yellow">28°C</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-green">
              <Sprout />
            </div>
            <p className="stat-label">Active Crops</p>
            <p className="stat-value stat-value-green">2</p>
          </div>
        </div>
      </div>

      {/* Primary Tools */}
      <div className="tools-section">
        <h3 className="section-title">Primary Tools</h3>
        <div className="tools-grid">
          <ToolCard 
            icon={<BarChart3 />}
            title="Soil Health"
            subtitle="NPK Analysis"
            color="blue"
            onClick={() => setCurrentScreen('soil')}
          />
          <ToolCard 
            icon={<Bug />}
            title="Pest Detective"
            subtitle="AI Detection"
            color="red"
            onClick={() => setCurrentScreen('pest')}
          />
          <ToolCard 
            icon={<TrendingUp />}
            title="Market Monitor"
            subtitle="Live Prices"
            color="green"
            onClick={() => setCurrentScreen('market')}
          />
          <ToolCard 
            icon={<FileText />}
            title="Scheme Finder"
            subtitle="Govt Benefits"
            color="purple"
            onClick={() => setCurrentScreen('schemes')}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <h3 className="section-title">Recent Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon activity-icon-warning">
              <AlertTriangle />
            </div>
            <div className="activity-content">
              <p className="activity-title">Pest Alert: Field 1</p>
              <p className="activity-time">2 hours ago</p>
            </div>
            <ChevronRight className="activity-chevron" />
          </div>
          
          <div className="activity-item">
            <div className="activity-icon activity-icon-success">
              <CheckCircle />
            </div>
            <div className="activity-content">
              <p className="activity-title">Soil Test Complete</p>
              <p className="activity-time">1 day ago</p>
            </div>
            <ChevronRight className="activity-chevron" />
          </div>
        </div>
      </div>

      {/* AI Assistant */}
      <div className="ai-assistant">
        <button className="ai-button">
          <MessageCircle />
        </button>
      </div>
    </div>
  );

  // Soil Health Screen
  const SoilHealthScreen = () => {
    const [npkValues, setNpkValues] = useState({ n: '', p: '', k: '' });
    const [soilAnalysis, setSoilAnalysis] = useState(null);

    const analyzeSoil = () => {
      const n = parseFloat(npkValues.n) || 0;
      const p = parseFloat(npkValues.p) || 0;
      const k = parseFloat(npkValues.k) || 0;

      const nStatus = n > 250 ? 'Good' : n > 150 ? 'Medium' : 'Low';
      const pStatus = p > 40 ? 'Good' : p > 25 ? 'Medium' : 'Low';
      const kStatus = k > 300 ? 'Excellent' : k > 200 ? 'Good' : 'Medium';

      const score = ((n/300 + p/50 + k/350) * 10 / 3).toFixed(1);

      setSoilAnalysis({
        score,
        nitrogen: nStatus,
        phosphorus: pStatus,
        potassium: kStatus
      });
    };

    return (
      <div className="soil-container">
        <div className="soil-header">
          <div className="header-nav">
            <button 
              onClick={() => setCurrentScreen('dashboard')}
              className="back-button"
            >
              <ChevronRight style={{ transform: 'rotate(180deg)' }} />
            </button>
            <div className="header-info">
              <h2 className="page-title">Soil Health Analyzer</h2>
              <p className="page-subtitle">Check NPK levels & get recommendations</p>
            </div>
          </div>
        </div>
        
        <div className="soil-content">
          <div className="npk-input-card">
            <h3 className="card-title">Enter NPK Values</h3>
            <div className="npk-grid">
              <div className="npk-input">
                <label className="npk-label">Nitrogen (N)</label>
                <input 
                  className="npk-field" 
                  placeholder="280"
                  type="number"
                  value={npkValues.n}
                  onChange={(e) => setNpkValues({...npkValues, n: e.target.value})}
                />
              </div>
              <div className="npk-input">
                <label className="npk-label">Phosphorus (P)</label>
                <input 
                  className="npk-field" 
                  placeholder="45"
                  type="number"
                  value={npkValues.p}
                  onChange={(e) => setNpkValues({...npkValues, p: e.target.value})}
                />
              </div>
              <div className="npk-input">
                <label className="npk-label">Potassium (K)</label>
                <input 
                  className="npk-field" 
                  placeholder="320"
                  type="number"
                  value={npkValues.k}
                  onChange={(e) => setNpkValues({...npkValues, k: e.target.value})}
                />
              </div>
            </div>
            <button 
              onClick={analyzeSoil}
              className="analyze-button"
            >
              Analyze Soil
            </button>
          </div>

          {soilAnalysis && (
            <>
              <div className="analysis-card">
                <div className="analysis-header">
                  <h3 className="card-title">Soil Health Score</h3>
                  <div className="score-display">
                    <Star className="star-icon" />
                    <span className="score-value">{soilAnalysis.score}/10</span>
                  </div>
                </div>
                <div className="analysis-details">
                  <div className="detail-row">
                    <span>Nitrogen</span>
                    <span className={`status status-${soilAnalysis.nitrogen.toLowerCase()}`}>
                      {soilAnalysis.nitrogen}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span>Phosphorus</span>
                    <span className={`status status-${soilAnalysis.phosphorus.toLowerCase()}`}>
                      {soilAnalysis.phosphorus}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span>Potassium</span>
                    <span className={`status status-${soilAnalysis.potassium.toLowerCase()}`}>
                      {soilAnalysis.potassium}
                    </span>
                  </div>
                </div>
              </div>

              <div className="recommendations-card">
                <h3 className="card-title">Recommended Crops</h3>
                <div className="crops-grid">
                  <div className="crop-card crop-card-green">
                    <div className="crop-icon">
                      <Sprout />
                    </div>
                    <p className="crop-name">Wheat</p>
                    <p className="crop-match">95% Match</p>
                  </div>
                  <div className="crop-card crop-card-yellow">
                    <div className="crop-icon">
                      <Sprout />
                    </div>
                    <p className="crop-name">Paddy</p>
                    <p className="crop-match">88% Match</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Pest Detective Screen
  const PestDetectiveScreen = () => (
    <div className="pest-container">
      <div className="pest-header">
        <div className="header-nav">
          <button 
            onClick={() => setCurrentScreen('dashboard')}
            className="back-button"
          >
            <ChevronRight style={{ transform: 'rotate(180deg)' }} />
          </button>
          <div className="header-info">
            <h2 className="page-title">Pest Detective</h2>
            <p className="page-subtitle">AI-powered pest identification</p>
          </div>
        </div>
      </div>
      
      <div className="pest-content">
        <div className="upload-card">
          <div className="upload-icon">
            <Camera />
          </div>
          <h3 className="upload-title">Upload Pest Image</h3>
          <p className="upload-subtitle">Take a clear photo of the affected plant or pest</p>
          <div className="upload-buttons">
            <button className="camera-button">
              <Camera />
              <span>Camera</span>
            </button>
            <button className="gallery-button">
              <Upload />
              <span>Gallery</span>
            </button>
          </div>
        </div>

        <div className="detections-card">
          <h3 className="card-title">Recent Detections</h3>
          <div className="detections-list">
            <div className="detection-item">
              <div className="detection-icon detection-icon-red">
                <Bug />
              </div>
              <div className="detection-content">
                <p className="detection-name">Aphids</p>
                <p className="detection-details">Wheat Field - Moderate Damage</p>
                <p className="detection-time">2 days ago</p>
              </div>
            </div>
            
            <div className="detection-item">
              <div className="detection-icon detection-icon-yellow">
                <Bug />
              </div>
              <div className="detection-content">
                <p className="detection-name">Stem Borer</p>
                <p className="detection-details">Rice Field - Low Damage</p>
                <p className="detection-time">5 days ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="tips-card">
          <h3 className="tips-title">💡 Pro Tips</h3>
          <ul className="tips-list">
            <li>• Take photos in good lighting</li>
            <li>• Focus on affected leaves/stems</li>
            <li>• Include close-up of pest if visible</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Weather Screen
  const WeatherScreen = () => (
    <div className="weather-container">
      <div className="weather-header">
        <h2 className="page-title">Weather Guide</h2>
        <p className="page-subtitle">5-day forecast & farming tips</p>
      </div>
      
      <div className="weather-content">
        <div className="current-weather">
          <div className="weather-main">
            <div className="temperature-info">
              <h3 className="temperature">28°C</h3>
              <p className="weather-condition">Partly Cloudy</p>
              <p className="location">Jalandhar, Punjab</p>
            </div>
            <div className="weather-icon">
              <Sun />
            </div>
          </div>
          
          <div className="weather-details">
            <div className="detail-item">
              <p className="detail-label">Humidity</p>
              <p className="detail-value">65%</p>
            </div>
            <div className="detail-item">
              <p className="detail-label">Wind</p>
              <p className="detail-value">12 km/h</p>
            </div>
            <div className="detail-item">
              <p className="detail-label">Rainfall</p>
              <p className="detail-value">5mm</p>
            </div>
            <div className="detail-item">
              <p className="detail-label">UV Index</p>
              <p className="detail-value">7</p>
            </div>
          </div>
        </div>

        <div className="forecast-card">
          <h3 className="card-title">5-Day Forecast</h3>
          <div className="forecast-list">
            {['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri'].map((day, i) => (
              <div key={i} className="forecast-item">
                <span className="forecast-day">{day}</span>
                <div className="forecast-info">
                  <Sun className="forecast-icon" />
                  <span className="forecast-condition">Sunny</span>
                </div>
                <span className="forecast-temp">32°/25°</span>
              </div>
            ))}
          </div>
        </div>

        <div className="farming-tip">
          <h3 className="tip-title">Farming Tip</h3>
          <p className="tip-text">Perfect weather for irrigation today. Consider watering your wheat crops in the evening.</p>
        </div>
      </div>
    </div>
  );

  // Tool Card Component
  const ToolCard = ({ icon, title, subtitle, color, onClick }) => (
    <div className={`tool-card tool-card-${color}`} onClick={onClick}>
      <div className="tool-content">
        <div className={`tool-icon tool-icon-${color}`}>
          {icon}
        </div>
        <div className="tool-info">
          <h4 className="tool-title">{title}</h4>
          <p className="tool-subtitle">{subtitle}</p>
        </div>
      </div>
    </div>
  );

  // Bottom Navigation
  const BottomNav = () => (
    <div className="bottom-nav">
      <div className="nav-container">
        <NavItem 
          icon={<BarChart3 />} 
          label="Dashboard" 
          active={activeTab === 'dashboard'}
          onClick={() => setActiveTab('dashboard')}
        />
        <NavItem 
          icon={<Sprout />} 
          label="Crops" 
          active={activeTab === 'crops'}
          onClick={() => setActiveTab('crops')}
        />
        <NavItem 
          icon={<Cloud />} 
          label="Weather" 
          active={activeTab === 'weather'}
          onClick={() => setActiveTab('weather')}
        />
        <NavItem 
          icon={<UserCircle />} 
          label="Profile" 
          active={activeTab === 'profile'}
          onClick={() => setActiveTab('profile')}
        />
      </div>
    </div>
  );

  const NavItem = ({ icon, label, active, onClick }) => (
    <button 
      onClick={onClick}
      className={`nav-item ${active ? 'nav-item-active' : ''}`}
    >
      {icon}
      <span className="nav-label">{label}</span>
    </button>
  );

  // Main render logic
  const renderScreen = () => {
    if (currentScreen === 'login') return <LoginScreen />;
    if (currentScreen === 'register') return <RegisterScreen />;
    
    switch (activeTab) {
      case 'dashboard':
        return currentScreen === 'soil' ? <SoilHealthScreen /> : 
               currentScreen === 'pest' ? <PestDetectiveScreen /> : 
               <DashboardScreen />;
      case 'weather':
        return <WeatherScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f8fafc;
        }

        /* Login Styles */
        .login-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-content {
          width: 100%;
          max-width: 400px;
          padding-top: 60px;
        }

        .login-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .app-logo {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #059669, #10b981);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          box-shadow: 0 10px 25px rgba(5, 150, 105, 0.3);
        }

        .app-logo svg {
          width: 40px;
          height: 40px;
          color: white;
        }

        .app-title {
          font-size: 32px;
          font-weight: 700;
          color: #064e3b;
          margin-bottom: 8px;
        }

        .app-tagline {
          color: #059669;
          font-size: 16px;
          font-weight: 500;
        }

        .login-form {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }

        .language-selector {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 20px;
        }

        .language-dropdown {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          background: white;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .input-group {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: #9ca3af;
        }

        .form-input {
          width: 100%;
          padding: 16px 16px 16px 48px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: #f9fafb;
        }

        .form-input:focus {
          outline: none;
          border-color: #059669;
          background: white;
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }

        .primary-button {
          width: 100%;
          background: linear-gradient(135deg, #059669, #10b981);
          color: white;
          border: none;
          padding: 16px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
        }

        .primary-button:hover {
          background: linear-gradient(135deg, #047857, #059669);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(5, 150, 105, 0.4);
        }

        /* Register Styles */
        .register-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .register-content {
          width: 100%;
          max-width: 400px;
          padding-top: 40px;
        }

        .register-form {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .form-title {
          font-size: 24px;
          font-weight: 700;
          color: #064e3b;
          text-align: center;
          margin-bottom: 30px;
        }

        .form-fields {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Dashboard Styles */
        .dashboard-container {
          background: #f8fafc;
          min-height: 100vh;
          padding-bottom: 80px;
        }

        .dashboard-header {
          background: linear-gradient(135deg, #059669, #10b981);
          color: white;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(5, 150, 105, 0.3);
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .header-subtitle {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
        }

        .header-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .header-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }

        .stats-section {
          background: white;
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .stat-card {
          text-align: center;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 8px;
        }

        .stat-icon-blue {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
        }

        .stat-icon-blue svg {
          color: #2563eb;
          width: 24px;
          height: 24px;
        }

        .stat-icon-yellow {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
        }

        .stat-icon-yellow svg {
          color: #d97706;
          width: 24px;
          height: 24px;
        }

        .stat-icon-green {
          background: linear-gradient(135deg, #dcfce7, #bbf7d0);
        }

        .stat-icon-green svg {
          color: #059669;
          width: 24px;
          height: 24px;
        }

        .stat-label {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .stat-value {
          font-weight: 700;
          font-size: 16px;
        }

        .stat-value-blue { color: #2563eb; }
        .stat-value-yellow { color: #d97706; }
        .stat-value-green { color: #059669; }

        .tools-section, .activity-section {
          padding: 20px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 16px;
        }

        .tools-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .tool-card {
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        }

        .tool-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .tool-card-blue {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
        }

        .tool-card-red {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
        }

        .tool-card-green {
          background: linear-gradient(135deg, #dcfce7, #bbf7d0);
        }

        .tool-card-purple {
          background: linear-gradient(135deg, #e9d5ff, #ddd6fe);
        }

        .tool-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
        }

        .tool-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tool-icon-blue { background: #2563eb; }
        .tool-icon-red { background: #dc2626; }
        .tool-icon-green { background: #059669; }
        .tool-icon-purple { background: #7c3aed; }

        .tool-icon svg {
          color: white;
          width: 24px;
          height: 24px;
        }

        .tool-title {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 2px;
        }

        .tool-subtitle {
          font-size: 12px;
          color: #6b7280;
        }

        .activity-list {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .activity-icon-warning {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
        }

        .activity-icon-warning svg {
          color: #d97706;
          width: 16px;
          height: 16px;
        }

        .activity-icon-success {
          background: linear-gradient(135deg, #dcfce7, #bbf7d0);
        }

        .activity-icon-success svg {
          color: #059669;
          width: 16px;
          height: 16px;
        }

        .activity-content {
          flex: 1;
        }

        .activity-title {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 2px;
        }

        .activity-time {
          font-size: 12px;
          color: #6b7280;
        }

        .activity-chevron {
          width: 16px;
          height: 16px;
          color: #9ca3af;
        }

        .ai-assistant {
          position: fixed;
          bottom: 100px;
          right: 20px;
          z-index: 1000;
        }

        .ai-button {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #059669, #10b981);
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 25px rgba(5, 150, 105, 0.4);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .ai-button:hover {
          background: linear-gradient(135deg, #047857, #059669);
          transform: scale(1.1);
          box-shadow: 0 12px 35px rgba(5, 150, 105, 0.5);
        }

        .ai-button svg {
          color: white;
          width: 24px;
          height: 24px;
        }

        /* Soil Health Styles */
        .soil-container {
          background: #f8fafc;
          min-height: 100vh;
          padding-bottom: 80px;
        }

        .soil-header {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: white;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(37, 99, 235, 0.3);
        }

        .pest-header {
          background: linear-gradient(135deg, #dc2626, #ef4444);
          color: white;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(220, 38, 38, 0.3);
        }

        .header-nav {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .back-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .page-title {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .page-subtitle {
          font-size: 14px;
          opacity: 0.9;
        }

        .soil-content, .pest-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .npk-input-card, .analysis-card, .recommendations-card, 
        .upload-card, .detections-card, .tips-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        }

        .card-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 16px;
        }

        .npk-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        .npk-input {
          display: flex;
          flex-direction: column;
        }

        .npk-label {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 4px;
        }

        .npk-field {
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .npk-field:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .analyze-button {
          width: 100%;
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: white;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .analyze-button:hover {
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
          transform: translateY(-1px);
        }

        .analysis-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .score-display {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .star-icon {
          width: 20px;
          height: 20px;
          color: #f59e0b;
          fill: #f59e0b;
        }

        .score-value {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
        }

        .analysis-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }

        .status {
          font-weight: 600;
        }

        .status-good, .status-excellent { color: #059669; }
        .status-medium { color: #d97706; }
        .status-low { color: #dc2626; }

        .crops-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .crop-card {
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          border: 2px solid;
        }

        .crop-card-green {
          background: #f0fdf4;
          border-color: #bbf7d0;
        }

        .crop-card-yellow {
          background: #fffbeb;
          border-color: #fde68a;
        }

        .crop-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 8px;
          background: #059669;
        }

        .crop-icon svg {
          color: white;
          width: 16px;
          height: 16px;
        }

        .crop-name {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 2px;
        }

        .crop-match {
          font-size: 12px;
          color: #6b7280;
        }

        /* Pest Detective Styles */
        .pest-container {
          background: #f8fafc;
          min-height: 100vh;
          padding-bottom: 80px;
        }

        .upload-card {
          text-align: center;
        }

        .upload-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .upload-icon svg {
          color: #dc2626;
          width: 40px;
          height: 40px;
        }

        .upload-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .upload-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 20px;
        }

        .upload-buttons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .camera-button {
          background: linear-gradient(135deg, #dc2626, #ef4444);
          color: white;
          border: none;
          padding: 12px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .camera-button:hover {
          background: linear-gradient(135deg, #b91c1c, #dc2626);
          transform: translateY(-1px);
        }

        .gallery-button {
          background: white;
          color: #dc2626;
          border: 2px solid #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .gallery-button:hover {
          background: #fee2e2;
        }

        .detections-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .detection-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 12px;
        }

        .detection-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .detection-icon-red {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
        }

        .detection-icon-red svg {
          color: #dc2626;
          width: 24px;
          height: 24px;
        }

        .detection-icon-yellow {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
        }

        .detection-icon-yellow svg {
          color: #d97706;
          width: 24px;
          height: 24px;
        }

        .detection-content {
          flex: 1;
        }

        .detection-name {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .detection-details {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 2px;
        }

        .detection-time {
          font-size: 12px;
          color: #9ca3af;
        }

        .tips-card {
          background: linear-gradient(135deg, #fffbeb, #fef3c7);
          border: 2px solid #fde68a;
        }

        .tips-title {
          font-size: 16px;
          font-weight: 600;
          color: #92400e;
          margin-bottom: 12px;
        }

        .tips-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .tips-list li {
          font-size: 14px;
          color: #92400e;
          margin-bottom: 4px;
        }

        /* Weather Styles */
        .weather-container {
          background: #f8fafc;
          min-height: 100vh;
        }

        .weather-header {
          background: linear-gradient(135deg, #3b82f6, #60a5fa);
          color: white;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
        }

        .weather-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .current-weather {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        }

        .weather-main {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .temperature {
          font-size: 36px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .weather-condition {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 2px;
        }

        .location {
          font-size: 14px;
          color: #9ca3af;
        }

        .weather-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .weather-icon svg {
          color: #f59e0b;
          width: 40px;
          height: 40px;
        }

        .weather-details {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          text-align: center;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-label {
          font-size: 12px;
          color: #9ca3af;
        }

        .detail-value {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        .forecast-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        }

        .forecast-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .forecast-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .forecast-item:last-child {
          border-bottom: none;
        }

        .forecast-day {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          width: 80px;
        }

        .forecast-info {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .forecast-icon {
          width: 16px;
          height: 16px;
          color: #f59e0b;
        }

        .forecast-condition {
          font-size: 12px;
          color: #6b7280;
        }

        .forecast-temp {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        .farming-tip {
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          border: 2px solid #bbf7d0;
          border-radius: 16px;
          padding: 20px;
        }

        .tip-title {
          font-size: 16px;
          font-weight: 600;
          color: #065f46;
          margin-bottom: 8px;
        }

        .tip-text {
          font-size: 14px;
          color: #047857;
          line-height: 1.5;
        }

        /* Bottom Navigation */
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-top: 1px solid #e5e7eb;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }

        .nav-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          padding: 8px 0;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 8px;
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #9ca3af;
        }

        .nav-item-active {
          color: #059669;
        }

        .nav-item svg {
          width: 20px;
          height: 20px;
          margin-bottom: 4px;
        }

        .nav-label {
          font-size: 12px;
          font-weight: 500;
        }

        /* Responsive Design */
        @media (max-width: 480px) {
          .tools-grid {
            grid-template-columns: 1fr;
          }
          
          .npk-grid {
            grid-template-columns: 1fr;
          }
          
          .crops-grid {
            grid-template-columns: 1fr;
          }
          
          .stats-grid {
            gap: 12px;
          }
          
          .weather-details {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
      
      <div style={{ maxWidth: '400px', margin: '0 auto', backgroundColor: 'white', minHeight: '100vh', position: 'relative' }}>
        {renderScreen()}
        {user && <BottomNav />}
      </div>
    </>
  );
};

export default KisanMitra;