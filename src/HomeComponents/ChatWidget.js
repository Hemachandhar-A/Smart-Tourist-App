import { MessageCircle, X, Send } from "lucide-react";

// Chat Widget Component
const ChatWidget = ({ isOpen, setIsOpen, messages, input, setInput, onSend }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="chat-widget">
      {!isOpen ? (
        <button className="chat-toggle" onClick={() => setIsOpen(true)}>
          <MessageCircle className="chat-icon" />
        </button>
      ) : (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-info">
              <MessageCircle className="chat-header-icon" />
              <span>AI Assistant</span>
            </div>
            <button className="chat-close" onClick={() => setIsOpen(false)}>
              <X className="close-icon" />
            </button>
          </div>
          
          <div className="chat-messages">
            {messages.map(message => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-content">
                  {message.text}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            ))}
          </div>
          
          <div className="chat-input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="chat-input"
            />
            <button onClick={onSend} className="chat-send">
              <Send className="send-icon" />
            </button>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .chat-widget {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 1000;
        }
        
        .chat-toggle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(255, 65, 108, 0.4);
          transition: all 0.3s ease;
          animation: pulse 2s infinite;
        }
        
        .chat-toggle:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(255, 65, 108, 0.6);
        }
        
        .chat-icon {
          width: 24px;
          height: 24px;
          color: white;
        }
        
        .chat-window {
          width: 350px;
          height: 500px;
          background: rgba(10, 35, 66, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideInFromRight 0.3s ease;
        }
        
        .chat-header {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .chat-header-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: white;
          font-weight: 600;
        }
        
        .chat-header-icon {
          width: 20px;
          height: 20px;
          color: #FF416C;
        }
        
        .chat-close {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.3s ease;
        }
        
        .chat-close:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }
        
        .close-icon {
          width: 18px;
          height: 18px;
        }
        
        .chat-messages {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .message {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .message.user {
          align-items: flex-end;
        }
        
        .message.bot {
          align-items: flex-start;
        }
        
        .message-content {
          max-width: 80%;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-size: 0.9rem;
          line-height: 1.4;
        }
        
        .message.user .message-content {
          background: linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%);
          color: white;
        }
        
        .message.bot .message-content {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        
        .message-time {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          padding: 0 0.5rem;
        }
        
        .chat-input-container {
          padding: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          gap: 0.5rem;
        }
        
        .chat-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 0.75rem;
          color: white;
          font-size: 0.9rem;
        }
        
        .chat-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
        
        .chat-input:focus {
          outline: none;
          border-color: #FF416C;
          box-shadow: 0 0 0 2px rgba(255, 65, 108, 0.2);
        }
        
        .chat-send {
          background: linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%);
          border: none;
          border-radius: 8px;
          padding: 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        
        .chat-send:hover {
          transform: scale(1.05);
        }
        
        .send-icon {
          width: 16px;
          height: 16px;
          color: white;
        }
        
        @media (max-width: 768px) {
          .chat-widget {
            bottom: 1rem;
            right: 1rem;
          }
          
          .chat-window {
            width: calc(100vw - 2rem);
            max-width: 350px;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatWidget;