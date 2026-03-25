import { useEffect, useState } from "react";
import "./VendorAvailability.css";

const API = process.env.REACT_APP_API_URL;

export default function VendorAvailability() {

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

    fetch(`${API}/api/vendors/${storedUser._id}`)
      .then(res => res.json())
      .then(data => {

        if (data.success) {
          setAvailability(data.vendor.availability || []);
        }

      });

  }, []);


  const toggleDay = (day) => {

    const exists = availability.find(a => a.day === day);

    if (exists) {

      setAvailability(
        availability.filter(a => a.day !== day)
      );

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

        a.day === day
          ? { ...a, [field]: value }
          : a

      )

    );

  };


  const saveAvailability = async () => {

  const storedUser = JSON.parse(localStorage.getItem("user"));

  // VALIDATION
  for (let a of availability) {

    if (a.start >= a.end) {
      alert(`${a.day}: End time must be after start time`);
      return;
    }

  }

  const res = await fetch(
    `${API}/api/vendors/${storedUser._id}/availability`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        availability: availability
      })
    }
  );

  const data = await res.json();

  if (data.success) {

    setAvailability(data.availability);
    alert("Availability saved successfully");

  }

};


  return (

    <div className="availability-page">

  <div className="availability-header">

    <img
      src="/healonelogo.png"
      alt="HealZone Logo"
      className="availability-logo"
    />

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

    </div>

  );

}