import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import VendorRegistrationForm from "./VendorRegistrationForm";
import "./Register.css";

export default function Register() {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState("");

  useEffect(() => {
    const r = searchParams.get("role");
    if (r) setRole(r.toLowerCase());
  }, [searchParams]);

  if (!role) return null;

  return (
    <div className="register-page">
      {/* HEADER */}
      <div className="register-header">
        <img
          src="/healonelogo.png"
          alt="Heal-Zone Logo"
          className="register-logo"
        />
      </div>

      {/* TITLE */}
      <h2 className="register-title">
        {role === "doctor" ? "Doctor Registration" : "Vendor Registration"}
      </h2>

      {/* CONTENT */}
      <div className="register-content">
        <VendorRegistrationForm role={role} />
      </div>
    </div>
  );
}