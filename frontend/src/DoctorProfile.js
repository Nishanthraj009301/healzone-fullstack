import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./DoctorProfile.css";
import Loader from "./loader/Loader";
import { AuthContext } from "./context/AuthContext";
import LoginModal from "./components/Userlogin/LoginModal";
import { initGoogleApi, GoogleCalendar } from "./utils/googleCalendar";

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchDoctor() {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/doctors/${id}?t=${Date.now()}`
        );
        if (!res.ok) throw new Error("Doctor not found");

        const data = await res.json();
        // console.log("Doctor API response:", data);

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

  if (loading) return <Loader />;

  if (!doctor)
    return (
      <div className="doctor-profile-page">
        <div className="container">Doctor not found</div>
      </div>
    );

  return (
    <div className="doctor-profile-page">
      <header className="header">
        <div className="header-inner">
          <button className="logo-button" onClick={() => navigate("/")}>
            <img src="/healonelogo.png" alt="Healzone" className="header-logo" />
          </button>
        </div>
      </header>

      <main className="profile-layout">
        <div className="profile-card">
          <section className="profile-info">
            <Hero doctor={doctor} />
            <Clinic doctor={doctor} />
            <About doctor={doctor} />
            <LocationMap doctor={doctor} />
          </section>

          <section className="profile-booking">
            <Appointment doctor={doctor} />
          </section>
        </div>
      </main>
    </div>
  );
}

/* ================= HERO ================= */

function Hero({ doctor }) {
  const imageUrl = doctor.profile_url
  ? doctor.profile_url.startsWith("http")
    ? doctor.profile_url
    : `http://localhost:5000${doctor.profile_url}`
  : "/doctor-placeholder.png";

  const name =
    doctor.name ||
    `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim();

  const focus = doctor.focus_area || doctor.speciality || "";

  // 🔍 ADD DEBUG HERE
  // console.log("PHOTO:", doctor.photo);
  // console.log("PROFILE_URL:", doctor.profile_url);
  // console.log("FINAL IMAGE URL:", imageUrl);

  return (
    <div className="profile-hero">
      <img src={imageUrl} alt={name} />

      <div className="hero-text">
        <h1>{name}</h1>

        {doctor.speciality && (
          <p className="speciality">{doctor.speciality}</p>
        )}

        {focus && <p className="focus">{focus}</p>}
      </div>
    </div>
  );
}

/* ================= CLINIC ================= */

function Clinic({ doctor }) {
  return (
    <div className="profile-section">
      <h3>Clinic</h3>
      <p>{doctor.address1 || doctor.address}</p>
      <p>{doctor.city || doctor.state}</p>
    </div>
  );
}

/* ================= ABOUT ================= */

function About({ doctor }) {
  return (
    <div className="profile-section">
      <h3>About Doctor</h3>
      <p className="description">
        {doctor.about || doctor.discription || "About not available"}
      </p>
    </div>
  );
}

/* ================= LOCATION ================= */

function LocationMap({ doctor }) {
  const lat = doctor.latitude || doctor.location?.coordinates?.[1];
  const lng = doctor.longitude || doctor.location?.coordinates?.[0];

  if (!lat || !lng) return null;

  return (
    <div className="profile-section">
      <h3>Location</h3>
      <iframe
        title="Clinic Location"
        src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
        loading="lazy"
      />
    </div>
  );
}

/* ================= APPOINTMENT ================= */

function Appointment({ doctor }) {
  const { user } = useContext(AuthContext);

  const [selectedIndex, setSelectedIndex] = useState(null);
  const [dayIndex, setDayIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  let days = [];
  let slots = [];

  /* ================= BACKEND SLOTS ================= */
  if (doctor.slots?.length > 0) {
    days = doctor.slots.map(d => d.day);
    const selectedDay = days[dayIndex];
    const selectedSlots = doctor.slots.find(d => d.day === selectedDay);
    slots = selectedSlots ? selectedSlots.slots : [];
  }

  /* ================= VENDOR AVAILABILITY ================= */
  else if (doctor.availability?.length > 0) {
    days = doctor.availability.map(a => a.day);

    const selectedDay = days[dayIndex];
    const availability = doctor.availability.find(a => a.day === selectedDay);

    if (availability) {
      const start = availability.start;
      const end = availability.end;
      const duration = doctor.appointmentDuration || 30;

      const startMinutes =
        parseInt(start.split(":")[0]) * 60 +
        parseInt(start.split(":")[1]);

      const endMinutes =
        parseInt(end.split(":")[0]) * 60 +
        parseInt(end.split(":")[1]);

      for (let t = startMinutes; t < endMinutes; t += duration) {
        const hour = String(Math.floor(t / 60)).padStart(2, "0");
        const minute = String(t % 60).padStart(2, "0");
        slots.push(`${hour}:${minute}`);
      }
    }
  }

  /* ================= CSV CONSULTATION HOURS ================= */
  else {
    const hours = Object.keys(doctor)
      .filter(key => key.startsWith("consultation_hours"))
      .map(key => doctor[key])
      .filter(h => h?.from && h?.to);

    if (hours.length > 0) {
      days = [...new Set(hours.map(h => h.day))];

      const selectedDay = days[dayIndex];
      const selectedHours = hours.find(h => h.day === selectedDay);

      if (selectedHours) {
        const start = selectedHours.from;
        const end = selectedHours.to;
        const duration = doctor.appointmentDuration || 30;

        const startMinutes =
          parseInt(start.split(":")[0]) * 60 +
          parseInt(start.split(":")[1]);

        const endMinutes =
          parseInt(end.split(":")[0]) * 60 +
          parseInt(end.split(":")[1]);

        for (let t = startMinutes; t < endMinutes; t += duration) {
          const hour = String(Math.floor(t / 60)).padStart(2, "0");
          const minute = String(t % 60).padStart(2, "0");
          slots.push(`${hour}:${minute}`);
        }
      }
    }
  }

  if (days.length === 0) {
    return <div className="booking-sticky">No consultation hours</div>;
  }

  const selectedDay = days[dayIndex];
  const fee = doctor.consultationFee || doctor.Rokka || 0;

  function getNextDate(dayName) {
    const daysList = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const today = new Date();
    const todayIndex = today.getDay();
    const targetIndex = daysList.indexOf(dayName);

    let diff = targetIndex - todayIndex;
    if (diff <= 0) diff += 7;

    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + diff);

    return nextDate.toISOString().split("T")[0];
  }

  const handleConfirmClick = () => {
    if (!user || !user.id) {
      setShowLogin(true);
      return;
    }
    setShowModal(true);
  };

  return (
    <div className="booking-sticky">
      <h3>Book Appointment</h3>

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
        onClick={handleConfirmClick}
      >
        Confirm Booking
      </button>

      <LoginModal
        show={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => {
          setShowLogin(false);
          setShowModal(true);
        }}
      />

      <BookingModal
        open={showModal}
        doctor={doctor}
        date={getNextDate(selectedDay)}
        time={slots[selectedIndex]}
        fee={fee}
        onClose={(booking) => {
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
  const { googleAccessToken, user } = useContext(AuthContext);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const submit = async () => {
    if (!doctor?._id) {
      alert("Doctor ID missing.");
      return;
    }

    if (submitting) return;
    setSubmitting(true);

    const payload = {
      doctorId: doctor._id,
      vendorId: doctor._id,
      bookingDate: date,
      bookingTime: time,
      consultationFee: Number(fee),
    };

    try {
      const res = await fetch(
  `${process.env.REACT_APP_API_URL}/api/bookings/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Booking failed");
        return;
      }

      /* AUTOMATION API */
      const automationPayload = {
        doctorList: [
          {
            location: doctor.city || doctor.state || "",
            speciality: doctor.speciality || "",
            doctorName: doctor.name || "",
            dateTime: `${date} ${time}`,
          },
        ],
        patientList: [
          {
            name: user?.name || "",
            mobileNumber: user?.mobileNumber || "",
            emailId: user?.email || "",
          },
        ],
      };

      await fetch(`${process.env.REACT_APP_API_URL}/api/automation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(automationPayload),
      });

      /* GOOGLE CALENDAR */
      if (googleAccessToken) {
        await initGoogleApi(googleAccessToken);

        await GoogleCalendar({
          appointment_with: doctor.name,
          appointment_date: date,
          appointment_time: time,
          remarks: "Booked via HealZone",
        });
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
        <h3>Confirm Booking</h3>
        <p>Consultation Fee: ₹{fee}</p>

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
        <p><b>Reference:</b> {booking.referenceNumber}</p>
        <p><b>Date:</b> {new Date(booking.bookingDate).toDateString()}</p>
        <p><b>Time:</b> {booking.bookingTime}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}