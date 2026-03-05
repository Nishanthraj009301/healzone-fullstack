import { useState, useContext } from "react";
import { GoogleLogin } from "@react-oauth/google";
import "./LoginModal.css";
import { AuthContext } from "../../context/AuthContext";

export default function LoginModal({ show, onClose, onSuccess }) {
  const { setUser } = useContext(AuthContext);
  const [mode, setMode] = useState("login");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    password: "",
  });

  if (!show) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /* ================= GOOGLE LOGIN ================= */
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/google/patient`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            token: credentialResponse.credential,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        const userRes = await fetch(
          `${process.env.REACT_APP_API_URL}/api/auth/me`,
          { credentials: "include" }
        );

        const userData = await userRes.json();
        setUser(userData.user);

        onClose();
        if (onSuccess) onSuccess();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Google login error:", error);
      alert("Google login failed");
    }
  };

  /* ================= LOGIN ================= */
  const handleLogin = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        const userRes = await fetch(
          `${process.env.REACT_APP_API_URL}/api/auth/me`,
          { credentials: "include" }
        );

        const userData = await userRes.json();
        setUser(userData.user);

        onClose();
        if (onSuccess) onSuccess();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong");
    }
  };

  /* ================= REGISTER ================= */
  const handleRegister = async () => {
    if (!formData.mobileNumber) {
      alert("Mobile number is required");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            mobileNumber: formData.mobileNumber,
            password: formData.password,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        const userRes = await fetch(
          `${process.env.REACT_APP_API_URL}/api/auth/me`,
          { credentials: "include" }
        );

        const userData = await userRes.json();
        setUser(userData.user);

        onClose();
        if (onSuccess) onSuccess();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Register error:", error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <span className="close-btn" onClick={onClose}>
          ✕
        </span>

        {/* LOGIN */}
        {mode === "login" && (
          <>
            <h2 className="modal-title">Welcome Back</h2>
            <p className="modal-subtitle">
              Login to continue to <strong>Healzone</strong>
            </p>

            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />

            <div className="forgot-link">
              <span onClick={() => setMode("forgot")}>
                Forgot Password?
              </span>
            </div>

            <div style={{ margin: "15px 0", textAlign: "center" }}>
              <p style={{ marginBottom: "10px" }}>OR</p>
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => alert("Google login failed")}
              />
            </div>

            <button className="login-btn" onClick={handleLogin}>
              Login
            </button>

            <div className="auth-footer">
              Don’t have an account?{" "}
              <span
                className="switch-link"
                onClick={() => setMode("register")}
              >
                Create one
              </span>
            </div>
          </>
        )}

        {/* REGISTER */}
        {mode === "register" && (
          <>
            <h2 className="modal-title">Create Account</h2>
            <p className="modal-subtitle">
              Join <strong>Healzone</strong>
            </p>

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
            />

            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
            />

            <input
              type="tel"
              name="mobileNumber"
              placeholder="Mobile Number"
              value={formData.mobileNumber}
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Create Password"
              value={formData.password}
              onChange={handleChange}
            />

            <button className="login-btn" onClick={handleRegister}>
              Register
            </button>

            <div className="auth-footer">
              Already have an account?{" "}
              <span
                className="switch-link"
                onClick={() => setMode("login")}
              >
                Login
              </span>
            </div>
          </>
        )}

        {/* FORGOT PASSWORD */}
        {mode === "forgot" && (
          <>
            <h2 className="modal-title">Reset Password</h2>

            <p className="modal-subtitle">
              Enter your email and we’ll send a reset link.
            </p>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />

            <button
              className="login-btn"
              onClick={async () => {
                try {
                  const res = await fetch(
                    `${process.env.REACT_APP_API_URL}/api/auth/forgot-password`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        email: formData.email,
                      }),
                    }
                  );

                  const data = await res.json();

                  if (res.ok) {
                    alert("Reset link sent to your email.");
                    setMode("login");
                  } else {
                    alert(data.message);
                  }
                } catch (err) {
                  alert("Failed to send reset email.");
                }
              }}
            >
              Send Reset Link
            </button>

            <div className="auth-footer">
              <span
                className="switch-link"
                onClick={() => setMode("login")}
              >
                Back to Login
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}