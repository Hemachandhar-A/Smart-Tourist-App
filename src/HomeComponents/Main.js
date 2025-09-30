import React, { useState, useEffect } from 'react';
import {Users, Globe, Calendar, AlertTriangle, QrCode } from 'lucide-react';
import AdminApp from '../AdminPages/admin.js';
import Navbar from './Navbar.js';
import ProfilePage from './ProfilePage.js';
// import HomePage from './HomePage.js';
import ChatWidget from './ChatWidget.js';
import AboutPage from './AboutPage.js';
import HelpPage from './HelpPage.js';
import Footer from './Footer.js';
import Toast from './Toast.js';
import SmartMain from '../SmartTravelZones/SmartMain.js';
import { Link } from 'lucide-react';

// Main App Component
const Main = () => {
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
const API_BASE_URL = 'https://smart-tourist-app-backend.onrender.com';

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
      case 'smart':
        return <SmartMain />;
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
    title: "Interactive Safety Map",
    link : '/smart',
    description: "Real-time map showing danger zones, safe areas, emergency services, and tourist hotspots with color-coded safety levels"
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
            target="_self"
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




export default Main;