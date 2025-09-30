import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, AlertCircle, MapPin, Shield, Compass } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    userType: 'tourist'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentBg, setCurrentBg] = useState(0);

  const backgrounds = [
    'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&fit=crop',
    'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&fit=crop',
    'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&fit=crop',
    'https://images.pexels.com/photos/2325446/pexels-photo-2325446.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&fit=crop',
    'https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&fit=crop'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      if (!formData.username || !formData.password) {
        setError('Please fill in all fields');
        setIsLoading(false);
      } else {
        // Successful login - redirect based on user type
        if (formData.userType === 'tourist') {
          navigate('/main');
        } else {
          navigate('/admin');
        }
      }
    }, 1500);
  };

  return (
    <div className="login-container">
      {/* Dynamic Background */}
      <div className="background-slider">
        {backgrounds.map((bg, index) => (
          <div
            key={index}
            className={`background-slide ${index === currentBg ? 'active' : ''}`}
            style={{ backgroundImage: `url(${bg})` }}
          />
        ))}
      </div>
      
      <div className="background-overlay"></div>
      
      {/* Header Banner */}
      <div className="header-banner">
        <div className="banner-content">
          <div className="brand-section">
            <div className="brand-logo">
              <Compass className="brand-icon" />
              <span className="brand-name">B.R.A.V.O.</span>
            </div>
            <div className="brand-tagline">
              <span className="tagline-text">Explore • Experience • Excellence</span>
            </div>
          </div>
          <div className="nav-section">
            <span className="nav-item">Destinations</span>
            <span className="nav-item">Support</span>
          </div>
        </div>
      </div>

      {/* Login Card */}
      <div className="login-card">
        <div className="card-header">
          <div className="header-content">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Access your travel dashboard</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-alert">
              <AlertCircle className="error-icon" />
              <span className="error-text">{error}</span>
            </div>
          )}

          {/* User Type Selector */}
          <div className="user-type-section">
            <div className="section-label">Account Type</div>
            <div className="type-selector">
              <button
                type="button"
                className={`type-option ${formData.userType === 'tourist' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, userType: 'tourist' })}
              >
                <div className="option-icon">
                  <MapPin className="icon" />
                </div>
                <div className="option-content">
                  <span className="option-title">Tourist</span>
                  <span className="option-desc">Explore destinations</span>
                </div>
              </button>
              <button
                type="button"
                className={`type-option ${formData.userType === 'admin' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, userType: 'admin' })}
              >
                <div className="option-icon">
                  <Shield className="icon" />
                </div>
                <div className="option-content">
                  <span className="option-title">Admin</span>
                  <span className="option-desc">Manage platform</span>
                </div>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="form-section">
            <div className="input-group">
              <label className="input-label">Username</label>
              <div className="input-container">
                <User className="input-icon" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  className="form-input"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-container">
                <Lock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="form-input"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="toggle-icon" /> : <Eye className="toggle-icon" />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <span>Sign In</span>
            )}
          </button>

          {/* Footer */}
          <div className="form-footer">
            <p className="demo-text">Demo: Use any username/password combination</p>
          </div>
        </form>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0;
          position: relative;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .background-slider {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1;
        }

        .background-slide {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          opacity: 0;
          transition: opacity 2s ease-in-out;
          transform: scale(1.1);
        }

        .background-slide.active {
          opacity: 1;
        }

        .background-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(15, 23, 42, 0.85) 0%,
            rgba(30, 41, 59, 0.8) 50%,
            rgba(51, 65, 85, 0.75) 100%
          );
          backdrop-filter: blur(2px);
          z-index: 2;
        }

        .header-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          padding: 1rem 2rem;
        }

        .banner-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .brand-section {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .brand-icon {
          width: 32px;
          height: 32px;
          color: #3b82f6;
          animation: rotate 8s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .brand-name {
          font-size: 1.75rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.025em;
        }

        .brand-tagline {
          display: flex;
          align-items: center;
        }

        .tagline-text {
          font-size: 0.875rem;
          color: #94a3b8;
          font-weight: 500;
          letter-spacing: 0.05em;
        }

        .nav-section {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-item {
          font-size: 0.875rem;
          color: #cbd5e1;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .nav-item:hover {
          color: #3b82f6;
        }

        .login-card {
          position: relative;
          z-index: 5;
          width: 100%;
          max-width: 480px;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
          margin-top: 100px;
          overflow: hidden;
        }

        .card-header {
          padding: 2.5rem 2.5rem 1.5rem;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-bottom: 1px solid #e2e8f0;
        }

        .header-content {
          text-align: center;
        }

        .login-title {
          font-size: 2rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.5rem;
          letter-spacing: -0.025em;
        }

        .login-subtitle {
          font-size: 1rem;
          color: #64748b;
          font-weight: 500;
        }

        .login-form {
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .error-alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .error-icon {
          width: 20px;
          height: 20px;
          color: #dc2626;
          flex-shrink: 0;
        }

        .error-text {
          font-size: 0.875rem;
          color: #dc2626;
          font-weight: 500;
        }

        .user-type-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .section-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          letter-spacing: 0.025em;
        }

        .type-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .type-option {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: left;
        }

        .type-option:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .type-option.active {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border-color: #3b82f6;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.25);
        }

        .option-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .type-option.active .option-icon {
          background: rgba(255, 255, 255, 0.2);
        }

        .icon {
          width: 20px;
          height: 20px;
          color: #3b82f6;
          transition: color 0.3s ease;
        }

        .type-option.active .icon {
          color: white;
        }

        .option-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .option-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1f2937;
          transition: color 0.3s ease;
        }

        .type-option.active .option-title {
          color: white;
        }

        .option-desc {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .type-option.active .option-desc {
          color: rgba(255, 255, 255, 0.8);
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-left: 0.25rem;
        }

        .input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          width: 20px;
          height: 20px;
          color: #9ca3af;
          z-index: 1;
          transition: color 0.3s ease;
        }

        .form-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          color: #1f2937;
          font-size: 1rem;
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .form-input::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }

        .form-input:focus {
          outline: none;
          background: #ffffff;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .form-input:focus + .input-icon {
          color: #3b82f6;
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.2s ease;
          z-index: 1;
        }

        .password-toggle:hover {
          background: rgba(59, 130, 246, 0.1);
        }

        .toggle-icon {
          width: 20px;
          height: 20px;
          color: #6b7280;
          transition: color 0.2s ease;
        }

        .password-toggle:hover .toggle-icon {
          color: #3b82f6;
        }

        .submit-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          position: relative;
          overflow: hidden;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
        }

        .submit-btn:hover:not(:disabled)::before {
          left: 100%;
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .form-footer {
          text-align: center;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .demo-text {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .header-banner {
            padding: 1rem;
          }

          .banner-content {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .brand-section {
            flex-direction: column;
            gap: 0.5rem;
          }

          .nav-section {
            gap: 1.5rem;
          }

          .login-card {
            margin: 120px 1rem 2rem;
            max-width: none;
          }

          .card-header,
          .login-form {
            padding: 2rem;
          }

          .type-selector {
            grid-template-columns: 1fr;
          }

          .login-title {
            font-size: 1.75rem;
          }
        }

        @media (max-width: 480px) {
          .card-header,
          .login-form {
            padding: 1.5rem;
          }

          .brand-name {
            font-size: 1.5rem;
          }

          .nav-section {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;