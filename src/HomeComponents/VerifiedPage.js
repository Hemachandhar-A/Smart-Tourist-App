import { CheckCircle } from 'lucide-react';
// Verified Page Component
const VerifiedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="text-center space-y-6 animate-fade-in">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <CheckCircle 
              className="relative text-green-500 animate-scale-in" 
              size={120} 
              strokeWidth={2.5}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 animate-slide-up">
            Verified
          </h1>
          <p className="text-xl text-gray-600 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Identity Successfully Confirmed
          </p>
        </div>
        
        <div className="pt-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 border-2 border-green-200 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-green-700">
              Blockchain Verified
            </span>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scale-in {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out both;
        }
      `}</style>
    </div>
  );
};

export default VerifiedPage;