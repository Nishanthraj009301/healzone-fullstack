import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "./DoctorList.css";
import Loader from "./loader/Loader";

/* ================= HELPERS ================= */

function renderConsultationText(Rokka) {
  if (Rokka === undefined || Rokka === null || Rokka === "") return null;
  const num = Number(Rokka);
  return !isNaN(num) && num > 0 ? `₹${num} Consultation` : Rokka;
}

export default function DoctorList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /* 👉 speciality from previous page */
  const selectedSpeciality = searchParams.get("speciality");

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  /* ================= FETCH ================= */

useEffect(() => {
  const params = new URLSearchParams();

  const speciality = searchParams.get("speciality");
  const country = searchParams.get("country");
  const city = searchParams.get("city");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const search = searchParams.get("search");

  if (speciality) params.append("speciality", speciality);
  if (country) params.append("country", country);
  if (city) params.append("city", city);
  if (lat) params.append("lat", lat);
  if (lng) params.append("lng", lng);
  if (search) params.append("search", search);
  

  // const url = `${process.env.REACT_APP_API_URL}/api/doctors?${params.toString()}`;

  const url = `http://localhost:5000/api/doctors?${params.toString()}`;

  // console.log("Fetching doctors from:", url); // 🔥 DEBUG

  setLoading(true);

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      // console.log("Doctors response:", data); // 🔥 DEBUG
      setDoctors(Array.isArray(data) ? data : []);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      setLoading(false);
    });

}, [searchParams]);

  /* ================= SYNC SEARCH INPUT ================= */

  useEffect(() => {
    const search = searchParams.get("search") || "";
    setSearchText(search);
  }, [searchParams]);

  /* ================= SEARCH HANDLER ================= */

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);

    if (searchText.trim()) {
      params.set("search", searchText.trim());
    } else {
      params.delete("search");
    }

    navigate(`/doctors?${params.toString()}`);
  };

  /* ================= LOADING ================= */

  if (loading) return <Loader />;

  return (
    <div className="doctor-page">

      {/* ================= HEADER ================= */}

      <header className="doctor-header">
        <div className="doctor-header-inner">

          <button className="logo-btn" onClick={() => navigate("/")}>
            <img src="/healonelogo.png" alt="Healzone" />
          </button>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search doctor or speciality"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />

            <button onClick={handleSearch}>
              Search
            </button>
          </div>

        </div>
      </header>

      {/* ================= CONTENT ================= */}

      <main className="doctor-shell">

        {selectedSpeciality && (
          <h3 style={{ marginBottom: "20px" }}>
            Showing doctors for <b>{selectedSpeciality}</b>
          </h3>
        )}

        {doctors.length === 0 ? (
          <div className="empty-state">No doctors found</div>
        ) : (
          <div className="doctor-card-grid">

            {doctors.map((doc) => {
              const id = doc._id || doc.id;
              const consultationText = renderConsultationText(doc.Rokka);

              return (
                <div
                  key={id}
                  className="doctor-card"
                  onClick={() => navigate(`/doctor/${id}`)}
                >

                  {/* AVATAR */}

                  <div className="doctor-avatar">
                    {doc.profile_url ? (
                      <img src={doc.profile_url} alt={doc.name} />
                    ) : (
                      <span>
                        {doc.name
                          ?.split(" ")
                          .slice(0, 2)
                          .map((w) => w[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* INFO */}

                  <h3>{doc.name}</h3>

                  <p className="speciality">
                    {doc.speciality || "Speciality not listed"}
                  </p>

                  {consultationText && (
                    <p className="fee">{consultationText}</p>
                  )}

                  <button
                    className="view-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/doctor/${id}`);
                    }}
                  >
                    View Profile
                  </button>

                </div>
              );
            })}

          </div>
        )}

      </main>

    </div>
  );
}