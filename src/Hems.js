import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, X, Shield, MessageCircle, Users, Globe, Calendar, User, AlertTriangle, Phone, Edit, QrCode, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminApp from './admin.js';

// Main App Component
const Hems = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAlertLoading, setIsAlertLoading] = useState(false);
  const [alertStatus, setAlertStatus] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // Mock user data
  const [userData] = useState({
    name: "Alex Johnson",
    touristId: "TST-2024-001",
    phone: "+1-555-0123",
    emergency: "+1-911"
  });

  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: "Hello! I'm your AI travel assistant. How can I help you today?", sender: 'bot', timestamp: new Date() }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Mock alerts data for admin
// In the main App component, replace the mock data with:
const [alertsData, setAlertsData] = useState([]);

// Add this function to fetch alerts
const fetchAlerts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/get_alerts/`);
    if (response.ok) {
      const data = await response.json();
      setAlertsData(data); // Assuming your Django view returns the alerts array directly
    }
  } catch (error) {
    console.error('Failed to fetch alerts:', error);
  }
};

// Add useEffect to fetch on component mount
useEffect(() => {
  fetchAlerts();
}, []);

  useEffect(() => {
    // Get user location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  // Handle panic button click
  // Add this configuration at the top of your App.js file
const API_BASE_URL = 'http://localhost:8000';

// Updated handlePanicAlert function
const handlePanicAlert = async () => {
  setIsAlertLoading(true);
  setAlertStatus(null);

  try {
    // Get current location if not already available
    const location = userLocation || await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    }).then(pos => ({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude
    })).catch(() => ({ latitude: 10.12345, longitude: 78.54321 })); // fallback
    const roundedLatitude = parseFloat(location.latitude.toFixed(6));
    const roundedLongitude = parseFloat(location.longitude.toFixed(6));

    // Use full URL instead of relative URL
    const response = await fetch(`${API_BASE_URL}/api/send_alert/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tourist_id: userData.touristId,
        latitude: roundedLatitude,
        longitude: roundedLongitude
      })
    });

    // Check if response is actually JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Server didn't return JSON");
    }

    if (response.ok) {
      const data = await response.json();
      setAlertStatus('success');
      showToastMessage('Alert sent successfully! Help is on the way.');
      console.log('Alert response:', data);
    } else {
      const errorText = await response.text();
      console.error('Alert failed:', response.status, errorText);
      setAlertStatus('error');
      showToastMessage('Failed to send alert. Please try again.');
    }
  } catch (error) {
    console.error('Network error:', error);
    setAlertStatus('error');
    showToastMessage('Network error. Please check your connection.');
  }

  setIsAlertLoading(false);
  
  // Reset status after 3 seconds
  setTimeout(() => setAlertStatus(null), 3000);
};

  const showToastMessage = (message) => {
    setShowToast({ message, show: true });
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    
    const newMessage = {
      id: chatMessages.length + 1,
      text: chatInput,
      sender: 'user',
      timestamp: new Date()
    };
    
    setChatMessages([...chatMessages, newMessage]);
    setChatInput('');
    
    // Mock bot response
    setTimeout(() => {
      const botResponse = {
        id: chatMessages.length + 2,
        text: "I understand your concern. I'm here to help with travel information, emergency contacts, and local assistance. What specific help do you need?",
        sender: 'bot',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'profile':
        return <ProfilePage userData={userData} />;
      case 'admin':
        return <AdminApp alertsData={alertsData} />;
      case 'about':
        return <AboutPage />;
      case 'help':
        return <HelpPage />;
      default:
        return <HomePage onPanicClick={handlePanicAlert} isLoading={isAlertLoading} alertStatus={alertStatus} />;
    }
  };

  return (
    <div className="app">
      <div className="background-carousel">
        <div className="background-slides">
          <div className="background-slide slide-1"></div>
          <div className="background-slide slide-2"></div>
          <div className="background-slide slide-3"></div>
          <div className="background-slide slide-4"></div>
          <div className="background-slide slide-5"></div>
        </div>
      </div>
      
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      
      <main className="main-content">
        {renderPage()}
      </main>
      
      <ChatWidget 
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
        messages={chatMessages}
        input={chatInput}
        setInput={setChatInput}
        onSend={handleChatSend}
      />
      
      <Footer />
      
      {showToast && <Toast message={showToast.message} />}
      
      <style jsx>{`
  .app {
    min-height: 100vh;
    position: relative;
    color: white;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    overflow-x: hidden;
    background: rgba(0, 0, 0, 0.4);
  }
  
  .background-carousel {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    overflow: hidden;
  }
  
  .background-slides {
    display: flex;
    width: 500%;
    height: 100%;
    animation: slideCarousel 25s infinite step-end;
  }
  
  .background-slide {
    width: 20%;
    height: 100%;
    background-size: cover;
    background-position: center;
    position: relative;
  }
  
  .background-slide::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  
  .slide-1 { background-image: url('https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80'); }
  .slide-2 { background-image: url('https://images.unsplash.com/photo-1587135941948-670b381f08ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'); }
  .slide-3 { background-image: url('https://images.unsplash.com/photo-1477587458883-47145ed94245?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'); }
  .slide-4 { background-image: url('https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80'); }
  .slide-5 { background-image: url('https://images.unsplash.com/photo-1596402184320-417e7178b2cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'); }
  
  @keyframes slideCarousel {
    0%, 20% { transform: translateX(0); }
    20%, 40% { transform: translateX(-20%); }
    40%, 60% { transform: translateX(-40%); }
    60%, 80% { transform: translateX(-60%); }
    80%, 100% { transform: translateX(-80%); }
  }
  
  .main-content {
    padding-top: 80px;
    min-height: calc(100vh - 80px);
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
    font-family: 'Inter', sans-serif;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(255, 59, 48, 0.5); }
    50% { box-shadow: 0 0 40px rgba(255, 59, 48, 0.8); }
  }
  
  @keyframes slideInFromRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes fadeInUp {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`}</style>
    </div>
  );
};

// Navbar Component
const Navbar = ({ currentPage, setCurrentPage, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'help', label: 'Help' },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <Shield className="brand-icon" />
          <span className='nav-brand-span'>TouristGuard</span>
        </div>
        
        <div className="nav-menu">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
      
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`mobile-nav-link ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => {
                setCurrentPage(item.id);
                setIsMobileMenuOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      
      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(10, 35, 66, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
        }
        
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: #FF4B2B;
        }

        .nav-brand-span{
          color: #ffffff;
        }
        
        .brand-icon {
          width: 32px;
          height: 32px;
        }
        
        .nav-menu {
          display: flex;
          gap: 2rem;
        }
        
        .nav-link {
          background: none;
          border: none;
          color: white;
          font-size: 1rem;
          cursor: pointer;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .nav-link:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }
        
        .nav-link.active {
          background: linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%);
        }
        
        .mobile-menu-toggle {
          display: none;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0.5rem;
        }
        
        .mobile-menu {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(10, 35, 66, 0.98);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .mobile-nav-link {
          display: block;
          width: 100%;
          background: none;
          border: none;
          color: white;
          font-size: 1rem;
          cursor: pointer;
          padding: 1rem 2rem;
          text-align: left;
          transition: all 0.3s ease;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .mobile-nav-link:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .mobile-nav-link.active {
          background: linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%);
        }
        
        @media (max-width: 768px) {
          .nav-menu {
            display: none;
          }
          
          .mobile-menu-toggle {
            display: block;
          }
          
          .mobile-menu {
            display: block;
            animation: slideInFromRight 0.3s ease;
          }
        }
      `}</style>
    </nav>
  );
};

// Home Page Component
const HomePage = ({ onPanicClick, isLoading, alertStatus }) => {
  const features = [
    {
      icon: <QrCode className="feature-icon" />,
      title: "Blockchain Digital Tourist ID",
      description: "Secure QR verification system powered by blockchain technology"
    },
    {
      icon: <Calendar className="feature-icon" />,
      title: "Itinerary Planner",
      link: "/home", 
      description: "Smart trip planning with real-time updates and recommendations"
    },
    {
      icon: <Globe className="feature-icon" />,
      title: "Multilingual AI Chat Assistant",
      description: "24/7 AI support in over 50 languages"
    },
    {
      icon: <Users className="feature-icon" />,
      title: "Group Coordination Dashboard",
      description: "Keep track of group members and coordinate activities"
    },
    {
    icon: <Globe className="feature-icon" />,
    title: "Interactive Safety Map",
    description: "Real-time map showing danger zones, safe areas, emergency services, and tourist hotspots with color-coded safety levels"
    }
    
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <h1 className="hero-title">Your Safety, Our Priority</h1>
          <p className="hero-subtitle">Advanced tourist safety platform with instant emergency response</p>
          
          <button 
            className={`panic-button ${alertStatus === 'success' ? 'success' : ''} ${alertStatus === 'error' ? 'error' : ''}`}
            onClick={onPanicClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                <AlertTriangle className="panic-icon" />
                {alertStatus === 'success' ? 'Alert Sent!' : 'SMART PANIC BUTTON'}
              </>
            )}
          </button>
          
          <p className="panic-description">Press for immediate emergency assistance</p>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="section-title">Comprehensive Safety Features</h2>
          <div className="features-grid">
           {features.map((feature, index) => {
        // If feature.component exists, render it
        if (feature.component) {
          const Component = feature.component;
          return (
            <div
              key={index}
              className="feature-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Component />
            </div>
          );
        }

        // Default fallback (external links)
        return (
          <a
            key={index}
            href={feature.link}
            target="_blank"
            rel="noopener noreferrer"
            className="feature-card"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {feature.icon}
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </a>
        );
      })}
          </div>
        </div>
      </section>
      
      <style jsx>{`
        .home-page {
          min-height: 100vh;
        }
        
        .hero-section {
          padding: 4rem 2rem;
          text-align: center;
        }
        
        .hero-container {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #fafafaff 0%, #f0eae9ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: fadeInUp 1s ease;
        }
        
        .hero-subtitle {
          font-size: 1.25rem;
          margin-bottom: 3rem;
          opacity: 0.9;
          animation: fadeInUp 1s ease 0.2s both;
        }
        
        .panic-button {
          background: linear-gradient(135deg, #FF3B30 0%, #FF8C00 100%);
          border: none;
          border-radius: 20px;
          padding: 1.5rem 3rem;
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin: 0 auto 1rem;
          min-width: 280px;
          transition: all 0.3s ease;
          animation: pulse 2s infinite, glow 2s infinite;
          position: relative;
          overflow: hidden;
        }
        
        .panic-button:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 30px rgba(255, 59, 48, 0.4);
        }
        
        .panic-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .panic-button.success {
          background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
          animation: none;
        }
        
        .panic-button.error {
          background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
          animation: none;
        }
        
        .panic-icon {
          width: 24px;
          height: 24px;
        }
        
        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .panic-description {
          font-size: 0.9rem;
          opacity: 0.8;
          animation: fadeInUp 1s ease 0.4s both;
        }
        
        .features-section {
          padding: 4rem 2rem;
          
        }
        
        .features-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .section-title {
          text-align: center;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 3rem;
          color: white;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }
        
        .feature-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 2rem;
          text-decoration: none;
          text-align: center;
          backdrop-filter: blur(60px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          animation: fadeInUp 0.8s ease both;
        }
        
        .feature-card:hover {
          transform: translateY(-10px);
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }
        
        .feature-icon {
          width: 48px;
          height: 48px;
          margin-bottom: 1rem;
          color: #FF416C;
        }
        
        .feature-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: white;
        }
        
        .feature-description {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
        }
        
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .panic-button {
            min-width: 250px;
            font-size: 1rem;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

// Profile Page Component
const ProfilePage = ({ userData }) => {
  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <User className="avatar-icon" />
          </div>
          <h1 className="profile-name">{userData.name}</h1>
          <p className="profile-id">Tourist ID: {userData.touristId}</p>
        </div>
        
        <div className="profile-content">
          <div className="profile-section">
            <h2 className="section-title">Personal Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Full Name</label>
                <span>{userData.name}</span>
              </div>
              <div className="info-item">
                <label>Tourist ID</label>
                <span>{userData.touristId}</span>
              </div>
              <div className="info-item">
                <label>Phone Number</label>
                <span>{userData.phone}</span>
              </div>
            </div>
          </div>
          
          <div className="profile-section">
            <h2 className="section-title">QR Verification Code</h2>
            <div className="qr-container">
              <QrCode className="qr-icon" />
              <p>Scan this QR code for quick identity verification</p>
            </div>
          </div>
          
          <div className="profile-section">
            <h2 className="section-title">Emergency Contacts</h2>
            <div className="emergency-contacts">
              <div className="contact-item">
                <Phone className="contact-icon" />
                <div>
                  <label>Emergency Services</label>
                  <span>{userData.emergency}</span>
                </div>
              </div>
            </div>
          </div>
          
          <button className="edit-button">
            <Edit className="edit-icon" />
            Edit Profile
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .profile-page {
          padding: 2rem;
          min-height: calc(100vh - 80px);
        }
        
        .profile-container {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .profile-header {
          text-align: center;
          margin-bottom: 3rem;
          animation: fadeInUp 0.8s ease;
        }
        
        .profile-avatar {
          width: 120px;
          height: 120px;
          background: linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }
        
        .avatar-icon {
          width: 60px;
          height: 60px;
          color: white;
        }
        
        .profile-name {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: white;
        }
        
        .profile-id {
          font-size: 1rem;
          color: #FF416C;
          font-weight: 500;
        }
        
        .profile-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .profile-section {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 2rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          animation: fadeInUp 0.8s ease;
        }
        
        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: white;
        }
        
        .info-grid {
          display: grid;
          gap: 1rem;
        }
        
        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }
        
        .info-item label {
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
        }
        
        .info-item span {
          font-weight: 600;
          color: white;
        }
        
        .qr-container {
          text-align: center;
          padding: 2rem;
        }
        
        .qr-icon {
          width: 80px;
          height: 80px;
          color: #FF416C;
          margin-bottom: 1rem;
        }
        
        .emergency-contacts {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .contact-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }
        
        .contact-icon {
          width: 24px;
          height: 24px;
          color: #FF416C;
        }
        
        .contact-item div {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .contact-item label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
        }
        
        .contact-item span {
          font-weight: 600;
          color: white;
        }
        
        .edit-button {
          background: linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%);
          border: none;
          border-radius: 12px;
          padding: 1rem 2rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          align-self: center;
        }
        
        .edit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(255, 65, 108, 0.3);
        }
        
        .edit-icon {
          width: 20px;
          height: 20px;
        }
        
        @media (max-width: 768px) {
          .profile-page {
            padding: 1rem;
          }
          
          .info-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};


// Chat Widget Component
const ChatWidget = ({ isOpen, setIsOpen, messages, input, setInput, onSend }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="chat-widget">
      {!isOpen ? (
        <button className="chat-toggle" onClick={() => setIsOpen(true)}>
          <MessageCircle className="chat-icon" />
        </button>
      ) : (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-info">
              <MessageCircle className="chat-header-icon" />
              <span>AI Assistant</span>
            </div>
            <button className="chat-close" onClick={() => setIsOpen(false)}>
              <X className="close-icon" />
            </button>
          </div>
          
          <div className="chat-messages">
            {messages.map(message => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-content">
                  {message.text}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            ))}
          </div>
          
          <div className="chat-input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="chat-input"
            />
            <button onClick={onSend} className="chat-send">
              <Send className="send-icon" />
            </button>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .chat-widget {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 1000;
        }
        
        .chat-toggle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(255, 65, 108, 0.4);
          transition: all 0.3s ease;
          animation: pulse 2s infinite;
        }
        
        .chat-toggle:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(255, 65, 108, 0.6);
        }
        
        .chat-icon {
          width: 24px;
          height: 24px;
          color: white;
        }
        
        .chat-window {
          width: 350px;
          height: 500px;
          background: rgba(10, 35, 66, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideInFromRight 0.3s ease;
        }
        
        .chat-header {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .chat-header-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: white;
          font-weight: 600;
        }
        
        .chat-header-icon {
          width: 20px;
          height: 20px;
          color: #FF416C;
        }
        
        .chat-close {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.3s ease;
        }
        
        .chat-close:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }
        
        .close-icon {
          width: 18px;
          height: 18px;
        }
        
        .chat-messages {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .message {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .message.user {
          align-items: flex-end;
        }
        
        .message.bot {
          align-items: flex-start;
        }
        
        .message-content {
          max-width: 80%;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-size: 0.9rem;
          line-height: 1.4;
        }
        
        .message.user .message-content {
          background: linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%);
          color: white;
        }
        
        .message.bot .message-content {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        
        .message-time {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          padding: 0 0.5rem;
        }
        
        .chat-input-container {
          padding: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          gap: 0.5rem;
        }
        
        .chat-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 0.75rem;
          color: white;
          font-size: 0.9rem;
        }
        
        .chat-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
        
        .chat-input:focus {
          outline: none;
          border-color: #FF416C;
          box-shadow: 0 0 0 2px rgba(255, 65, 108, 0.2);
        }
        
        .chat-send {
          background: linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%);
          border: none;
          border-radius: 8px;
          padding: 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        
        .chat-send:hover {
          transform: scale(1.05);
        }
        
        .send-icon {
          width: 16px;
          height: 16px;
          color: white;
        }
        
        @media (max-width: 768px) {
          .chat-widget {
            bottom: 1rem;
            right: 1rem;
          }
          
          .chat-window {
            width: calc(100vw - 2rem);
            max-width: 350px;
          }
        }
      `}</style>
    </div>
  );
};

// About Page Component
const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <div className="about-header">
          <h1 className="about-title">About TouristGuard</h1>
          <p className="about-subtitle">Revolutionizing tourist safety through cutting-edge technology</p>
        </div>
        
        <div className="about-content">
          <div className="about-section">
            <h2>Our Mission</h2>
            <p>We are dedicated to ensuring the safety and security of tourists worldwide through innovative technology solutions. Our platform combines blockchain security, AI assistance, and real-time emergency response to create a comprehensive safety ecosystem.</p>
          </div>
          
          <div className="about-section">
            <h2>Why Choose TouristGuard?</h2>
            <div className="features-list">
              <div className="feature-item">
                <Shield className="feature-icon" />
                <div>
                  <h3>Blockchain Security</h3>
                  <p>Immutable digital identity verification system</p>
                </div>
              </div>
              <div className="feature-item">
                <Globe className="feature-icon" />
                <div>
                  <h3>Global Coverage</h3>
                  <p>24/7 support in over 50 languages worldwide</p>
                </div>
              </div>
              <div className="feature-item">
                <Users className="feature-icon" />
                <div>
                  <h3>Community Driven</h3>
                  <p>Connect with fellow travelers and local guides</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .about-page {
          padding: 2rem;
          min-height: calc(100vh - 80px);
        }
        
        .about-container {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .about-header {
          text-align: center;
          margin-bottom: 3rem;
          animation: fadeInUp 0.8s ease;
        }
        
        .about-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .about-subtitle {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.8);
        }
        
        .about-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .about-section {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 2rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          animation: fadeInUp 0.8s ease;
        }
        
        .about-section h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: white;
        }
        
        .about-section p {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.7;
        }
        
        .features-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 1rem;
        }
        
        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        
        .feature-icon {
          width: 24px;
          height: 24px;
          color: #FF416C;
          margin-top: 0.25rem;
        }
        
        .feature-item h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: white;
          margin-bottom: 0.5rem;
        }
        
        .feature-item p {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }
      `}</style>
    </div>
  );
};

// Help Page Component
const HelpPage = () => {
  const [activeTab, setActiveTab] = useState('faq');

  const faqs = [
    {
      question: "How does the Smart Panic Button work?",
      answer: "The Smart Panic Button instantly sends your location and tourist ID to our emergency response center. It works even with limited network connectivity and triggers immediate assistance protocols."
    },
    {
      question: "Is my data secure with blockchain verification?",
      answer: "Yes, your digital tourist ID is stored on a secure blockchain network, making it tamper-proof and instantly verifiable by authorized personnel worldwide."
    },
    {
      question: "Can I use TouristGuard offline?",
      answer: "Core safety features work offline, including the panic button and stored emergency contacts. However, AI assistance and real-time updates require internet connectivity."
    }
  ];

  return (
    <div className="help-page">
      <div className="help-container">
        <div className="help-header">
          <h1 className="help-title">Help Center</h1>
          <p className="help-subtitle">Get the support you need, when you need it</p>
        </div>
        
        <div className="help-tabs">
          <button 
            className={`tab-button ${activeTab === 'faq' ? 'active' : ''}`}
            onClick={() => setActiveTab('faq')}
          >
            FAQ
          </button>
          <button 
            className={`tab-button ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            Contact Us
          </button>
          <button 
            className={`tab-button ${activeTab === 'emergency' ? 'active' : ''}`}
            onClick={() => setActiveTab('emergency')}
          >
            Emergency
          </button>
        </div>
        
        <div className="help-content">
          {activeTab === 'faq' && (
            <div className="faq-section">
              <h2>Frequently Asked Questions</h2>
              {faqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'contact' && (
            <div className="contact-section">
              <h2>Contact Information</h2>
              <div className="contact-methods">
                <div className="contact-item">
                  <Phone className="contact-icon" />
                  <div>
                    <h3>24/7 Support Hotline</h3>
                    <p>+1-800-TOURIST (868-7478)</p>
                  </div>
                </div>
                <div className="contact-item">
                  <MessageCircle className="contact-icon" />
                  <div>
                    <h3>Live Chat</h3>
                    <p>Available through our AI assistant</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'emergency' && (
            <div className="emergency-section">
              <h2>Emergency Procedures</h2>
              <div className="emergency-steps">
                <div className="step">
                  <span className="step-number">1</span>
                  <div>
                    <h3>Press the Smart Panic Button</h3>
                    <p>Your location and ID will be immediately transmitted to emergency services</p>
                  </div>
                </div>
                <div className="step">
                  <span className="step-number">2</span>
                  <div>
                    <h3>Stay Calm and Safe</h3>
                    <p>Move to a safe location if possible and wait for assistance</p>
                  </div>
                </div>
                <div className="step">
                  <span className="step-number">3</span>
                  <div>
                    <h3>Follow Instructions</h3>
                    <p>Emergency responders will contact you with further instructions</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .help-page {
          padding: 2rem;
          min-height: calc(100vh - 80px);
        }
        
        .help-container {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .help-header {
          text-align: center;
          margin-bottom: 2rem;
          animation: fadeInUp 0.8s ease;
        }
        
        .help-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .help-subtitle {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.8);
        }
        
        .help-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.5rem;
          border-radius: 12px;
        }
        
        .tab-button {
          flex: 1;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          padding: 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }
        
        .tab-button:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
        }
        
        .tab-button.active {
          background: linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%);
          color: white;
        }
        
        .help-content {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 2rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          animation: fadeInUp 0.8s ease 0.2s both;
        }
        
        .help-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: white;
        }
        
        .faq-item {
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .faq-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        
        .faq-item h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #FF416C;
        }
        
        .faq-item p {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
        }
        
        .contact-methods {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .contact-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
        }
        
        .contact-icon {
          width: 24px;
          height: 24px;
          color: #FF416C;
          margin-top: 0.25rem;
        }
        
        .contact-item h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: white;
        }
        
        .contact-item p {
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
        }
        
        .emergency-steps {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .step {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
        }
        
        .step-number {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }
        
        .step h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: white;
        }
        
        .step p {
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
        }
        
        @media (max-width: 768px) {
          .help-tabs {
            flex-direction: column;
          }
          
          .contact-methods {
            gap: 1rem;
          }
          
          .contact-item, .step {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Shield className="footer-icon" />
          <span>TouristGuard</span>
        </div>
        <p className="footer-text">
          © 2024 TouristGuard. Keeping travelers safe worldwide.
        </p>
      </div>
      
      <style jsx>{`
        .footer {
          background: rgba(0, 0, 0, 0.2);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 2rem;
          margin-top: 3rem;
        }
        
        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }
        
        .footer-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 1.25rem;
          font-weight: 700;
          color: #FF416C;
          margin-bottom: 1rem;
        }
        
        .footer-icon {
          width: 24px;
          height: 24px;
        }
        
        .footer-text {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
        }
      `}</style>
    </footer>
  );
};

// Toast Component
const Toast = ({ message }) => {
  return (
    <div className="toast">
      {message}
      
      <style jsx>{`
        .toast {
          position: fixed;
          top: 100px;
          right: 2rem;
          background: rgba(34, 197, 94, 0.95);
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          z-index: 1001;
          animation: slideInFromRight 0.3s ease;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        @media (max-width: 768px) {
          .toast {
            left: 1rem;
            right: 1rem;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};


export default Hems;