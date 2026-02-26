import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await API.post("login/", {
        username,
        password,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      const payload = JSON.parse(atob(res.data.access.split(".")[1]));
      const userId = payload.user_id;

      try {
        await API.get("teacher/login/");
        navigate("/teacher");
      } catch {
        navigate("/student");
      }
    } catch (err) {
      alert("Login Failed. Please check your credentials.");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Please enter your details to sign in.</p>
        
        <div className="auth-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              className="auth-input"
              placeholder="Enter your username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="auth-input"
              placeholder="••••••••"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="auth-button" onClick={handleLogin}>
            Sign In
          </button>
        </div>

        <div className="auth-links">
          Don't have an account? <Link to="/register">Create one now</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
