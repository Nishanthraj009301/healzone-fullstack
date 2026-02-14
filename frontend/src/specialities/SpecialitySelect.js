import { useNavigate, Link } from "react-router-dom";
import "./SpecialitySelect.css";

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

      <h2>Select a Speciality</h2>

      <div className="speciality-grid">
        {SPECIALITIES.map((sp) => (
          <div
            key={sp.name}
            className="speciality-card"
            style={{ "--bg": `url(${sp.bg})` }}
            onClick={() =>
              navigate(`/doctors?speciality=${encodeURIComponent(sp.name)}`)
            }
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