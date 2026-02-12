import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./DoctorProfile.css";
import Loader from "./loader/Loader"; // adjust path if needed

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH DOCTOR ================= */

  useEffect(() => {
    let mounted = true;

    async function fetchDoctor() {
      try {
        const res = await fetch(`http://localhost:5000/api/doctors/${id}`);
        if (!res.ok) throw new Error("Doctor not found");
        const data = await res.json();
        if (mounted) setDoctor(data);
      } catch (err) {
        if (mounted) setDoctor(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchDoctor();
    return () => (mounted = false);
  }, [id]);

  /* ================= LOADER STATES ================= */

  if (loading) return <Loader />;
  if (!doctor)
    return (
      <div className="doctor-profile-page">
        <div className="container">Doctor not found</div>
      </div>
    );

  return (
    <div className="doctor-profile-page">
      {/* ================= HEADER ================= */}
      <header className="header">
        <div className="header-inner">
          <button className="logo-button" onClick={() => navigate("/")}>
            <img
              src="/healonelogo.png"
              alt="Healzone"
              className="header-logo"
            />
          </button>
        </div>
      </header>

      {/* ================= CONTENT ================= */}
      <main className="profile-layout">
        <div className="profile-card">
          <section className="profile-info">
            <Hero doctor={doctor} />
            <Clinic doctor={doctor} />
            <About doctor={doctor} />
          </section>


          <section className="profile-booking">
            <Appointment doctor={doctor} />
          </section>
        </div>
      </main>

    </div>
  );
}

/* ================= LEFT ================= */

function Hero({ doctor }) {
  return (
    <div className="profile-hero">
      <img
        src={doctor.profile_url || "/doctor-placeholder.png"}
        alt={doctor.name}
      />
      <div className="hero-text">
        <h1>{doctor.name}</h1>
        {doctor.speciality && (
          <p className="speciality">{doctor.speciality}</p>
        )}
        {doctor.focus_area && <p className="focus">{doctor.focus_area}</p>}
      </div>
    </div>
  );
}

function Clinic({ doctor }) {
  const hasLocation =
    doctor.latitude && doctor.longitude;

  return (
    <div className="profile-section">
      <h3>Clinic</h3>

      <p>{doctor.address1}</p>
      <p>{doctor.city}</p>

      {hasLocation && (
        <iframe
          title="Clinic Location"
          src={`https://www.google.com/maps?q=${doctor.latitude},${doctor.longitude}&z=15&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
    </div>
  );
}

function About({ doctor }) {
  return (
    <div className="profile-section">
      <h3>About Doctor</h3>
      <p className="description">
        {doctor.about || "About not available"}
      </p>
    </div>
  );
}


/* ================= SLOT HELPERS ================= */

function extractSlotsForDay(hours, day) {
  const slots = [];
  hours.forEach(h => {
    if (h.day === day) {
      if (h.from) slots.push(h.from.slice(0, 5));
      if (h.to) slots.push(h.to.slice(0, 5));
    }
  });
  return slots;
}

/* ================= RIGHT ================= */

function Appointment({ doctor }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [dayIndex, setDayIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const hours = (doctor.consultation_hours || []).filter(
    h => h.from || h.to
  );

  if (hours.length === 0) {
    return <div className="booking-sticky">No consultation hours</div>;
  }

  const days = [...new Set(hours.map(h => h.day))];
  const selectedDay = days[dayIndex];
  const slots = extractSlotsForDay(hours, selectedDay);
  const fee = doctor.Rokka || 0;

  return (
    <div className="booking-sticky">
      <h3>Book Appointment</h3>

      {/* DAY SELECTOR */}
      <div className="day-selector">
        {days.map((d, i) => (
          <button
            key={d}
            className={i === dayIndex ? "day active" : "day"}
            onClick={() => {
              setDayIndex(i);
              setSelectedIndex(null);
            }}
          >
            {d}
          </button>
        ))}
      </div>

      {/* SLOTS */}
      <div className="booking-slots">
        {slots.map((time, idx) => (
          <button
            key={idx}
            className={`slot ${selectedIndex === idx ? "active" : ""}`}
            onClick={() => setSelectedIndex(idx)}
          >
            {time}
          </button>
        ))}
      </div>

      <button
        className="cta"
        disabled={selectedIndex === null}
        onClick={() => setShowModal(true)}
      >
        Confirm Booking
      </button>

      {/* MODALS */}
      <BookingModal
        open={showModal}
        doctor={doctor}
        date={selectedDay}
        time={slots[selectedIndex]}
        fee={fee}
        onClose={booking => {
          setShowModal(false);
          if (booking) setBookingSuccess(booking);
        }}
      />

      <BookingSuccess
        booking={bookingSuccess}
        onClose={() => setBookingSuccess(null)}
      />
    </div>
  );
}

/* ================= BOOKING MODAL ================= */

function BookingModal({ open, onClose, doctor, date, time, fee }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const submit = async () => {
    if (!form.fullName || !form.email || !form.phone) {
      alert("Please fill all fields");
      return;
    }

    if (submitting) return;
    setSubmitting(true);

    // ✅ FIXED PAYLOAD
    const payload = {
      doctorId: doctor._id,
      vendorId: doctor.vendorId || null,

      // 🔥 IMPORTANT FIX: real date instead of weekday
      bookingDate: new Date().toISOString().slice(0, 10),

      bookingTime: time,

      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),

      consultationFee: fee,
    };

    console.log("Booking payload:", payload);

    try {
      const res = await fetch(
        "http://localhost:5000/api/bookings/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Booking failed");
        return;
      }

      onClose(data.booking);
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>Book Appointment</h3>

        <input
          placeholder="Full Name"
          value={form.fullName}
          onChange={e =>
            setForm({ ...form, fullName: e.target.value })
          }
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={e =>
            setForm({ ...form, email: e.target.value })
          }
        />
        <input
          placeholder="Phone"
          value={form.phone}
          onChange={e =>
            setForm({ ...form, phone: e.target.value })
          }
        />

        <button onClick={submit} disabled={submitting}>
          {submitting ? "Booking..." : "Book"}
        </button>
        <button onClick={() => onClose(null)}>Cancel</button>
      </div>
    </div>
  );
}


/* ================= SUCCESS MODAL ================= */

function BookingSuccess({ booking, onClose }) {
  if (!booking) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>Booking Confirmed 🎉</h3>
        <p>
          <b>Reference:</b> {booking.referenceNumber}
        </p>
        <p>
          <b>Name:</b> {booking.fullName}
        </p>
        <p>
          <b>Date:</b> {booking.bookingDate}
        </p>
        <p>
          <b>Time:</b> {booking.bookingTime}
        </p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
