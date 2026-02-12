import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function login(e) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Invalid admin credentials");
        return;
      }

      // 🔐 Simple admin auth (dev mode)
      localStorage.setItem("isAdmin", "true");

      navigate("/admin/vendors");
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-page">
      <form className="admin-login-card" onSubmit={login}>
        <h2>Admin Login</h2>
        <p className="admin-login-subtitle">
          Restricted access — administrators only
        </p>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="admin-login-btn"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="admin-login-note">
          Healzone Admin Panel
        </div>
      </form>
    </div>
  );
}
