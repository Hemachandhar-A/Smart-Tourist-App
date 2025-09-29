import { useState } from "react";
import { Phone, MessageCircle } from "lucide-react";
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

export default HelpPage;