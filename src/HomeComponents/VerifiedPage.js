import { CheckCircle, Shield, Lock, Database } from 'lucide-react';
import { useState, useEffect } from 'react';

const VerifiedPage = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="container">
      {/* Subtle grid background */}
      <div className="grid-overlay"></div>

      {/* Main Content */}
      <div className="content-wrapper">
        <div className="content-container">
          
          {/* Card Container */}
          <div className={`card ${mounted ? 'mounted' : ''}`}>
            
            {/* Content */}
            <div className="card-content">
              
              {/* Icon Section */}
              <div className="icon-section">
                <div className="icon-wrapper">
                  <div className="icon-background"></div>
                  <CheckCircle 
                    className="main-icon" 
                    size={64} 
                    strokeWidth={1.5}
                  />
                </div>
              </div>

              {/* Text Section */}
              <div className="text-section">
                <h1 className="title">Identity Verified</h1>
                <p className="subtitle">
                  Authentication complete
                </p>
              </div>

              {/* Details Grid */}
              <div className="details-grid">
                <div className="detail-item">
                  <Shield size={18} className="detail-icon" />
                  <div className="detail-content">
                    <div className="detail-label">Security</div>
                    <div className="detail-value">256-bit Encrypted</div>
                  </div>
                </div>
                
                <div className="detail-item">
                  <Database size={18} className="detail-icon" />
                  <div className="detail-content">
                    <div className="detail-label">Blockchain</div>
                    <div className="detail-value">Verified on Chain</div>
                  </div>
                </div>
                
                <div className="detail-item">
                  <Lock size={18} className="detail-icon" />
                  <div className="detail-content">
                    <div className="detail-label">Status</div>
                    <div className="detail-value">Authenticated</div>
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              <div className="timestamp">
                <div className="status-indicator"></div>
                <span>Verified at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .container {
          min-height: 100vh;
          position: relative;
          background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          opacity: 0.5;
        }

        .content-wrapper {
          position: relative;
          width: 100%;
          padding: 24px;
        }

        .content-container {
          max-width: 480px;
          margin: 0 auto;
        }

        .card {
          background: rgba(20, 20, 20, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 56px 40px;
          backdrop-filter: blur(20px);
          box-shadow: 
            0 4px 6px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.03);
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .card.mounted {
          opacity: 1;
          transform: translateY(0);
        }

        @media (max-width: 640px) {
          .card {
            padding: 40px 28px;
          }
        }

        .card-content {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .icon-section {
          display: flex;
          justify-content: center;
        }

        .icon-wrapper {
          position: relative;
          display: inline-flex;
          animation: fade-in 0.8s ease-out 0.2s both;
        }

        .icon-background {
          position: absolute;
          inset: -12px;
          background: radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%);
          border-radius: 50%;
        }

        .main-icon {
          position: relative;
          color: #22c55e;
          z-index: 1;
        }

        .text-section {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 8px;
          animation: fade-in 0.8s ease-out 0.4s both;
        }

        .title {
          font-size: 2rem;
          font-weight: 600;
          color: #ffffff;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        @media (max-width: 640px) {
          .title {
            font-size: 1.75rem;
          }
        }

        .subtitle {
          font-size: 0.95rem;
          color: #888888;
          font-weight: 400;
          letter-spacing: 0.01em;
        }

        .details-grid {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          overflow: hidden;
          animation: fade-in 0.8s ease-out 0.6s both;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px 20px;
          background: rgba(15, 15, 15, 0.6);
          transition: background 0.2s ease;
        }

        .detail-item:hover {
          background: rgba(20, 20, 20, 0.8);
        }

        .detail-icon {
          color: #666666;
          flex-shrink: 0;
        }

        .detail-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }

        .detail-label {
          font-size: 0.75rem;
          color: #666666;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
        }

        .detail-value {
          font-size: 0.9rem;
          color: #cccccc;
          font-weight: 400;
        }

        .timestamp {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding-top: 8px;
          font-size: 0.8rem;
          color: #666666;
          animation: fade-in 0.8s ease-out 0.8s both;
        }

        .status-indicator {
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse-subtle 2s ease-in-out infinite;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  );
};

export default VerifiedPage;