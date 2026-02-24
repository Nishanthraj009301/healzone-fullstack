import { useState, useContext } from "react";
import "./LoginModal.css";
import { AuthContext } from "../../context/AuthContext";

export default function LoginModal({ show, onClose, onSuccess }) {
    const { setUser } = useContext(AuthContext); // 🔥 Get auth context
    const [mode, setMode] = useState("login");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        newPassword: "",
    });

    if (!show) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    /* ================= LOGIN ================= */
    const handleLogin = async () => {
  try {
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 🔥 required for cookies
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      // 🔥 Get logged-in user
      const userRes = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/me`,
        {
          credentials: "include",
        }
      );

      const userData = await userRes.json();

      // 🔥 Update global auth state
      setUser(userData.user);

      // ✅ Close modal
      onClose();

      if (onSuccess) {
        onSuccess();
      }
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
  try {
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 🔥 required for auth cookies
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      }
    );

            const data = await res.json();

            if (res.ok) {
                alert("Registration successful! Please login.");
                setMode("login");
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

                {/* ================= LOGIN ================= */}
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

                {/* ================= REGISTER ================= */}
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

                {/* ================= FORGOT PASSWORD (UI ONLY) ================= */}
                {mode === "forgot" && (
                    <>
                        <h2 className="modal-title">Reset Password</h2>
                        <p className="modal-subtitle">
                            Enter your registered email and we’ll send you a reset link.
                        </p>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                        />

                        <button className="login-btn">
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