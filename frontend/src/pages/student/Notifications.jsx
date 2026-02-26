import { useEffect, useState, useRef } from "react";
import API from "../../api";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  // ==========================================
  // FETCH UNREAD NOTIFICATIONS FROM DATABASE
  // ==========================================
  const fetchNotifications = async () => {
    try {
      const res = await API.get("decks/clusters/notifications/");
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  // ==========================================
  // CONNECT WEBSOCKET (JWT AUTH)
  // ==========================================
  const connectWebSocket = () => {
    const token = localStorage.getItem("access");

    if (!token) {
      console.error("JWT token not found");
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(
      `${protocol}://localhost:8000/ws/notifications/?token=${token}`
    );

    ws.onopen = () => console.log("Connected to notifications WebSocket");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Live notification received:", data);
      fetchNotifications();
    };

    ws.onerror = (error) => console.error("WebSocket error:", error);
    ws.onclose = () => console.log("WebSocket disconnected");

    socketRef.current = ws;
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================
  useEffect(() => {
    fetchNotifications();
    connectWebSocket();

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  // ==========================================
  // MARK AS READ
  // ==========================================
  const markAsRead = async (id) => {
    try {
      await API.post(`decks/clusters/notifications/${id}/read/`);
      fetchNotifications(); // Refresh from DB after marking read
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  // ==========================================
  // UI
  // ==========================================
  return (
    <div>
      {/* Header Section */}
      <div className="flex-row" style={{ justifyContent: "space-between", marginBottom: "2rem" }}>
        <h1 className="page-title" style={{ margin: 0 }}>Unread Responses</h1>
        {notifications.length > 0 && (
          <span className="slide-badge" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>
            {notifications.length} New
          </span>
        )}
      </div>

      {/* Empty State */}
      {notifications.length === 0 && (
        <div className="list-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: "#a1a5b7", marginBottom: "1rem" }}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <h3 style={{ color: "#3f4254", margin: "0 0 0.5rem 0" }}>You're all caught up!</h3>
          <p style={{ color: "#7e8299", margin: 0 }}>You have no unread teacher responses at the moment.</p>
        </div>
      )}

      {/* Notification Cards */}
      <div className="notification-list">
        {notifications.map((notif) => (
          <div key={notif.id} className="notification-card">
            
            <div className="notif-header">
              <div className="notif-meta">
                <h4 className="notif-deck">{notif.deck_name}</h4>
                <span className="notif-module">{notif.module_name}</span>
              </div>
              <button className="btn btn-secondary" style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem" }} onClick={() => markAsRead(notif.id)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Mark as Read
              </button>
            </div>

            <div className="notif-body">
              <div className="notif-summary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3699ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                {notif.summary}
              </div>
              <p className="notif-response">{notif.teacher_response}</p>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

export default Notifications;
