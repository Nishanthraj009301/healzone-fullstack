import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.username || !form.password) {
    alert("Please enter username and password");
    return;
  }

  setLoading(true);

  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/doctors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    // Store admin flag - adjust field name based on your backend response
    localStorage.setItem("isAdmin", "true");  // Or: data.isAdmin || data.role === "admin"
    
    // Optionally store token or user data if your backend provides it
    // localStorage.setItem("adminToken", data.token);

    // Redirect to admin dashboard/vendors page
    navigate("/admin/vendors");

  } catch (err) {
    alert("Something went wrong");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="admin-login-page">
      <div className="admin-login-wrapper">

        {/* ===== LOGO ===== */}
        <img
          src="/healonelogo.png"
          alt="Healzone"
          className="admin-login-logo"
          onClick={() => navigate("/")}
        />

        {/* ===== CARD ===== */}
        <div className="admin-login-card">
          <h2>Admin Login</h2>
          <p className="admin-login-subtitle">
            Enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />

            <button
              type="submit"
              className="admin-login-btn"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="admin-login-note">
            Healzone Admin Panel
          </div>
        </div>

      </div>
    </div>
  );
}