import { Link, Outlet, useLocation } from "react-router-dom";
import "../pages/student/StudentApp.css";

function StudentLayout() {
  const location = useLocation();

  const isActive = (path) => location.pathname.includes(path) ? "nav-item active" : "nav-item";

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        {/* Profile Header (Like Image 2) */}
        <div className="sidebar-header">
          <img 
            src="https://ui-avatars.com/api/?name=Student&background=3699ff&color=fff&size=128" 
            alt="Profile" 
            className="profile-img" 
          />
          <h3 className="profile-name">Student</h3>
        </div>

        {/* Navigation Links */}
        <ul className="sidebar-nav">
          <Link to="/student/dashboard" className={isActive("/student/dashboard")}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Dashboard
          </Link>
          
          <Link to="/student/decks" className={isActive("/student/decks")}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            My Decks
          </Link>

          <Link to="/student/info" className={isActive("/student/info")}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            Student Info
          </Link>

          <Link to="/student/notifications" className={isActive("/student/notifications")}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            Notifications
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

export default StudentLayout;
