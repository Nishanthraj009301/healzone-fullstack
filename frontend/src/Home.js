import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LoginModal from "./components/Userlogin/LoginModal";
import "./Home.css";
import { useContext } from "react";
import { LocationContext } from "./context/LocationContext";
import VendorLoginModal from "./components/VendorLogin/VendorLoginModal";

/* ================= ICONS ================= */
const Icon = ({ type }) => {
  const props = { width: 42, height: 42, strokeWidth: 1.6, fill: "none" };

  switch (type) {
    case "doctor":
      return (
        <svg {...props} viewBox="0 0 24 24" stroke="#38bdf8">
          <circle cx="12" cy="7" r="3" />
          <path d="M5 21c0-4 14-4 14 0" />
          <path d="M12 10v6M9 13h6" />
        </svg>
      );
    case "mental":
      return (
        <svg {...props} viewBox="0 0 24 24" stroke="#c084fc">
          <path d="M9 4c-3 1-4 5-2 8M15 4c3 1 4 5 2 8" />
          <path d="M12 12v8" />
        </svg>
      );
    case "physical":
      return (
        <svg {...props} viewBox="0 0 24 24" stroke="#facc15">
          <path d="M6 15c2 0 3-2 3-4V6" />
          <path d="M12 10c0 2 1 5 4 5h2" />
        </svg>
      );
    case "spa":
      return (
        <svg {...props} viewBox="0 0 24 24" stroke="#22c55e">
          <path d="M12 3c2 3 5 4 5 8a5 5 0 1 1-10 0c0-4 3-5 5-8Z" />
        </svg>
      );
    case "beauty":
      return (
        <svg {...props} viewBox="0 0 24 24" stroke="#fb7185">
          <rect x="9" y="4" width="6" height="14" rx="2" />
          <path d="M9 9h6" />
        </svg>
      );
    default:
      return null;
  }
};

export default function Home() {
  const navigate = useNavigate();

  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [comingSoon, setComingSoon] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showVendorLogin, setShowVendorLogin] = useState(false);

const [searchQuery, setSearchQuery] = useState("");



const {
  selectedCountry,
  setSelectedCountry,
  selectedCity,
  setSelectedCity,
} = useContext(LocationContext);
const [showLocationDropdown, setShowLocationDropdown] = useState(false);

const [filteredResults, setFilteredResults] = useState([]);
const [showSuggestions, setShowSuggestions] = useState(false);
// 🔥 Store GPS coordinates
const [userLat, setUserLat] = useState(null);
const [userLng, setUserLng] = useState(null);

const detectLocation = () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      setUserLat(lat);
      setUserLng(lng);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
          {
            headers: {
              "Accept": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Reverse API failed");
        }

        const data = await response.json();

        const country = data?.address?.country;
        const city =
          data?.address?.city ||
          data?.address?.town ||
          data?.address?.village ||
          data?.address?.state;

        if (country) {
          setSelectedCountry(country);
        }

        if (city) {
          setSelectedCity(city);
        } else {
          setSelectedCity("Current Location");
        }

      } catch (error) {
        console.error("Reverse geocoding failed:", error);

        // fallback if reverse fails
        setSelectedCountry("Detected Location");
        setSelectedCity("Current Location");
      }

      setShowLocationDropdown(false);
    },
    (error) => {
      console.error("Geolocation error:", error);
      alert("Unable to retrieve your location");
    }
  );
};

const medicalFields = [
  "Ayurveda",
  "Dentist",
  "Dermatologist",
  "Cardiologist",
  "Neurologist",
  "Orthopedic",
  "Pediatrician",
  "Psychiatrist",
  "Gynecologist",
  "ENT Specialist",
  "Diabetologist",
  "Oncologist",
  "Urologist",
  "Nephrologist",
  "Dietician",
  "Physiotherapist",
  "General Physician",
  "Pulmonologist",
  "Radiologist",
  "Endocrinologist",
  "Gastroenterologist",
  "Dental Implants",
  "Dental Cleaning",
  "Depression Therapy",
  "De-addiction Therapy"
];


  /* ================= CHECK LOGIN ================= */
  useEffect(() => {
  checkUser();
}, []);


const checkUser = async () => {
  try {
    const res = await fetch(
  `${process.env.REACT_APP_API_URL}/api/auth/me`,
  {
    credentials: "include", // IMPORTANT for cookies
  }
);

    if (res.ok) {
      const data = await res.json();
      setUser(data);
    } else {
      setUser(null);
    }
  } catch (err) {
    setUser(null);
  }
};

  const handleLogout = async () => {
  await fetch(
    `${process.env.REACT_APP_API_URL}/api/auth/logout`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  setUser(null);
};

  const navigateWithLoader = (path) => {
    setTimeout(() => {
      navigate(path);
    }, 300);
  };

  /* ================= FETCH DOCTORS ================= */
  useEffect(() => {
    async function fetchDoctors() {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/doctors`
        );
        const data = await res.json();

        if (res.ok) {
          setDoctors(data.slice(0, 8));
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
      }
    }

    fetchDoctors();
  }, []);

  return (
    <div className="hz-root">
      {/* ================= HEADER ================= */}
      <header className="hz-header">
        <div className="hz-header-inner">
          <div className="hz-header-left">
            <div className="hz-logo" onClick={() => navigateWithLoader("/")}>
              <img src="/healonelogo.png" alt="Healzone" />
            </div>
          </div>

          <div className="hz-header-right">
            <nav className="hz-nav">
              <button onClick={() => navigateWithLoader("/about")}>
                About
              </button>

              <div className="dropdown">
                <button onClick={() => setShowRegister(!showRegister)}>
                  Register ▾
                </button>

                {showRegister && (
                  <div className="dropdown-menu">
                    <button
                      onClick={() => navigateWithLoader("/admin/vendors")}
                    >
                      Admin SignIn
                    </button>
                    <button
                      onClick={() =>
                        navigateWithLoader("/register?role=vendor")
                      }
                    >
                      Vendor Signup
                    </button>
                  </div>
                )}
              </div>

              {/* ===== LOGIN / USER DISPLAY ===== */}
{user ? (
  <div className="user-menu">
    <div
      className="user-avatar"
      onClick={() => setShowUserMenu(!showUserMenu)}
    >
      {user.name?.charAt(0).toUpperCase()}
    </div>

    {showUserMenu && (
      <div className="user-dropdown">
        <button
          onClick={() => {
            navigate("/dashboard");
            setShowUserMenu(false);
          }}
        >
          Dashboard
        </button>

        <button
          onClick={() => {
            handleLogout();
            setShowUserMenu(false);
          }}
        >
          Logout
        </button>
      </div>
    )}
  </div>
) : (
  <div className="auth-buttons">
  <button
    className="login"
    onClick={() => setShowLogin(true)}
  >
    Login
  </button>

  <button
  className="login"
  onClick={() => setShowVendorLogin(true)}
>
  Vendor Login
</button>
</div>
)}


            </nav>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
<section className="hz-hero">
  <h1>
    One Platform for <span>Health & Wellness</span>
  </h1>

  <p>
    Doctors, therapy, fitness, wellness, and personal care —
    all in one place.
  </p>

  {/* ===== HERO SEARCH ===== */}
  <div className="hero-search-container">
    <div className="hero-search">

      {/* Location */}
      <div className="location-section">
  <div
    className="location-display"
    onClick={() => setShowLocationDropdown(!showLocationDropdown)}
  >
    📍 {selectedCity || selectedCountry}
  </div>

  {showLocationDropdown && (
    <div className="location-dropdown">

      <div
  className="dropdown-item"
  onMouseDown={detectLocation}
>
        📡 Use Current Location
      </div>

      <div className="dropdown-divider"></div>

      <div
        className="dropdown-item"
        onClick={() => {
          setSelectedCountry("United States");
          setSelectedCity("");
          setShowLocationDropdown(false);
        }}
      >
        🇺🇸 United States
      </div>

      <div
        className="dropdown-item"
        onClick={() => {
          setSelectedCountry("India");
          setSelectedCity("");
          setShowLocationDropdown(false);
        }}
      >
        🇮🇳 India
      </div>

      <div
        className="dropdown-item"
        onClick={() => {
          setSelectedCountry("Malaysia");
          setSelectedCity("");
          setShowLocationDropdown(false);
        }}
      >
        🇲🇾 Malaysia
      </div>

    </div>
  )}
</div>

      <div className="divider"></div>

      {/* Search Input */}
      <div className="search-section">
  <input
    type="text"
    value={searchQuery}
    onChange={(e) => {
      const value = e.target.value;
      setSearchQuery(value);

      if (value.trim().length > 0) {
        const matches = medicalFields.filter((item) =>
          item.toLowerCase().includes(value.toLowerCase())
        );

        setFilteredResults(matches);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }}
    onFocus={() => searchQuery && setShowSuggestions(true)}
    placeholder="Search doctors, clinics, services..."
  />

  {showSuggestions && filteredResults.length > 0 && (
    <div className="suggestions-dropdown">
      {filteredResults.map((item, index) => (
        <div
          key={index}
          className="suggestion-item"
          onClick={() => {
            setSearchQuery(item);
            setShowSuggestions(false);
          }}
        >
          {item}
        </div>
      ))}
    </div>
  )}
</div>

      {/* Search Button */}
<button
  className="search-button"
  onClick={() => {

    /* NEW: if no speciality but location selected → show specialities */
    if (!searchQuery.trim() && (selectedCountry || selectedCity || (userLat && userLng))) {
      navigate("/specialities");
      return;
    }

    let url = "/doctors?";

    /* If user typed speciality */
    if (searchQuery.trim()) {
      url += `speciality=${encodeURIComponent(searchQuery)}`;
    } else {
      /* If no search text → use location filters */

      if (selectedCountry) {
        url += `country=${encodeURIComponent(selectedCountry)}&`;
      }

      if (
        selectedCity &&
        selectedCity !== "Current Location" &&
        selectedCity !== "Karnataka"
      ) {
        url += `city=${encodeURIComponent(selectedCity)}&`;
      }

      if (userLat && userLng) {
        url += `lat=${userLat}&lng=${userLng}&`;
      }
    }

    navigate(url);
  }}
>
  Search
</button>

    </div>
  </div>
</section>

      {/* ================= SERVICES ================= */}
      <section className="hz-services">
        <div
          className="card blue clickable"
          onClick={() => navigateWithLoader("/specialities")}
        >
          <Icon type="doctor" />
          <h3>Doctor</h3>
          <p>Find and book appointments with certified doctors.</p>
          <button>Find a Doctor</button>
        </div>

        <div
          className="card purple clickable"
          onClick={() => setComingSoon("Mental Health")}
        >
          <Icon type="mental" />
          <h3>Mental Health</h3>
          <p>Access therapy and counselling for mental wellness.</p>
          <button>Get Support</button>
        </div>

        <div
          className="card gold clickable"
          onClick={() => setComingSoon("Physical Health")}
        >
          <Icon type="physical" />
          <h3>Physical Health</h3>
          <p>Personal trainers and fitness programs.</p>
          <button>Stay Fit</button>
        </div>

        <div
          className="card green clickable"
          onClick={() => setComingSoon("Spa & Retreats")}
        >
          <Icon type="spa" />
          <h3>Spa & Retreats</h3>
          <p>Relax and rejuvenate at top-rated retreats.</p>
          <button>Relax Now</button>
        </div>

        <div
          className="card pink clickable"
          onClick={() => setComingSoon("Beauty Parlour")}
        >
          <Icon type="beauty" />
          <h3>Beauty Parlour</h3>
          <p>Book beauty and wellness treatments near you.</p>
          <button>Find a Salon</button>
        </div>
      </section>

      {/* ================= RECOMMENDED DOCTORS ================= */}
      <section className="hz-recommended">
        <h2>Recommendations</h2>
        <div className="slider-wrapper">
          <div className="slider-track">
            {[...doctors, ...doctors].map((doc, index) => (
              <div
                key={`${doc.id}-${index}`}
                className="doctor-simple-card"
                onClick={() => navigate(`/doctor/${doc.id}`)}
              >
                <div className="doctor-image-wrapper">
                  <img
                    src={doc.profile_url}
                    alt={doc.name}
                    className="doctor-image"
                  />
                </div>

                <h4>{doc.name}</h4>

                <p className="speciality">
                  {doc.speciality || doc.focus_area}
                </p>

                <p className="consultation">
                  ₹{doc.Rokka || "--"} Consultation
                </p>

                <button>View Profile</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= COMING SOON MODAL ================= */}
      {comingSoon && (
        <div className="modal-overlay" onClick={() => setComingSoon(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setComingSoon(null)}>
              ✕
            </span>
            <h2>{comingSoon}</h2>
            <p>
              This service is currently under development.
              <br />
              We’re working hard to bring it to you soon 🚀
            </p>
            <button onClick={() => setComingSoon(null)}>
              Okay, got it
            </button>
          </div>
        </div>
      )}

    {/* ================= MODALS ================= */}

<LoginModal
  show={showLogin}
  onClose={() => setShowLogin(false)}
  onSuccess={async () => {
    await checkUser();
    setShowLogin(false);
  }}
/>

<VendorLoginModal
  show={showVendorLogin}
  onClose={() => setShowVendorLogin(false)}
  onSuccess={async () => {
    await checkUser();
    setShowVendorLogin(false);
  }}
/>
    </div>
  );
}

