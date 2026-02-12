import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import "./DoctorList.css";
import Loader from "./loader/Loader";

/* ================= HELPERS ================= */

function normalize(value = "") {
  return value.toLowerCase().replace(/\s+/g, "");
}

/* Consultation text */
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
  const [appliedQuery, setAppliedQuery] = useState("");

  /* ================= FETCH ================= */
  useEffect(() => {
    fetch("http://localhost:5000/api/doctors")
      .then((res) => res.json())
      .then((data) => {
        setDoctors(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* ================= FILTER ================= */
  const filteredDoctors = useMemo(() => {
    let result = doctors;

    /* 1️⃣ Filter by speciality (normalized) */
    if (selectedSpeciality) {
      const selected = normalize(selectedSpeciality);

      result = result.filter((doc) => {
        const speciality = doc.speciality
          ? normalize(doc.speciality)
          : "";

        const focusArea = doc.focus_area
          ? normalize(doc.focus_area)
          : "";

        return speciality === selected || focusArea === selected;
      });

    }

    /* 2️⃣ Apply search inside that speciality */
    if (appliedQuery.trim()) {
      const q = appliedQuery.toLowerCase();
      result = result.filter(
        (doc) =>
          doc.name?.toLowerCase().includes(q) ||
          doc.speciality?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [doctors, appliedQuery, selectedSpeciality]);

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
              placeholder="Search doctor"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setAppliedQuery(searchText.trim());
                }
              }}
            />
            <button onClick={() => setAppliedQuery(searchText.trim())}>
              Search
            </button>
          </div>
        </div>
      </header>

      {/* ================= CONTENT ================= */}
      <main className="doctor-shell">
        {/* 🔹 Selected speciality title */}
        {selectedSpeciality && (
          <h3 style={{ marginBottom: "20px" }}>
            Showing doctors for{" "}
            <b>{selectedSpeciality}</b>
          </h3>
        )}

        {filteredDoctors.length === 0 ? (
          <div className="empty-state">No doctors found</div>
        ) : (
          <div className="doctor-card-grid">
            {filteredDoctors.map((doc) => {
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
