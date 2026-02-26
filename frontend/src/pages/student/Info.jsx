import { useEffect, useState } from "react";
import API from "../../api";

function Info() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("student/profile/");
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
        Loading Profile Details...
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="brand-title">Account Information</h1>
        <p className="brand-subtitle">Manage your personal details and settings.</p>
      </div>

      {profile && (
        <div className="profile-card">
          {/* Automatically generates an avatar based on their username */}
          <img 
            src={`https://ui-avatars.com/api/?name=${profile.username}&background=3699ff&color=fff&size=256`} 
            alt="Profile Avatar" 
            className="profile-avatar-large" 
          />

          <div className="profile-details">
            
            <div className="profile-field">
              <span className="profile-label">Account Role</span>
              <span className="role-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.5rem" }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                {profile.role}
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
