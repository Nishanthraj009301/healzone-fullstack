import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VendorAvailability.css";

export default function VendorAvailability() {

  const navigate = useNavigate();

  const [availability, setAvailability] = useState([]);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ];

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser || !storedUser._id) {
      navigate("/");
      return;
    }

    fetch(`https://www.heal-zone.com/api/vendors/${storedUser._id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAvailability(data.vendor.availability || []);
        }
      });
  }, [navigate]);

  const toggleDay = (day) => {
    const exists = availability.find(a => a.day === day);

    if (exists) {
      setAvailability(availability.filter(a => a.day !== day));
    } else {
      setAvailability([
        ...availability,
        { day, start: "09:00", end: "17:00" }
      ]);
    }
  };

  const updateTime = (day, field, value) => {
    setAvailability(
      availability.map(a =>
        a.day === day ? { ...a, [field]: value } : a
      )
    );
  };

  const saveAvailability = async () => {

    const storedUser = JSON.parse(localStorage.getItem("user"));

    for (let a of availability) {
      if (a.start >= a.end) {
        alert(`${a.day}: End time must be after start time`);
        return;
      }
    }

    const res = await fetch(
      `https://www.heal-zone.com/api/vendors/${storedUser._id}/availability`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ availability })
      }
    );

    const data = await res.json();

    if (data.success) {
      setAvailability(data.availability);
      alert("Availability saved successfully");
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="dashboard">

      {/* ===== SIDEBAR ===== */}
      <aside className="sidebar">

        <div className="logo">
          <img src="/healonelogo.png" alt="logo" />
        </div>

        <div className="menu">
          <button onClick={() => navigate("/vendor/dashboard")}>🏠</button>
          <button onClick={() => navigate("/vendor/services")}>🩺</button>
          <button onClick={() => navigate("/vendor/appointments")}>📅</button>
          <button onClick={() => navigate("/vendor/availability")}>⏰</button>
          <button onClick={() => navigate("/vendor/profile")}>👤</button>
        </div>

        <button className="logout" onClick={logout}>
          Logout
        </button>

      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="availability-main">

        <div className="availability-header">
          <h1>Manage Availability</h1>
        </div>

        <div className="availability-grid">

          {days.map(day => {
            const selected = availability.find(a => a.day === day);

            return (
              <div key={day} className="availability-card">

                <label>
                  <input
                    type="checkbox"
                    checked={!!selected}
                    onChange={() => toggleDay(day)}
                  />
                  {day}
                </label>

                {selected && (
                  <div className="time-inputs">

                    <input
                      type="time"
                      value={selected.start}
                      onChange={(e) =>
                        updateTime(day, "start", e.target.value)
                      }
                    />

                    <input
                      type="time"
                      value={selected.end}
                      onChange={(e) =>
                        updateTime(day, "end", e.target.value)
                      }
                    />

                  </div>
                )}

              </div>
            );
          })}

        </div>

        <button
          className="save-btn"
          onClick={saveAvailability}
        >
          Save Availability
        </button>

      </main>

    </div>
  );
}