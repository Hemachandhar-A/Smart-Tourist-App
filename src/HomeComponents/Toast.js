
// Toast Component
const Toast = ({ message }) => {
  return (
    <div className="toast">
      {message}
      
      <style jsx>{`
        .toast {
          position: fixed;
          top: 100px;
          right: 2rem;
          background: rgba(34, 197, 94, 0.95);
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          z-index: 1001;
          animation: slideInFromRight 0.3s ease;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        @media (max-width: 768px) {
          .toast {
            left: 1rem;
            right: 1rem;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;