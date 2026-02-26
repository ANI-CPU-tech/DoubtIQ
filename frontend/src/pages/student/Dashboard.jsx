import { useEffect, useState } from "react";
import API from "../../api";

function Dashboard() {
  const [usernameMessage, setUsernameMessage] = useState("");
  const [joinedDecks, setJoinedDecks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const userRes = await API.get("student/login/");
      setUsernameMessage(userRes.data.message);

      const decksRes = await API.get("decks/joined/");
      setJoinedDecks(decksRes.data);

      const notifRes = await API.get("decks/clusters/notifications/");
      setNotifications(notifRes.data);
    } catch (err) {
      console.error("Failed to load dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-title">Loading Analytics...</div>;

  return (
    <div>
      <h1 className="page-title">ClarifAI Analytics Overview</h1>

      {/* METRICS CARDS (Like the top of Image 1) */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">Joined Decks</span>
            <span className="metric-value">{joinedDecks.length}</span>
          </div>
          <div className="metric-icon-wrap icon-blue">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">Pending Answers</span>
            <span className="metric-value">{notifications.length}</span>
          </div>
          <div className="metric-icon-wrap icon-green">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">Platform Status</span>
            <span className="metric-value" style={{fontSize: '1.5rem'}}>Online</span>
          </div>
          <div className="metric-icon-wrap icon-purple">
             <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
        </div>
      </div>

      {/* MAIN KPIs (Like the bottom left of Image 1) */}
      <div className="kpi-section">
        <h3 className="page-title" style={{fontSize: '1.2rem', marginBottom: '0'}}>Activity KPIs</h3>
        
        <div className="kpi-row">
          <div className="kpi-header">
            <span>Deck Engagement</span>
            <span>{joinedDecks.length > 0 ? 'Active' : '0%'}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{width: joinedDecks.length > 0 ? '75%' : '5%', backgroundColor: '#1bc5bd'}}></div>
          </div>
        </div>

        <div className="kpi-row">
          <div className="kpi-header">
            <span>Clarifications Resolved</span>
            <span>{notifications.length} Unread</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{width: notifications.length > 0 ? '40%' : '100%', backgroundColor: '#3699ff'}}></div>
          </div>
        </div>
      </div>

      {/* RECENT NOTIFICATIONS / TEACHER RESPONSES */}
      <h3 className="page-title" style={{fontSize: '1.2rem'}}>Recent Teacher Responses</h3>
      <div className="list-card">
        {notifications.length === 0 ? (
          <p style={{color: '#a1a5b7', margin: 0}}>No recent responses to show.</p>
        ) : (
          notifications.slice(0, 5).map((resp) => (
            <div key={resp.id} className="list-item">
              <div className="item-top">
                <span className="item-deck">{resp.deck_name}</span>
                <span className="item-module">{resp.module_name}</span>
              </div>
              <p className="item-summary">{resp.summary}</p>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default Dashboard;
