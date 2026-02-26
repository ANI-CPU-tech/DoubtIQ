import { useEffect, useState } from "react";
import api from "../../api";
import "./TeacherApp.css"; // Ensure the new styles are imported

function Clusters() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeResponse, setActiveResponse] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClusters();
  }, []);

  const fetchClusters = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/decks/clusters/teacher/clusters/");

      setClusters(res.data);

      const initialResponses = {};
      res.data.forEach((cluster) => {
        initialResponses[cluster.id] = cluster.teacher_response || "";
      });

      setActiveResponse(initialResponses);
    } catch (err) {
      console.error(err);
      setError("Failed to load clusters.");
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async (clusterId) => {
    try {
      const res = await api.post(`/decks/clusters/${clusterId}/generate-summary/`);

      setClusters((prev) =>
        prev.map((cluster) =>
          cluster.id === clusterId
            ? { ...cluster, summary: res.data.summary }
            : cluster
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to generate summary");
    }
  };

  const generateAIResponse = async (clusterId) => {
    try {
      const res = await api.post(`/decks/clusters/${clusterId}/generate-ai-response/`);

      setActiveResponse((prev) => ({
        ...prev,
        [clusterId]: res.data.ai_generated_response,
      }));
    } catch (err) {
      console.error(err);
      alert("AI generation failed");
    }
  };

  const sendResponse = async (clusterId) => {
    const responseText = activeResponse[clusterId];

    if (!responseText || responseText.trim() === "") {
      alert("Response cannot be empty");
      return;
    }

    try {
      await api.post(`/decks/clusters/${clusterId}/respond/`, {
        teacher_response: responseText,
      });

      fetchClusters();
    } catch (err) {
      console.error(err);
      alert("Failed to send response");
    }
  };

  const deleteCluster = async (clusterId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this cluster?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/decks/clusters/${clusterId}/delete/`);

      setClusters((prev) => prev.filter((cluster) => cluster.id !== clusterId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete cluster");
    }
  };

  if (loading) return <div className="page-title">Loading doubt clusters...</div>;
  if (error) return <div className="page-title" style={{ color: "#f1416c" }}>{error}</div>;

  return (
    <div>
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="brand-title">Doubt Clusters</h1>
        <p className="brand-subtitle">Review grouped student questions, generate AI summaries, and send responses.</p>
      </div>

      {clusters.length === 0 ? (
        <div className="list-card" style={{ textAlign: "center", padding: "3rem" }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: "#a1a5b7", marginBottom: "1rem" }}>
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
          <h3 style={{ color: "#3f4254", margin: "0 0 0.5rem 0" }}>All clear!</h3>
          <p style={{ color: "#7e8299", margin: 0 }}>There are no active doubt clusters to resolve right now.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {clusters.map((cluster) => {
            const moduleData = typeof cluster.module === "object" ? cluster.module : null;
            const deckName = moduleData?.deck?.name ?? "Deck Info Not Available";
            const moduleTitle = moduleData?.title ?? (cluster.module ? `Module ID: ${cluster.module}` : "Unknown Module");

            return (
              <div key={cluster.id} className="list-card">
                
                {/* Cluster Top Bar */}
                <div className="flex-row" style={{ justifyContent: "space-between", borderBottom: "1px solid #eff2f5", paddingBottom: "1.25rem", marginBottom: "1.5rem" }}>
                  <div>
                    <h3 style={{ margin: "0 0 0.5rem 0", color: "#181c32", fontSize: "1.4rem" }}>{deckName}</h3>
                    <div className="flex-row" style={{ gap: "0.75rem" }}>
                      <span className="item-module">{moduleTitle}</span>
                      <span className="item-module" style={{ background: "#e1f0ff", color: "#3699ff" }}>Slide {cluster.slide_number}</span>
                      
                      <span style={{
                        fontSize: '0.8rem', fontWeight: '700', padding: '0.25rem 0.75rem', borderRadius: '20px',
                        backgroundColor: cluster.resolved ? '#c9f7f5' : '#ffe2e5',
                        color: cluster.resolved ? '#1bc5bd' : '#f1416c'
                      }}>
                        {cluster.resolved ? "Resolved ✅" : "Pending ⏳"}
                      </span>
                    </div>
                  </div>
                  
                  <button className="btn btn-danger" onClick={() => deleteCluster(cluster.id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.25rem" }}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    Delete
                  </button>
                </div>

                {/* Main Content Split: Doubts vs Summary */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", marginBottom: "1.5rem" }}>
                  
                  {/* Left Column: Student Doubts */}
                  <div style={{ flex: "1 1 300px" }}>
                    <strong style={{ color: "#3f4254", display: "block", marginBottom: "0.75rem" }}>Aggregated Doubts:</strong>
                    <ul style={{ color: "#5e6278", margin: 0, paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem", lineHeight: "1.5" }}>
                      {cluster.doubts?.map((doubt) => (
                        <li key={doubt.id}>{doubt.text}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Right Column: AI Summary */}
                  <div style={{ flex: "1 1 300px" }}>
                    <div className="flex-row" style={{ justifyContent: "space-between", marginBottom: "0.75rem" }}>
                      <strong style={{ color: "#3f4254" }}>AI Summary:</strong>
                      <button className="btn btn-secondary" style={{ padding: "0.3rem 0.8rem", fontSize: "0.8rem" }} onClick={() => generateSummary(cluster.id)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.4rem" }}><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                        Refresh Summary
                      </button>
                    </div>
                    <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #eff2f5", color: "#5e6278", lineHeight: "1.6", fontSize: "0.95rem" }}>
                      {cluster.summary || <span style={{ fontStyle: "italic", color: "#a1a5b7" }}>Summary has not been generated yet.</span>}
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Response Box */}
                <div style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "8px", border: "1px solid #eff2f5" }}>
                  <div className="flex-row" style={{ justifyContent: "space-between", marginBottom: "1rem" }}>
                    <strong style={{ color: "#3f4254" }}>Your Response:</strong>
                    <button className="btn btn-secondary" onClick={() => generateAIResponse(cluster.id)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.4rem" }}><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path></svg>
                      Draft with AI
                    </button>
                  </div>
                  
                  <textarea
                    className="input-field"
                    style={{ minHeight: "100px", resize: "vertical", fontFamily: "inherit", lineHeight: "1.5" }}
                    placeholder="Type your explanation here..."
                    value={activeResponse[cluster.id] || ""}
                    onChange={(e) =>
                      setActiveResponse((prev) => ({
                        ...prev,
                        [cluster.id]: e.target.value,
                      }))
                    }
                  />

                  <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => sendResponse(cluster.id)}
                      disabled={cluster.resolved}
                      style={{ opacity: cluster.resolved ? 0.6 : 1, cursor: cluster.resolved ? "not-allowed" : "pointer" }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.5rem" }}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                      {cluster.resolved ? "Response Sent" : "Send Response"}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Clusters;
