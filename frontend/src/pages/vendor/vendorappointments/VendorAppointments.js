import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VendorAppointments.css";

const API = process.env.REACT_APP_API_URL;

export default function VendorAppointments() {

  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= AUTH CHECK ================= */

  useEffect(() => {

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/");
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    if (parsedUser.role !== "vendor") {
      navigate("/");
      return;
    }

    fetchVendor(parsedUser._id);
    fetchAppointments(parsedUser._id);

  }, [navigate]);


  /* ================= FETCH VENDOR ================= */

  const fetchVendor = async (vendorId) => {

    try {

      const res = await fetch(
  `${API}/api/vendors/${vendorId}`
);

      const data = await res.json();

      if (data.success) {
        setVendor(data.vendor);
      }

    } catch (err) {
      console.error("Vendor fetch error:", err);
    }

  };


  /* ================= FETCH APPOINTMENTS ================= */

  const fetchAppointments = async (vendorId) => {

    try {

      const res = await fetch(
  `${API}/api/bookings/vendor`
);

      const data = await res.json();

      if (data.success) {
        setAppointments(data.appointments);
      }

    } catch (err) {

      console.error("Appointments fetch error:", err);

    }

    setLoading(false);

  };


  /* ================= LOGOUT ================= */

  const logout = () => {

    localStorage.removeItem("user");
    navigate("/");

  };


  if (loading) {
    return <div className="appointments-loading">Loading appointments...</div>;
  }


  return (

    <div className="dashboard">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="logo">
          <img src="/healonelogo.png" alt="HealZone Logo" />
        </div>

        <div className="menu">

          <button onClick={() => navigate("/vendor/dashboard")}>🏠</button>

          <button onClick={() => navigate("/vendor/services")}>🩺</button>

          <button onClick={() => navigate("/vendor/appointments")}>📅</button>

          <button onClick={() => navigate("/vendor/availability")}>⏰</button>

          <button onClick={() => navigate("/vendor/profile")}>👤</button>

        </div>

        <button className="logout" onClick={logout}>
          ⏻
        </button>

      </aside>


      {/* MAIN */}

      <main className="main">

        {/* TOPBAR */}

        <div className="topbar">

          <input
            className="search"
            placeholder="Search appointments..."
          />

          <div className="profile">
            {vendor?.firstName || vendor?.name}
          </div>

        </div>


        {/* PAGE CONTENT */}

        <div className="appointments-container">

          <h1>Appointments</h1>

          {appointments.length === 0 ? (

            <div className="no-appointments">
              No appointments yet
            </div>

          ) : (

            <div className="appointments-list">

              {appointments.map((appt) => (

                <div key={appt._id} className="appointment-card">

                  <div className="appointment-info">

                    <h3>{appt.patientName}</h3>

                    <p>
                      Date: {new Date(appt.date).toLocaleDateString()}
                    </p>

                    <p>
                      Time: {appt.time}
                    </p>

                    <p>
                      Service: {appt.service}
                    </p>

                  </div>

                  <div className="appointment-status">

                    <span className={`status ${appt.status}`}>
                      {appt.status || "Pending"}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </main>

    </div>

  );

}