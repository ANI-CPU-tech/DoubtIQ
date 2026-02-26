import { useEffect, useState } from "react";
import api from "../../api";
import "./TeacherApp.css"; // Ensure your Teacher CSS is imported!

function DeckCodes() {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null); // Tracks which code was just copied

  useEffect(() => {
    fetchDeckCodes();
  }, []);

  const fetchDeckCodes = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/decks/teacher/deck-codes/");
      setDecks(res.data.decks);

    } catch (err) {
      console.error(err);
      setError("Failed to load deck codes.");
    } finally {
      setLoading(false);
    }
  };

  // UX Upgrade: Copy code to clipboard
  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000); // Revert the button text after 2 seconds
  };

  if (loading) return <div className="page-title">Loading deck codes...</div>;
  if (error) return <div className="page-title" style={{ color: "#f1416c" }}>{error}</div>;

  return (
    <div>
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="brand-title">Deck Access Codes</h1>
        <p className="brand-subtitle">Share these unique codes with your students so they can join your decks.</p>
      </div>

      {/* Empty State */}
      {decks.length === 0 ? (
        <div className="list-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: "#a1a5b7", marginBottom: "1rem" }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <h3 style={{ color: "#3f4254", margin: "0 0 0.5rem 0" }}>No Decks Yet</h3>
          <p style={{ color: "#7e8299", margin: 0 }}>Create a deck first to generate access codes for your students.</p>
        </div>
      ) : (
        /* Codes List */
        <div className="list-card">
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {decks.map((deck) => (
              <div 
                key={deck.id} 
                className="flex-row" 
                style={{ 
                  justifyContent: "space-between", 
                  background: "#f8fafc", 
                  padding: "1.25rem 1.5rem", 
                  borderRadius: "8px", 
                  border: "1px solid #eff2f5" 
                }}
              >
                {/* Deck Info */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <strong style={{ color: "#181c32", fontSize: "1.1rem" }}>{deck.name}</strong>
                  <span style={{ color: "#7e8299", fontSize: "0.85rem" }}>Provide this code to grant access</span>
                </div>

                {/* Code and Copy Button */}
                <div className="flex-row" style={{ gap: "1rem" }}>
                  <div style={{ 
                    background: "#eee5ff", 
                    color: "#8950fc", 
                    padding: "0.5rem 1rem", 
                    borderRadius: "6px", 
                    fontFamily: "monospace", 
                    fontSize: "1.2rem", 
                    fontWeight: "700",
                    letterSpacing: "2px"
                  }}>
                    {deck.deck_code}
                  </div>
                  
                  <button 
                    className={copiedId === deck.id ? "btn btn-primary" : "btn btn-secondary"}
                    onClick={() => handleCopy(deck.deck_code, deck.id)}
                    style={{ minWidth: "110px" }}
                  >
                    {copiedId === deck.id ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.4rem" }}><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.4rem" }}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DeckCodes;
