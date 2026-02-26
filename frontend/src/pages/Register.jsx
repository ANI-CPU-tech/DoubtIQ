import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "student",
  });

  const handleRegister = async () => {
    try {
      await API.post("register/", form);
      alert("Registered Successfully");
      navigate("/");
    } catch {
      alert("Registration Failed. Please try again.");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">Create an Account</h2>
        <p className="auth-subtitle">Join us to start learning or teaching.</p>

        <div className="auth-form">
          <div className="input-group">
            <label htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              className="auth-input"
              placeholder="Choose a username"
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              className="auth-input"
              placeholder="name@example.com"
              type="email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              className="auth-input"
              placeholder="Create a strong password"
              type="password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label htmlFor="reg-role">I am a...</label>
            <select
              id="reg-role"
              className="auth-select"
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              defaultValue="student"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <button className="auth-button" onClick={handleRegister}>
            Create Account
          </button>
        </div>

        <div className="auth-links">
          Already have an account? <Link to="/">Sign in here</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
