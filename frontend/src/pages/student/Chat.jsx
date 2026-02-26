import { useEffect, useState, useRef } from "react";
import API from "../../api";

function Chat({ moduleFileId, currentPage }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);
  const chatEndRef = useRef(null); // Used to auto-scroll

  useEffect(() => {
    if (!moduleFileId) return;
    connectWebSocket();
    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [moduleFileId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const connectWebSocket = () => {
    const token = localStorage.getItem("access");
    if (!token) return;

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(
      `${protocol}://localhost:8000/ws/modulefile/${moduleFileId}/?token=${token}`
    );

    ws.onopen = () => console.log("Module chat connected");
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [
        ...prev,
        { type: "teacher", summary: data.summary, text: data.teacher_response },
      ]);
    };

    ws.onclose = () => console.log("Module chat disconnected");
    socketRef.current = ws;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      await API.post(`decks/clusters/modules/${moduleFileId}/submit/`, {
        text: input,
        slide_number: currentPage,
      });

      setMessages((prev) => [
        ...prev,
        { type: "student", text: input, slide: currentPage },
      ]);
      setInput("");
    } catch (err) {
      console.error("Failed to submit doubt", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="chat-section">
      {/* Header */}
      <div className="chat-header">
        <h3 className="chat-title">ClarifAI Assistant</h3>
        <span className="slide-badge">Slide {currentPage}</span>
      </div>

      {/* Messages Area */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#a1a5b7', marginTop: '2rem' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '1rem', opacity: 0.5 }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <p>Ask a question about this slide.<br/>The AI teacher will help you out!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`chat-bubble ${msg.type}`}>
              {msg.type === "student" ? (
                <>
                  <div className="chat-bubble-label">You (Slide {msg.slide})</div>
                  <div>{msg.text}</div>
                </>
              ) : (
                <>
                  <div className="chat-bubble-label" style={{ color: '#3699ff' }}>Teacher AI</div>
                  <span className="chat-bubble-summary">{msg.summary}</span>
                  <div>{msg.text}</div>
                </>
              )}
            </div>
          ))
        )}
        {/* Invisible div to target for auto-scrolling */}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <input
          type="text"
          className="input-field chat-input"
          placeholder="Type your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button className="btn btn-primary" onClick={handleSend} style={{ padding: '0 1.25rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Chat;
