import { useState, useContext } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import "./VendorLoginModal.css";
import { AuthContext } from "../../context/AuthContext";

export default function VendorLoginModal({ show, onClose }) {

  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
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

      const url = `${process.env.REACT_APP_API_URL}/api/auth/google/vendor`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const data = await res.json();

      if (res.ok) {

        const userRes = await fetch(
          `${process.env.REACT_APP_API_URL}/api/auth/me`,
          { credentials: "include" }
        );

        const userData = await userRes.json();

        setUser(userData.user);

        onClose();

        navigate("/vendor/dashboard");

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
      `${process.env.REACT_APP_API_URL}/api/vendors/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Invalid credentials");
      return;
    }

    /* DB credentials matched */

    const vendorUser = {
      ...data.vendor,
      role: "vendor"
    };

    /* save login */

    setUser(vendorUser);

    localStorage.setItem("user", JSON.stringify(vendorUser));

    /* open dashboard */

    navigate("/vendor/dashboard");

    onClose();

  } catch (error) {

    console.error("Login error:", error);
    alert("Login failed");

  }

};

  /* ================= REGISTER ================= */

  const handleRegister = () => {

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.mobileNumber ||
      !formData.password
    ) {
      alert("Please fill all fields");
      return;
    }

    onClose();

    /* redirect to vendor registration form with filled data */

    navigate("/register?role=vendor", {
      state: formData
    });

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
            <h2 className="modal-title">Vendor Login</h2>

            <p className="modal-subtitle">
              Login to manage your <strong>Healzone services</strong>
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
              Don’t have a vendor account?{" "}
              <span
                className="switch-link"
                onClick={() => setMode("register")}
              >
                Register
              </span>
            </div>
          </>
        )}

        {/* ================= REGISTER ================= */}

        {mode === "register" && (

          <>
            <h2 className="modal-title">Vendor Registration</h2>

            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
            />

            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
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
              Continue
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

        {/* ================= FORGOT PASSWORD ================= */}

        {mode === "forgot" && (

          <>
            <h2 className="modal-title">Reset Password</h2>

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