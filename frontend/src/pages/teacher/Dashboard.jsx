import { useEffect, useState } from "react";
import API from "../../api";
import "./TeacherApp.css"; 

function Dashboard() {
  const [usernameMessage, setUsernameMessage] = useState("");
  const [createdDecks, setCreatedDecks] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const userRes = await API.get("teacher/login/");
      setUsernameMessage(userRes.data.message);

      const decksRes = await API.get("decks/created/");
      setCreatedDecks(decksRes.data);

      const clusterRes = await API.get("decks/clusters/teacher/clusters/");
      setClusters(clusterRes.data);

    } catch (err) {
      console.error("Failed to load teacher dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-title">Loading Teaching Analytics...</div>;

  const totalClusters = clusters.length;
  const pendingClusters = clusters.filter((c) => !c.resolved).length;
  
  // Calculate resolution rate for the KPI bar
  const resolutionRate = totalClusters === 0 
    ? 0 
    : Math.round(((totalClusters - pendingClusters) / totalClusters) * 100);

  return (
    <div>
      <h1 className="page-title">Instructor Analytics Overview</h1>

      {/* METRICS CARDS */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">Decks Created</span>
            <span className="metric-value">{createdDecks.length}</span>
          </div>
          <div className="metric-icon-wrap icon-blue">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">Total Clusters</span>
            <span className="metric-value">{totalClusters}</span>
          </div>
          <div className="metric-icon-wrap icon-purple">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">Pending Action</span>
            <span className="metric-value" style={{ color: pendingClusters > 0 ? '#f1416c' : '#181c32' }}>
              {pendingClusters}
            </span>
          </div>
          <div className="metric-icon-wrap icon-green">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
        </div>
      </div>

      {/* MAIN KPIs */}
      <div className="kpi-section">
        <h3 className="page-title" style={{fontSize: '1.2rem', marginBottom: '0'}}>Performance KPIs</h3>
        
        <div className="kpi-row">
          <div className="kpi-header">
            <span>Doubt Resolution Rate</span>
            <span>{resolutionRate}% Resolved</span>
          </div>
          <div className="progress-track">
            <div 
              className="progress-fill" 
              style={{ width: `${resolutionRate}%`, backgroundColor: resolutionRate > 80 ? '#1bc5bd' : '#8950fc' }}
            ></div>
          </div>
        </div>
      </div>

      {/* RECENT DOUBT CLUSTERS */}
      <h3 className="page-title" style={{fontSize: '1.2rem', marginTop: '2rem'}}>Recent Doubt Clusters</h3>
      <div className="list-card">
        {clusters.length === 0 ? (
          <p style={{color: '#a1a5b7', margin: 0}}>No clusters generated yet.</p>
        ) : (
          clusters.slice(0, 5).map((cluster) => (
            <div key={cluster.id} className="list-item">
              <div className="item-top">
                {/* Fallback title since Deck/Module are hidden */}
                <span className="item-deck" style={{ color: '#3f4254', fontSize: '1rem' }}>
                  Doubt Cluster #{cluster.id}
                </span>

                {/* Status Badge */}
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  backgroundColor: cluster.resolved ? '#c9f7f5' : '#ffe2e5',
                  color: cluster.resolved ? '#1bc5bd' : '#f1416c'
                }}>
                  {cluster.resolved ? "Resolved ✅" : "Pending ⏳"}
                </span>
              </div>
              
              <p className="item-summary" style={{ marginTop: '0.5rem' }}>
                {cluster.summary || "No summary generated yet."}
              </p>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default Dashboard;
