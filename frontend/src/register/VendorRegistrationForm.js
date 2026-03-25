import { useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./VendorRegistrationForm.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import VendorLocationMap from "../components/VendorLocationMap";
import { Country, State } from "country-state-city";


/* ===============================
   CATEGORY → SPECIALITY OPTIONS
=============================== */

const specialityOptions = {
  Doctor: [
    "Cardiologist",
    "Dentist",
    "Dermatologist",
    "ENT Specialist",
    "General Physician",
    "Gynecologist",
    "Neurologist",
    "Orthopedic",
    "Pediatrician",
    "Psychiatrist",
    "Urologist"
  ],

  "Mental Health": [
    "Psychologist",
    "Psychiatrist",
    "Counselling Therapist",
    "Family Therapist",
    "Child Psychologist",
    "Addiction Specialist"
  ],

  "Physical Health": [
    "Physiotherapist",
    "Chiropractor",
    "Rehabilitation Therapist",
    "Sports Injury Specialist",
    "Occupational Therapist"
  ],

  "Spa & Retreats Center": [
    "Ayurvedic Therapy",
    "Yoga Therapy",
    "Meditation Therapy",
    "Detox Therapy",
    "Massage Therapy"
  ],

  "Beauty Parlour": [
    "Hair Styling",
    "Skin Care",
    "Makeup Artist",
    "Nail Technician",
    "Bridal Makeup",
    "Facial Specialist"
  ]
};

export default function VendorRegistrationForm({ role }) {
  //=================componenets===================================
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const location = useLocation();

  

const [formData, setFormData] = useState({
  firstName: location.state?.firstName || "",
  lastName: location.state?.lastName || "",
  category: "",
  speciality: "",
  mobile: location.state?.mobileNumber || "",
  email: location.state?.email || "",
  password: location.state?.password || "",
  address: "",
  state: "",
  country: "",
  consultationFee: "",
  appointmentDuration: "",
  services: "",
  photo: null,
  about: ""
});

  const [availability, setAvailability] = useState([
    { day: "", start: "", end: "" }
  ]);

  /* ===============================
     COUNTRY + STATE DATA
  =============================== */

  const countries = Country.getAllCountries();

  const states = formData.country
    ? State.getStatesOfCountry(formData.country)
    : [];

  /* ===============================
     AUTO SET CATEGORY IF DOCTOR
  =============================== */

  useEffect(() => {
    if (role === "doctor") {
      setFormData(prev => ({ ...prev, category: "Doctor" }));
    }
  }, [role]);

  /* ===============================
     HANDLE INPUT CHANGE
  =============================== */

  const handleChange = e => {
    const { name, value } = e.target;

    if (name === "category") {
      setFormData(prev => ({
        ...prev,
        category: value,
        speciality: ""
      }));
    }

    else if (name === "country") {
      setFormData(prev => ({
        ...prev,
        country: value,
        state: ""
      }));
    }

    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  /* ===============================
     SLOT HANDLERS
  =============================== */

  const handleSlotChange = (index, field, value) => {
    const updated = [...availability];
    updated[index][field] = value;
    setAvailability(updated);
  };

  const addSlot = () => {
    setAvailability([...availability, { day: "", start: "", end: "" }]);
  };

  const removeSlot = (index) => {
    const updated = availability.filter((_, i) => i !== index);
    setAvailability(updated);
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
     SUBMIT
  =============================== */

  const submit = async (e) => {

  e.preventDefault();

  if (!isFormValid || loading) return;

  setLoading(true);

  try {

    const formPayload = new FormData();

    /* BASIC FIELDS */

    formPayload.append("firstName", formData.firstName);
    formPayload.append("lastName", formData.lastName);
    formPayload.append("category", formData.category);
    formPayload.append("speciality", formData.speciality || "");

    formPayload.append("mobile", formData.mobile);
    formPayload.append("email", formData.email);
    formPayload.append("password", formData.password);

    formPayload.append("address", formData.address || "");
    formPayload.append("state", formData.state || "");
    formPayload.append("country", formData.country || "");

    /* NUMERIC FIELDS */

    formPayload.append(
      "consultationFee",
      Number(formData.consultationFee)
    );

    formPayload.append(
      "appointmentDuration",
      Number(formData.appointmentDuration)
    );

    formPayload.append("services", formData.services || "");
    formPayload.append("about", formData.about || "");

    /* PHOTO */

    if (formData.photo) {
      formPayload.append("photo", formData.photo);
    }

    /* AVAILABILITY */

    formPayload.append(
      "availability",
      JSON.stringify(availability)
    );

    /* LOCATION */

    if (coordinates) {
      formPayload.append(
        "location",
        JSON.stringify({
          type: "Point",
          coordinates: [coordinates[1], coordinates[0]]
        })
      );
    }

    /* API CALL */

    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/vendors/register`,
      {
        method: "POST",
        body: formPayload
      }
    );

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

    /* RESET FORM */

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
      photo: null,
      about: ""
    });

    setAvailability([{ day: "", start: "", end: "" }]);
    setCoordinates(null);

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

          <select
            name="speciality"
            value={formData.speciality}
            onChange={handleChange}
          >
            <option value="">Select Speciality</option>

            {specialityOptions[formData.category]?.map((sp, index) => (
              <option key={index} value={sp}>
                {sp}
              </option>
            ))}

          </select>
          <label>Upload Profile Photo</label>

          {photoPreview && (
            <div className="photo-preview-container">

              <img
                src={photoPreview}
                alt="Preview"
                className="photo-preview"
              />

              <button
                type="button"
                className="remove-photo"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    photo: null
                  }));

                  setPhotoPreview(null);

                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
              >
                ❌
              </button>

            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];

              if (file) {
                setFormData((prev) => ({
                  ...prev,
                  photo: file
                }));

                setPhotoPreview(URL.createObjectURL(file));
              }
            }}
          />

          <textarea
            name="about"
            placeholder="About Doctor / Vendor"
            rows="3"
            value={formData.about}
            onChange={handleChange}
          />
        </div>

        {/* CONTACT */}

        <div className="form-section">
          <h4>Contact Details</h4>

          <PhoneInput
            country={"in"}
            onlyCountries={["in", "my", "us"]}
            value={formData.mobile}
            onChange={(phone) =>
              setFormData((prev) => ({ ...prev, mobile: phone }))
            }
            inputStyle={{ width: "100%" }}
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

        {/* LOCATION */}

        <div className="form-section">
          <h4>Location</h4>

          <textarea
            name="address"
            placeholder="Clinic / Business Address"
            rows="3"
            value={formData.address}
            onChange={handleChange}
          />

          <label className="map-label">Select Exact Location</label>

          <VendorLocationMap
            setCoordinates={setCoordinates}
            setAddress={(addr) =>
              setFormData(prev => ({ ...prev, address: addr }))
            }
          />

          <div className="grid-2">

            {/* COUNTRY */}

            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
            >
              <option value="">Select Country</option>

              {countries.map(country => (
                <option key={country.isoCode} value={country.isoCode}>
                  {country.name}
                </option>
              ))}
            </select>

            {/* STATE */}

            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              disabled={!formData.country}
            >
              <option value="">Select State</option>

              {states.map(state => (
                <option key={state.isoCode} value={state.name}>
                  {state.name}
                </option>
              ))}
            </select>

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

            <select
              name="appointmentDuration"
              value={formData.appointmentDuration}
              onChange={handleChange}
            >
              <option value="">Select Appointment Duration</option>
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes</option>
            </select>
          </div>

          {formData.category === "Doctor" && (
            <textarea
              name="services"
              placeholder="Services offered"
              rows="3"
              value={formData.services}
              onChange={handleChange}
            />
          )}
        </div>

        {/* AVAILABILITY */}

        {formData.category === "Doctor" && (
          <div className="form-section availability-section">

            <h4>Doctor Availability</h4>

            {availability.map((slot, index) => (

              <div key={index} className="availability-card">

                <div className="weekday-selector">
                  {[
                    "Monday", "Tuesday", "Wednesday",
                    "Thursday", "Friday", "Saturday", "Sunday"
                  ].map((day) => (
                    <button
                      type="button"
                      key={day}
                      className={`weekday-chip ${slot.day === day ? "active" : ""
                        }`}
                      onClick={() =>
                        handleSlotChange(index, "day", day)
                      }
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>

                <div className="slot-grid">

                  <div className="slot-field">
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={slot.start}
                      onChange={(e) =>
                        handleSlotChange(index, "start", e.target.value)
                      }
                    />
                  </div>

                  <div className="slot-field">
                    <label>End Time</label>
                    <input
                      type="time"
                      value={slot.end}
                      onChange={(e) =>
                        handleSlotChange(index, "end", e.target.value)
                      }
                    />
                  </div>

                </div>

                {availability.length > 1 && (
                  <button
                    type="button"
                    className="remove-slot"
                    onClick={() => removeSlot(index)}
                  >
                    Remove Slot
                  </button>
                )}

              </div>

            ))}

            <button
              type="button"
              className="add-slot-button"
              onClick={addSlot}
            >
              + Add Another Slot
            </button>

          </div>
        )}

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
