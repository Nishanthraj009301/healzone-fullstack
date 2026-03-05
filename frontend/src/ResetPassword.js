import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");

  const handleReset = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Password reset successful");
        navigate("/");
      } else {
        alert(data.message);
      }

    } catch (err) {
      alert("Something went wrong");
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "auto" }}>
      <h2>Reset Password</h2>

      <input
        type="password"
        placeholder="Enter new password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "10px",
        }}
      />

      <button
        onClick={handleReset}
        style={{
          marginTop: "15px",
          padding: "10px",
          width: "100%",
        }}
      >
        Reset Password
      </button>
    </div>
  );
}