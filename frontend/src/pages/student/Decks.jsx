import { useState, useEffect } from "react";
import API from "../../api";
import { Document, Page, pdfjs } from "react-pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url";
import Chat from "./Chat";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

function StudentDecks() {
  const [activeTab, setActiveTab] = useState("decks");
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [modules, setModules] = useState([]);
  const [deckCode, setDeckCode] = useState("");

  const [modulePDFs, setModulePDFs] = useState({});
  const [expandedModuleId, setExpandedModuleId] = useState(null);

  const [selectedPDF, setSelectedPDF] = useState(null);
  const [selectedModuleFileId, setSelectedModuleFileId] = useState(null);

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    fetchJoinedDecks();
  }, []);

  const fetchJoinedDecks = async () => {
    try {
      const res = await API.get("decks/joined/");
      setDecks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinDeck = async () => {
    if (!deckCode.trim()) {
      alert("Please enter a deck code.");
      return;
    }
    try {
      await API.post("decks/join/", { deck_code: deckCode });
      setDeckCode("");
      fetchJoinedDecks();
    } catch (err) {
      console.error(err);
      alert("Failed to join deck. Please check the code.");
    }
  };

  const handleLeaveDeck = async (deckId) => {
    if (!window.confirm("Are you sure you want to leave this deck?")) return;
    try {
      await API.post(`decks/leave/${deckId}/`);
      setSelectedDeck(null);
      fetchJoinedDecks();
    } catch (err) {
      console.error(err);
      alert("Failed to leave deck");
    }
  };

  const selectDeck = async (deck) => {
    setSelectedDeck(deck);
    try {
      const res = await API.get(`decks/${deck.id}/modules/`);
      setModules(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchModulePDFs = async (moduleId) => {
    try {
      const res = await API.get(`decks/modules/${moduleId}/converted-pdfs/`);
      setModulePDFs((prev) => ({
        ...prev,
        [moduleId]: res.data.converted_pdfs,
      }));
      setExpandedModuleId(moduleId);
    } catch (err) {
      console.error(err);
      alert("Failed to load PDFs");
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  // 1. If a PDF is selected, show the split-screen Workspace
  if (selectedPDF) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        
        <div className="workspace-container">
          {/* LEFT SIDE: PDF Viewer */}
          <div className="pdf-section">
            <div className="pdf-header">
              <h2 className="page-title" style={{ margin: 0 }}>Document Viewer</h2>
              <button className="btn btn-secondary" onClick={() => {
                setSelectedPDF(null);
                setSelectedModuleFileId(null);
              }}>
                ← Back to Decks
              </button>
            </div>

            <Document file={selectedPDF} onLoadSuccess={onDocumentLoadSuccess}>
              <Page pageNumber={pageNumber} width={700} renderTextLayer={false} renderAnnotationLayer={false} />
            </Document>

            <div className="pdf-controls">
              <button className="btn btn-secondary" disabled={pageNumber <= 1} onClick={() => setPageNumber(pageNumber - 1)}>
                Previous
              </button>
              <span className="page-indicator">Page {pageNumber} of {numPages || '-'}</span>
              <button className="btn btn-primary" disabled={pageNumber >= numPages} onClick={() => setPageNumber(pageNumber + 1)}>
                Next
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: Chat Assistant */}
          <Chat moduleFileId={selectedModuleFileId} currentPage={pageNumber} />
        </div>
      </div>
    );
  }

  // 2. Default View: Shows Deck list
  return (
    <div>
      <h1 className="page-title">My Learning Decks</h1>

      {/* Join Deck Card */}
      <div className="kpi-section" style={{ maxWidth: '600px', marginBottom: '2rem' }}>
        <h3 className="deck-title" style={{ fontSize: '1.1rem' }}>Join a New Deck</h3>
        <div className="flex-row" style={{ marginTop: '1rem' }}>
          <input
            className="input-field"
            style={{ flex: 1 }}
            placeholder="Enter Deck Code (e.g. MATH101)"
            value={deckCode}
            onChange={(e) => setDeckCode(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleJoinDeck}>Join Deck</button>
        </div>
      </div>

      <div className="deck-grid">
        {decks.map((deck) => (
          <div key={deck.id} className="deck-card">
            <h4 className="deck-title">{deck.name}</h4>
            
            <div className="deck-actions">
              <button className="btn btn-primary" onClick={() => selectDeck(deck)}>Open Modules</button>
              <button className="btn btn-danger" onClick={() => handleLeaveDeck(deck.id)}>Leave</button>
            </div>

            {/* Render modules only if this deck is selected */}
            {selectedDeck?.id === deck.id && (
              <div className="module-list">
                {modules.map((module) => (
                  <div key={module.id}>
                    <div className="module-item">
                      <span className="module-title">{module.title}</span>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => fetchModulePDFs(module.id)}>
                        View Files
                      </button>
                    </div>

                    {/* Show files if this module is expanded */}
                    {expandedModuleId === module.id && modulePDFs[module.id] && (
                      <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '8px', marginTop: '0.5rem' }}>
                        {modulePDFs[module.id].map((file) => (
                          <div key={file.file_id} className="flex-row" style={{ justifyContent: 'space-between', padding: '0.5rem' }}>
                            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>PDF Document</span>
                            <button
                              className="btn btn-primary"
                              style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
                              onClick={() => {
                                setSelectedPDF(`http://localhost:8000${file.converted_pdf}`);
                                setSelectedModuleFileId(file.file_id);
                              }}
                            >
                              Open Viewer
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentDecks;
