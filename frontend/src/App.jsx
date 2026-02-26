import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import API from "./api";

import Login from "./pages/Login";
import Register from "./pages/Register";

import TeacherLayout from "./layouts/TeacherLayout";
import StudentLayout from "./layouts/StudentLayout";

import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherDecks from "./pages/teacher/Decks";
import TeacherClusters from "./pages/teacher/Clusters";
import TeacherDeckCodes from "./pages/teacher/DeckCodes";
import TeacherInfo from "./pages/teacher/Info";

import StudentDashboard from "./pages/student/Dashboard";
import StudentDecks from "./pages/student/Decks";
import StudentInfo from "./pages/student/Info";
import StudentNotifications from "./pages/student/Notifications";

function GlobalLogout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      await API.post("logout/", { refresh });

      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      navigate("/");
    } catch {
      alert("Logout failed");
    }
  };

  // Hide logout on login/register page
  if (location.pathname === "/" || location.pathname === "/register") {
    return null;
  }

  // Notice: Removed the <div> and <hr />, and added a class name
  return (
    <button className="global-logout-btn btn btn-danger" onClick={handleLogout}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.4rem' }}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
      </svg>
      Logout
    </button>
  );
}

function App() {
  return (
    <Router>
      <GlobalLogout />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Teacher Routes */}
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="decks" element={<TeacherDecks />} />
          <Route path="clusters" element={<TeacherClusters />} />
          <Route path="deck-codes" element={<TeacherDeckCodes />} />
          <Route path="info" element={<TeacherInfo />} />
        </Route>

        {/* Student Routes */}
        <Route path="/student" element={<StudentLayout />}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="decks" element={<StudentDecks />} />
          <Route path="info" element={<StudentInfo />} />
          <Route path="notifications" element={<StudentNotifications />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
