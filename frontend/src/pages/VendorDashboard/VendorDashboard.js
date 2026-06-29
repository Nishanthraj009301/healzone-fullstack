import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VendorDashboard.css";

export default function VendorDashboard() {

  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 21) return "Good evening";
    return "Good night";
  };

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

    setTimeout(() => setLoaded(true), 400);

  }, [navigate]);

  const fetchVendor = async (vendorId) => {
    try {
      const res = await fetch(
        `https://www.heal-zone.com/api/vendors/${vendorId}`
      );

      const data = await res.json();

      if (data.success) {
        setVendor(data.vendor);
      }
    } catch (err) {
      console.error("Vendor fetch error:", err);
    }

    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  /* ===== SEARCH FILTER LOGIC ===== */

  const filteredAppointments = vendor?.appointments?.filter((appt) =>
    appt?.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredServices = vendor?.services?.filter((service) =>
    service?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const stats = {
    appointments: searchTerm
      ? filteredAppointments.length
      : vendor?.appointments?.length || 0,

    services: searchTerm
      ? filteredServices.length
      : Array.isArray(vendor?.services)
      ? vendor.services.length
      : vendor?.services
      ? 1
      : 0
  };

  if (loading) {
    return (
      <div className="vendor-dashboard-loading">
        <div className="loader"></div>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className={`dashboard ${loaded ? "show" : ""}`}>

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

        <button className="logout" onClick={logout}>Logout</button>
      </aside>

      {/* MAIN */}
      <main className="main">

        <div className="topbar">

          {/* SEARCH */}
          <div className="search-box">
            <input
              className="search"
              placeholder="Search patient or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search-btn">🔍</button>
          </div>

          <div className="profile">
            {vendor?.firstName || vendor?.name}
          </div>
        </div>

        <div className="grid">

          {/* LEFT */}
          <div className="left">

            <div className="welcome">
              <h2>
                {getGreeting()} <span>{vendor?.firstName}</span> 👋
              </h2>
              <p>{todayMessage}</p>
            </div>

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

          </div>

          {/* RIGHT */}
          <div className="right">
            <h3>Today's Overview</h3>

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