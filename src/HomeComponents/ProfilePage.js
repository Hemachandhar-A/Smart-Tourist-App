import { 
  User, QrCode, Phone, Edit, Mail, MapPin, Heart, AlertTriangle, Pill, Plus, X, Save 
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", relationship: "", phone: "" });
  const [addingContact, setAddingContact] = useState(false);

  const API_BASE_URL = "/api";

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/tourist-profile/`);
      setUserData(response.data);
    } catch (error) {
      console.warn("API not available, using fallback");
      const storedUser = localStorage.getItem("userData");
      if (storedUser) {
        setUserData(JSON.parse(storedUser));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.relationship || !newContact.phone) {
      alert("Please fill in all contact details");
      return;
    }

    try {
      setAddingContact(true);
      const response = await axios.post(`${API_BASE_URL}/emergency-contacts/`, newContact);
      setUserData(prev => ({
        ...prev,
        emergency_contacts: [...(prev.emergency_contacts || []), response.data],
      }));
      setNewContact({ name: "", relationship: "", phone: "" });
      setShowAddContact(false);
    } catch (error) {
      console.error("Error adding contact:", error);
    } finally {
      setAddingContact(false);
    }
  };

  if (loading) {
    return <p style={{ color: "white", textAlign: "center" }}>Loading...</p>;
  }

  if (!userData) {
    return <p style={{ color: "white", textAlign: "center" }}>No user data found</p>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <User className="avatar-icon" />
          </div>
          <h1 className="profile-name">{userData.full_name || userData.name}</h1>
          <p className="profile-id">Tourist ID: {userData.tourist_id || userData.touristId}</p>
        </div>

        <div className="profile-content">
          {/* Personal Info */}
          <div className="profile-section">
            <h2 className="section-title">Personal Information</h2>
            <div className="info-grid">
              <div className="info-item"><label>Full Name</label><span>{userData.full_name || userData.name}</span></div>
              <div className="info-item"><label>Gender</label><span>{userData.gender || "N/A"}</span></div>
              <div className="info-item"><label>Age</label><span>{userData.age ? `${userData.age} years` : "N/A"}</span></div>
              <div className="info-item"><label>Email</label><span><Mail size={16}/> {userData.email || "N/A"}</span></div>
              <div className="info-item"><label>Phone</label><span><Phone size={16}/> {userData.phone}</span></div>
              <div className="info-item"><label>Location</label><span><MapPin size={16}/> {userData.place}, {userData.state}</span></div>
            </div>
          </div>

          {/* Emergency Info */}
          <div className="profile-section">
            <h2 className="section-title">Emergency Information</h2>
            <div className="info-grid">
              <div className="info-item"><label>Blood Group</label><span><Heart size={16}/> {userData.emergency_info?.blood_group || "N/A"}</span></div>
              <div className="info-item"><label>Allergies</label><span><AlertTriangle size={16}/> {userData.emergency_info?.allergies || "None"}</span></div>
              <div className="info-item"><label>Medications</label><span><Pill size={16}/> {userData.emergency_info?.medications || "None"}</span></div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="profile-section">
            <h2 className="section-title">Emergency Contacts</h2>
            <div className="emergency-contacts">
              {userData.emergency_contacts?.map((contact, i) => (
                <div key={i} className="contact-item">
                  <Phone className="contact-icon" />
                  <div>
                    <label>{contact.name} ({contact.relationship})</label>
                    <span>{contact.phone}</span>
                  </div>
                </div>
              ))}
            </div>

            {!showAddContact ? (
              <button className="edit-button" onClick={() => setShowAddContact(true)}>
                <Plus size={18}/> Add New Contact
              </button>
            ) : (
              <div className="add-contact-form">
                <input type="text" placeholder="Full Name" value={newContact.name}
                  onChange={e => setNewContact({...newContact, name: e.target.value})}/>
                <select value={newContact.relationship}
                  onChange={e => setNewContact({...newContact, relationship: e.target.value})}>
                  <option value="">Relationship</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Friend">Friend</option>
                </select>
                <input type="tel" placeholder="Phone Number" value={newContact.phone}
                  onChange={e => setNewContact({...newContact, phone: e.target.value})}/>
                <div className="form-actions">
                  <button onClick={handleAddContact} disabled={addingContact} className="edit-button">
                    <Save size={16}/> {addingContact ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => setShowAddContact(false)} className="edit-button cancel">
                    <X size={16}/> Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* QR Code */}
          <div className="profile-section">
            <h2 className="section-title">QR Verification Code</h2>
            <div className="qr-container">
              <QrCode className="qr-icon" />
              <p>Scan this QR code for quick identity verification</p>
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .profile-page {
          padding: 2rem;
          min-height: 100vh;
          color: white;
        }
        .profile-container { max-width: 800px; margin: 0 auto; }
        .profile-header { text-align: center; margin-bottom: 3rem; }
        .profile-avatar {
          width: 120px; height: 120px; border-radius: 50%;
          background: linear-gradient(135deg, #FF416C, #FF4B2B);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1rem;
        }
        .avatar-icon { width: 60px; height: 60px; color: white; }
        .profile-name { font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; }
        .profile-id { font-size: 1rem; color: #FF416C; font-weight: 500; }

        .profile-content { display: flex; flex-direction: column; gap: 2rem; }
        .profile-section {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 2rem;
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          animation: fadeInUp 0.8s ease;
        }
        .section-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 1.5rem; }
        
        .info-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }
        .info-item {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .info-item label { font-weight: 500; color: rgba(255, 255, 255, 0.7); }
        .info-item span { font-weight: 600; color: white; display: flex; gap: 0.4rem; align-items: center; }

        .emergency-contacts { display: flex; flex-direction: column; gap: 1rem; }
        .contact-item {
          display: flex; gap: 1rem; align-items: center;
          background: rgba(255, 255, 255, 0.05);
          padding: 1rem; border-radius: 8px;
        }
        .contact-icon { color: #FF416C; }
        .contact-item label { font-size: 0.9rem; color: rgba(255, 255, 255, 0.7); }
        .contact-item span { font-weight: 600; color: white; }

        .add-contact-form {
          margin-top: 1rem;
          display: flex; flex-direction: column; gap: 0.8rem;
        }
        .add-contact-form input, .add-contact-form select {
          padding: 0.8rem;
          border-radius: 8px;
          border: none;
          background: rgba(255,255,255,0.1);
          color: white;
          outline: none;
        }
        .form-actions { display: flex; gap: 1rem; }
        .edit-button {
          background: linear-gradient(135deg, #FF416C, #FF4B2B);
          border: none; border-radius: 12px;
          padding: 0.8rem 1.5rem;
          color: white; font-weight: 600;
          display: flex; align-items: center; gap: 0.5rem;
          cursor: pointer;
          transition: 0.3s ease;
          margin-top: 1rem;
          align-self: flex-start;
        }
        .edit-button:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(255,65,108,0.3); }
        .edit-button.cancel { background: rgba(255,255,255,0.2); }

        .qr-container { text-align: center; padding: 2rem; }
        .qr-icon { width: 80px; height: 80px; color: #FF416C; margin-bottom: 1rem; }

        @media (max-width: 768px) {
          .info-grid { grid-template-columns: 1fr; }
          .info-item { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
