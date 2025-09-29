import { Shield, Globe, Users } from "lucide-react";
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

export default AboutPage;