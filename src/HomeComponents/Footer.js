import { Shield } from "lucide-react";
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

export default Footer;