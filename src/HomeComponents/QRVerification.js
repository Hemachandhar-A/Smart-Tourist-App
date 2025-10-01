import React from 'react';
import VerifiedPage from './VerifiedPage';
import { QRCodeSVG } from 'qrcode.react';

// QR Page Component

const QRPage = () => {
  const verificationUrl = `${window.location.origin}/verified`;
  
  return (
    <div style={{ minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '28rem', margin: '0 auto', backdropFilter: 'blur(100px)', borderRadius: '12px', display: 'flex', flexDirection: 'column',alignItems: 'center', justifyContent: 'center', padding: '1rem'}}>
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-12 transform transition-all duration-300 hover:scale-105">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Digital Tourist ID
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Scan to Verify Identity
            </p>
          </div>
          
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 sm:p-6 rounded-2xl shadow-inner">
              <QRCodeSVG
                value={verificationUrl}
                size={240}
                level="H"
                includeMargin={true}
                className="rounded-lg"
              />
            </div>
          </div>
          
          <div className="text-center space-y-3">
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              Blockchain-Secured Verification
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Active & Verified</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-white/70 px-4 " 
            style={{paddingTop: '25px', fontWeight:'bold'}}>
          <p>Present this QR code for instant verification</p>
        </div>
      </div>
    </div>
  );
};


// Main Router Component
const QRVerification = ({ route = 'qr' }) => {
  const [currentRoute, setCurrentRoute] = React.useState(route);
  
  // Handle navigation
  React.useEffect(() => {
    const handleNavigation = () => {
      const path = window.location.pathname;
      if (path.includes('/verified')) {
        setCurrentRoute('verified');
      } else if (path.includes('/qr')) {
        setCurrentRoute('qr');
      }
    };
    
    handleNavigation();
    window.addEventListener('popstate', handleNavigation);
    
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);
  
  return (
    <>
      {currentRoute === 'qr' && <QRPage />}
      {currentRoute === 'verified' && <VerifiedPage />}
    </>
  );
};

export default QRVerification;