import { useEffect, useState } from "react";
import API from "../../api";
import "./TeacherApp.css"; // Ensure you import your styles!

function Info() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("teacher/profile/");
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-title" style={{ color: "#a1a5b7" }}>
        Loading Account Details...
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div className="dashboard-header">
        <h1 className="brand-title">Instructor Profile</h1>
        <p className="brand-subtitle">Manage your account details and teaching credentials.</p>
      </div>

      {profile && (
        <div className="profile-card">
          {/* Automatically generates an avatar based on their username, using the purple teacher theme */}
          <img 
            src={`https://ui-avatars.com/api/?name=${profile.username}&background=8950fc&color=fff&size=256`} 
            alt="Teacher Avatar" 
            className="profile-avatar-large" 
          />

          <div className="profile-details">
            
            <div className="profile-field">
              <span className="profile-label">Account Role</span>
              <span className="role-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.5rem" }}>
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                {profile.role || "Teacher"}
              </span>
            </div>

            <div className="profile-field">
              <span className="profile-label">Username</span>
              <div className="profile-value">
                {profile.username}
              </div>
            </div>

            <div className="profile-field">
              <span className="profile-label">Email Address</span>
              <div className="profile-value">
                {profile.email || "No email provided"}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default Info;
