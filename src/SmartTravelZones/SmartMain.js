
import React from 'react';
import { useNavigate } from 'react-router-dom';
import SmartTravelZones from './SmartTravelZones';

function SmartMain() {
  const navigate = useNavigate();

  return (
    <div className="app">
      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate('/main')}>
        ⬅ Back to Home
      </button>

      <div className="background-carousel">
        <div className="background-slides">
          <div className="background-slide slide-1"></div>
          <div className="background-slide slide-2"></div>
          <div className="background-slide slide-3"></div>
          <div className="background-slide slide-4"></div>
          <div className="background-slide slide-5"></div>
        </div>
      </div>
      
      <SmartTravelZones />
      
      <style jsx>{`
        .app {
          min-height: 100vh;
          position: relative;
          color: white;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          overflow-x: hidden;
          background: rgba(0, 0, 0, 0.4);
        }

        /* Back Button */
        .back-btn {
          position: absolute;
          top: 20px;
          left: 20px;
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
        }

        .back-btn:hover {
          background: rgba(255, 59, 48, 0.8);
          transform: scale(1.05);
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
      `}</style>
    </div>
  );
}

export default SmartMain;

