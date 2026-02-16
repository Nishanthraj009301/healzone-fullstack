import { useState, useMemo, useEffect } from "react";
import "./VendorRegistrationForm.css";

export default function VendorRegistrationForm({ role }) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    category: "",
    speciality: "",
    mobile: "",
    email: "",
    password: "",
    address: "",
    state: "",
    country: "",
    consultationFee: "",
    appointmentDuration: "",
    services: "",
  });

  /* ===============================
     AUTO SET CATEGORY IF DOCTOR
  =============================== */
  useEffect(() => {
    if (role === "doctor") {
      setFormData(prev => ({ ...prev, category: "Doctor" }));
    }
  }, [role]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /* ===============================
     FORM VALIDATION
  =============================== */
  const isFormValid = useMemo(() => {
    const requiredFields = [
      "firstName",
      "lastName",
      "category",
      "speciality",
      "mobile",
      "email",
      "password",
      "address",
      "state",
      "country",
      "consultationFee",
      "appointmentDuration",
    ];

    for (let field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === "") {
        return false;
      }
    }

    if (
      formData.category === "Doctor" &&
      (!formData.services || formData.services.trim() === "")
    ) {
      return false;
    }

    return true;
  }, [formData]);

  /* ===============================
     SUBMIT → SAVE TO DB
  =============================== */
  const submit = async e => {
    e.preventDefault();

    if (!isFormValid || loading) return;

    setLoading(true);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobile: formData.mobile,
        category: formData.category,
        email: formData.email,
        password: formData.password,
        speciality: formData.speciality,
        address: formData.address,
        state: formData.state,
        country: formData.country,
        consultationFee: Number(formData.consultationFee),
        appointmentDuration: Number(formData.appointmentDuration),
        services: formData.services,
      };

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/vendors/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || data.error || "Registration failed");
        return;
      }

      alert(
        role === "doctor"
          ? "Doctor registered successfully! Await admin approval."
          : "Vendor registered successfully! Await admin approval."
      );

      setFormData({
        firstName: "",
        lastName: "",
        category: role === "doctor" ? "Doctor" : "",
        speciality: "",
        mobile: "",
        email: "",
        password: "",
        address: "",
        state: "",
        country: "",
        consultationFee: "",
        appointmentDuration: "",
        services: "",
      });
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vendor-form-wrapper">
      <h2 className="vendor-title">
        {role === "doctor"
          ? "Doctor Registration"
          : "Vendor Registration"}
      </h2>

      <p className="vendor-subtitle">
        Register your practice and start accepting appointments
      </p>

      <form className="vendor-form" onSubmit={submit}>
        {/* BASIC INFO */}
        <div className="form-section">
          <h4>Basic Information</h4>

          <div className="grid-2">
            <input
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
            />
            <input
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          {/* Show category dropdown ONLY if not doctor */}
          {role !== "doctor" && (
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              <option>Doctor</option>
              <option>Mental Health</option>
              <option>Physical Health</option>
              <option>Spa & Retreats Center</option>
              <option>Beauty Parlour</option>
            </select>
          )}

          <input
            name="speciality"
            placeholder="Speciality"
            value={formData.speciality}
            onChange={handleChange}
          />
        </div>

        {/* CONTACT */}
        <div className="form-section">
          <h4>Contact Details</h4>

          <input
            type="tel"
            name="mobile"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
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
        </div>

        {/* ADDRESS */}
        <div className="form-section">
          <h4>Location</h4>

          <textarea
            name="address"
            placeholder="Clinic / Business Address"
            rows="3"
            value={formData.address}
            onChange={handleChange}
          />

          <div className="grid-2">
            <input
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
            />
            <input
              name="country"
              placeholder="Country"
              value={formData.country}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* CONSULTATION */}
        <div className="form-section">
          <h4>Consultation</h4>

          <div className="grid-2">
            <input
              name="consultationFee"
              type="number"
              placeholder="Consultation Fee"
              value={formData.consultationFee}
              onChange={handleChange}
            />

            <input
              name="appointmentDuration"
              type="number"
              placeholder="Duration (minutes)"
              value={formData.appointmentDuration}
              onChange={handleChange}
            />
          </div>

          {formData.category === "Doctor" && (
            <textarea
              name="services"
              placeholder="Services offered (e.g. Fever, Cold, Dental checkup)"
              rows="3"
              value={formData.services}
              onChange={handleChange}
            />
          )}
        </div>

        <button
          type="submit"
          className="vendor-submit-btn"
          disabled={!isFormValid || loading}
        >
          {loading
            ? "Registering..."
            : role === "doctor"
            ? "Register Doctor"
            : "Register Vendor"}
        </button>
      </form>
    </div>
  );
}