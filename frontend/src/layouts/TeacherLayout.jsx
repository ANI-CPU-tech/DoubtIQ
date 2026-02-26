import { Link, Outlet, useLocation } from "react-router-dom";
import "../pages/teacher/TeacherApp.css";

function TeacherLayout() {
  const location = useLocation();
  const isActive = (path) => location.pathname.includes(path) ? "nav-item active" : "nav-item";

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <img 
            src="https://ui-avatars.com/api/?name=Teacher&background=8950fc&color=fff&size=128" 
            alt="Profile" 
            className="profile-img" 
          />
          <h3 className="profile-name">Teacher</h3>
        </div>

        {/* Navigation Links */}
        <ul className="sidebar-nav">
          <Link to="/teacher/dashboard" className={isActive("/teacher/dashboard")}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Dashboard
          </Link>
          
          <Link to="/teacher/decks" className={isActive("/teacher/decks")}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 17 22 12"></polyline></svg>
            Manage Decks
          </Link>

          <Link to="/teacher/clusters" className={isActive("/teacher/clusters")}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Doubt Clusters
          </Link>

          <Link to="/teacher/deck-codes" className={isActive("/teacher/deck-codes")}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            Deck Codes
          </Link>

          <Link to="/teacher/info" className={isActive("/teacher/info")}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            Account Info
          </Link>
        </ul>
      </aside>

      {/* DYNAMIC CONTENT AREA */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default TeacherLayout;
