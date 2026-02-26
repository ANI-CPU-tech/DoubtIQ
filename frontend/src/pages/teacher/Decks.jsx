import { useState, useEffect } from "react";
import API from "../../api";
import "./TeacherApp.css"; 

function TeacherDecks() {
  const [activeTab, setActiveTab] = useState("decks");
  const [decks, setDecks] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [studentDeckId, setStudentDeckId] = useState(null);

  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckDescription, setNewDeckDescription] = useState("");
  const [editingDeckId, setEditingDeckId] = useState(null);

  const [modules, setModules] = useState([]);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleDescription, setNewModuleDescription] = useState("");
  const [editingModuleId, setEditingModuleId] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    const res = await API.get("decks/created/");
    setDecks(res.data);
  };

  // =========================
  // DECK CRUD
  // =========================
  const handleCreateDeck = async () => {
    if (!newDeckName) return alert("Deck name is required");
    await API.post("decks/create/", {
      name: newDeckName,
      description: newDeckDescription,
    });
    setNewDeckName("");
    setNewDeckDescription("");
    fetchDecks();
  };

  const handleDeleteDeck = async (id) => {
    if(!window.confirm("Are you sure you want to delete this deck?")) return;
    await API.delete(`decks/delete/${id}/`);
    if(selectedDeck?.id === id) setSelectedDeck(null);
    fetchDecks();
  };

  const handleUpdateDeck = async (id) => {
    await API.put(`decks/update/${id}/`, {
      name: newDeckName,
      description: newDeckDescription,
    });
    setEditingDeckId(null);
    setNewDeckName("");
    setNewDeckDescription("");
    fetchDecks();
  };

  const selectDeck = async (deck) => {
    setSelectedDeck(deck);
    const res = await API.get(`decks/${deck.id}/modules/`);
    setModules(res.data);
  };

  // =========================
  // MODULE CRUD
  // =========================
  const handleCreateModule = async () => {
    if (!newModuleTitle) return alert("Module title is required");
    await API.post(`decks/${selectedDeck.id}/modules/create/`, {
      title: newModuleTitle,
      description: newModuleDescription,
    });
    setNewModuleTitle("");
    setNewModuleDescription("");
    selectDeck(selectedDeck); // Refresh modules
  };

  const handleUpdateModule = async (id) => {
    await API.put(`decks/modules/${id}/update/`, {
      title: newModuleTitle,
      description: newModuleDescription,
    });
    setEditingModuleId(null);
    setNewModuleTitle("");
    setNewModuleDescription("");
    selectDeck(selectedDeck);
  };

  const handleDeleteModule = async (id) => {
    if(!window.confirm("Delete this module?")) return;
    await API.delete(`decks/modules/${id}/delete/`);
    selectDeck(selectedDeck);
  };

  // =========================
  // FILE UPLOAD
  // =========================
  const handleUploadFile = async (moduleId) => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await API.post(`decks/modules/${moduleId}/upload/`, formData, { 
        headers: { "Content-Type": "multipart/form-data" } 
      });
      setSelectedFile(null);
      
      // Reset the file input field visually
      document.getElementById(`file-upload-${moduleId}`).value = "";
      
      selectDeck(selectedDeck);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload file.");
    }
  };

  const handleDeleteFile = async (fileId) => {
    if(!window.confirm("Delete this file?")) return;
    await API.delete(`decks/module-files/${fileId}/delete/`);
    selectDeck(selectedDeck);
  };

  // =========================
  // STUDENTS
  // =========================
  const loadStudents = async (deckId) => {
    const res = await API.get(`decks/${deckId}/students/`);
    setStudents(res.data);
    setStudentDeckId(deckId);
    setActiveTab("students");
  };

  const handleKickStudent = async (studentId) => {
    if (!studentDeckId) return;
    if (!window.confirm("Are you sure you want to kick this student?")) return;

    try {
      await API.post(`decks/kick/${studentDeckId}/`, {
        student_id: studentId,
      });
      setStudents((prev) => prev.filter((student) => student.id !== studentId));
    } catch (err) {
      console.error(err);
      alert("Failed to kick student");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="brand-title">Course Management</h1>
        <p className="brand-subtitle">Create decks, manage modules, upload resources, and monitor enrolled students.</p>
      </div>

      {/* Custom Tabs */}
      <div className="tab-container">
        <button 
          className={`tab-btn ${activeTab === "decks" ? "active" : ""}`} 
          onClick={() => setActiveTab("decks")}
        >
          My Decks
        </button>
        <button 
          className={`tab-btn ${activeTab === "students" ? "active" : ""}`} 
          onClick={() => setActiveTab("students")}
        >
          Student Roster
        </button>
      </div>

      {/* =========================================
          DECKS TAB
          ========================================= */}
      {activeTab === "decks" && (
        <div>
          {/* Create/Edit Deck Form Card */}
          <div className="list-card" style={{ marginBottom: "2rem" }}>
            <h3 style={{ margin: "0 0 1rem 0", color: "#181c32" }}>
              {editingDeckId ? "Edit Deck Settings" : "Create a New Deck"}
            </h3>
            
            <div className="flex-row" style={{ flexWrap: "wrap" }}>
              <input
                className="input-field"
                style={{ flex: 1, minWidth: '200px' }}
                placeholder="Deck Name (e.g. Physics 101)"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
              />
              <input
                className="input-field"
                style={{ flex: 2, minWidth: '250px' }}
                placeholder="Description..."
                value={newDeckDescription}
                onChange={(e) => setNewDeckDescription(e.target.value)}
              />
              {editingDeckId ? (
                <button className="btn btn-primary" onClick={() => handleUpdateDeck(editingDeckId)}>Update Deck</button>
              ) : (
                <button className="btn btn-primary" onClick={handleCreateDeck}>Create Deck</button>
              )}
              
              {editingDeckId && (
                <button className="btn btn-secondary" onClick={() => {
                  setEditingDeckId(null);
                  setNewDeckName("");
                  setNewDeckDescription("");
                }}>Cancel</button>
              )}
            </div>
          </div>

          {/* Decks Grid */}
          <div className="deck-grid">
            {decks.map((deck) => (
              <div key={deck.id} className="deck-card">
                <h4 className="deck-title">{deck.name}</h4>
                <p className="deck-desc">{deck.description || "No description provided."}</p>

                <div className="deck-actions">
                  <button className="btn btn-primary" onClick={() => selectDeck(deck)}>Manage Modules</button>
                  <button className="btn btn-secondary" onClick={() => loadStudents(deck.id)}>Students</button>
                  <button className="btn btn-secondary" onClick={() => {
                    setEditingDeckId(deck.id);
                    setNewDeckName(deck.name);
                    setNewDeckDescription(deck.description);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDeleteDeck(deck.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>

          {/* =========================================
              MODULES SECTION (Now Restored!)
              ========================================= */}
          {selectedDeck && (
            <div className="list-card" style={{ marginTop: "2rem" }}>
              <div className="item-top" style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ margin: 0, color: "#181c32", fontSize: "1.5rem" }}>Modules for: {selectedDeck.name}</h3>
                <button className="btn btn-secondary" onClick={() => setSelectedDeck(null)}>Close Viewer</button>
              </div>

              {/* Module Creation Form */}
              <div style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "8px", marginBottom: "2rem", border: "1px solid #eff2f5" }}>
                <h4 style={{ margin: "0 0 1rem 0", color: "#3f4254" }}>
                  {editingModuleId ? "Edit Module" : "Add New Module"}
                </h4>
                <div className="flex-row" style={{ flexWrap: "wrap" }}>
                  <input
                    className="input-field"
                    style={{ flex: 1, minWidth: '200px' }}
                    placeholder="Module Title"
                    value={newModuleTitle}
                    onChange={(e) => setNewModuleTitle(e.target.value)}
                  />
                  <input
                    className="input-field"
                    style={{ flex: 2, minWidth: '250px' }}
                    placeholder="Module Description"
                    value={newModuleDescription}
                    onChange={(e) => setNewModuleDescription(e.target.value)}
                  />
                  {editingModuleId ? (
                    <button className="btn btn-primary" onClick={() => handleUpdateModule(editingModuleId)}>Update Module</button>
                  ) : (
                    <button className="btn btn-primary" onClick={handleCreateModule}>Create Module</button>
                  )}
                  {editingModuleId && (
                    <button className="btn btn-secondary" onClick={() => {
                      setEditingModuleId(null);
                      setNewModuleTitle("");
                      setNewModuleDescription("");
                    }}>Cancel</button>
                  )}
                </div>
              </div>

              {/* Modules List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {modules.length === 0 ? (
                  <p style={{ color: "#7e8299", fontStyle: "italic" }}>No modules created for this deck yet.</p>
                ) : (
                  modules.map((module) => (
                    <div key={module.id} style={{ border: "1px solid #eff2f5", borderRadius: "8px", padding: "1.5rem" }}>
                      
                      {/* Module Header */}
                      <div className="flex-row" style={{ justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                        <div>
                          <strong style={{ color: "#181c32", fontSize: "1.2rem", display: "block" }}>{module.title}</strong>
                          {module.description && <p style={{ color: "#7e8299", margin: "0.5rem 0 0 0" }}>{module.description}</p>}
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }} onClick={() => {
                            setEditingModuleId(module.id);
                            setNewModuleTitle(module.title);
                            setNewModuleDescription(module.description);
                          }}>Edit</button>
                          <button className="btn btn-danger" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }} onClick={() => handleDeleteModule(module.id)}>Delete</button>
                        </div>
                      </div>

                      {/* File Upload Section */}
                      <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
                        <strong style={{ display: "block", color: "#3f4254", marginBottom: "0.75rem", fontSize: "0.9rem" }}>Module Resources / PDFs</strong>
                        
                        {/* File List */}
                        {module.files && module.files.length > 0 ? (
                          <div style={{ marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {module.files.map((file) => (
                              <div key={file.id} className="flex-row" style={{ justifyContent: "space-between", background: "#ffffff", padding: "0.5rem 1rem", border: "1px solid #eff2f5", borderRadius: "6px" }}>
                                <span style={{ fontSize: "0.9rem", color: "#181c32" }}>📄 {file.file?.split('/').pop() || "Document"}</span>
                                <button className="btn btn-danger" style={{ padding: "0.2rem 0.6rem", fontSize: "0.8rem" }} onClick={() => handleDeleteFile(file.id)}>Remove</button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ fontSize: "0.85rem", color: "#a1a5b7", margin: "0 0 1rem 0" }}>No files uploaded yet.</p>
                        )}

                        {/* Upload Input */}
                        <div className="flex-row">
                          <input 
                            id={`file-upload-${module.id}`}
                            type="file" 
                            className="input-field" 
                            style={{ padding: "0.5rem", background: "#ffffff" }}
                            onChange={(e) => setSelectedFile(e.target.files[0])} 
                          />
                          <button className="btn btn-primary" onClick={() => handleUploadFile(module.id)}>Upload File</button>
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================
          STUDENTS TAB
          ========================================= */}
      {activeTab === "students" && (
        <div className="list-card">
          <h3 style={{ margin: "0 0 1.5rem 0", color: "#181c32" }}>Enrolled Students</h3>

          {students.length === 0 ? (
            <p style={{ color: "#7e8299", fontStyle: "italic" }}>No students found for this deck. Select "Students" on a deck card to view enrollment.</p>
          ) : (
            students.map((student) => (
              <div key={student.id} className="list-item" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <img src={`https://ui-avatars.com/api/?name=${student.username}&background=random&color=fff&size=40`} alt="avatar" style={{ borderRadius: "50%" }} />
                  <strong style={{ color: "#181c32", fontSize: "1.05rem" }}>{student.username}</strong>
                </div>

                <button className="btn btn-danger" onClick={() => handleKickStudent(student.id)}>
                  Kick Student
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default TeacherDecks;
