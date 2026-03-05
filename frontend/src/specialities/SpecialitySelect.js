import { useNavigate, Link, useLocation } from "react-router-dom";
import { useMemo, useContext } from "react";
import "./SpecialitySelect.css";
import { LocationContext } from "../context/LocationContext";

const SPECIALITIES = [
  {
    name: "Dentist",
    bg: "/images/cards/dentist11.jpg",
  },
  {
    name: "Ayurveda",
    bg: "/images/cards/ayurveda11.jpg",
  },
  {
    name: "General Physician",
    bg: "/images/cards/general_physician11.jpg",
  },
];

export default function SpecialitySelect() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Proper hook usage INSIDE component
  const { selectedCountry, selectedCity } = useContext(LocationContext);

  // Optional: also read from URL (fallback)
  const queryParams = useMemo(() => {
  const params = new URLSearchParams(location.search);
  return {
    country: params.get("country") || "",
    city: params.get("city") || "",
    lat: params.get("lat") || "",
    lng: params.get("lng") || "",
  };
}, [location.search]);

const { country, city, lat, lng } = queryParams;

  const handleSpecialityClick = (speciality) => {
    let url = `/doctors?speciality=${encodeURIComponent(
  speciality
)}&country=${encodeURIComponent(country)}&city=${encodeURIComponent(city)}`;

if (queryParams.lat && queryParams.lng) {
  url += `&lat=${queryParams.lat}&lng=${queryParams.lng}`;
}

navigate(url);
  };

  return (
    <div className="speciality-page">
      {/* ================= HEADER ================= */}
      <div className="speciality-header">
        <Link to="/">
          <img
            src="/healonelogo.png"
            alt="Healzone Logo"
            className="speciality-page-logo"
          />
        </Link>
      </div>

      <h2>
        {country
          ? `Select a Speciality in ${country}${city ? ` - ${city}` : ""}`
          : "Select a Speciality"}
      </h2>

      <div className="speciality-grid">
        {SPECIALITIES.map((sp) => (
          <div
            key={sp.name}
            className="speciality-card"
            style={{ "--bg": `url(${sp.bg})` }}
            onClick={() => handleSpecialityClick(sp.name)}
          >
            <div className="card-overlay" />
            <div className="card-bottom">
              <h3>{sp.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}