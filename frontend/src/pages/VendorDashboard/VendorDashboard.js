import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VendorDashboard.css";

const API = process.env.REACT_APP_API_URL;

export default function VendorDashboard() {

  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    services: 0,
    appointments: 0
  });

  

  /* ================= GREETING BASED ON TIME ================= */

  const getGreeting = () => {

    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 21) return "Good evening";

    return "Good night";
  };

  /* ================= DAILY MOTIVATIONAL MESSAGE ================= */

  const dailyMessages = [
    "Have a great and productive day",
    "Your patients are counting on you today",
    "Every patient interaction matters",
    "Small care today creates big impact tomorrow",
    "Your dedication makes a difference",
    "Stay focused and keep healing",
    "A healthy community starts with you"
  ];

  const todayIndex = new Date().getDate() % dailyMessages.length;

  const todayMessage = dailyMessages[todayIndex];


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

  }, [navigate]);


  /* ================= FETCH VENDOR DATA ================= */

  const fetchVendor = async (vendorId) => {

    try {

      const res = await fetch(
        `${API}/api/vendors/${vendorId}`
      );

      const data = await res.json();

      if (data.success) {

        setVendor(data.vendor);

        setStats({
          services: Array.isArray(data.vendor.services)
            ? data.vendor.services.length
            : data.vendor.services
            ? 1
            : 0,
          appointments: data.vendor.appointments?.length || 0
        });

      }

    } catch (err) {

      console.error("Vendor fetch error:", err);

    }

    setLoading(false);

  };


  /* ================= LOGOUT ================= */

  const logout = () => {

    localStorage.removeItem("user");

    navigate("/");

  };


  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="vendor-dashboard-loading">
        Loading dashboard...
      </div>
    );
  }


  return (

    <div className="dashboard">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="logo">
          <img src="/healonelogo.png" alt="HealZone Logo" />
        </div>

        <div className="menu">

          <button onClick={() => navigate("/vendor/dashboard")} title="Dashboard">
            🏠
          </button>

          <button onClick={() => navigate("/vendor/services")} title="Services">
            🩺
          </button>

          <button onClick={() => navigate("/vendor/appointments")} title="Appointments">
            📅
          </button>

          <button onClick={() => navigate("/vendor/availability")} title="Availability">
            ⏰
          </button>

          <button onClick={() => navigate("/vendor/profile")} title="Profile">
            👤
          </button>

        </div>

        <button className="logout" onClick={logout}>
  Logout
</button>

      </aside>


      {/* MAIN AREA */}

      <main className="main">

        {/* TOP BAR */}

        <div className="topbar">

          <input
            className="search"
            placeholder="Search..."
          />

          <div className="profile">
            {vendor?.firstName || vendor?.name}
          </div>

        </div>


        {/* CONTENT GRID */}

        <div className="grid">

          {/* LEFT PANEL */}

          <div className="left">

            {/* GREETING */}

            <div className="welcome">

              <h2>
                {getGreeting()} {vendor?.firstName}
              </h2>

              <p>
                {todayMessage}
              </p>

            </div>


            {/* ACTION CARDS */}

            <div className="actions">

              <div className="action-card">
                <h3>Appointments</h3>
                <h1>{stats.appointments}</h1>
                <button onClick={() => navigate("/vendor/appointments")}>
                  Manage
                </button>
              </div>


              <div className="action-card">
                <h3>Services</h3>
                <h1>{stats.services}</h1>
                <button onClick={() => navigate("/vendor/services")}>
                  Edit
                </button>
              </div>

            </div>


            {/* STATISTICS */}

            <div className="stats">

              <h3>Patient Statistics</h3>

              <div className="chart-placeholder"></div>

            </div>

          </div>


          {/* RIGHT PANEL */}

          <div className="right">

            <h3>Today's Schedule</h3>

            <div className="schedule-item">
              <span>Appointments</span>
              <span>{stats.appointments}</span>
            </div>

            <div className="schedule-item">
              <span>Services</span>
              <span>{stats.services}</span>
            </div>

          </div>

        </div>

      </main>

    </div>

  );

}