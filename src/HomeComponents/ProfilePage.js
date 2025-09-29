import { User, QrCode, Phone, Edit } from "lucide-react";
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

export default ProfilePage;