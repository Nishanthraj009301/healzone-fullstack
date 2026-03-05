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
          `${process.env.REACT_APP_API_URL}/api/doctors/${id}`
        );
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
            <img
              src="/healonelogo.png"
              alt="Healzone"
              className="header-logo"
            />
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
  return (
    <div className="profile-hero">
      <img
        src={doctor.profile_url || "/doctor-placeholder.png"}
        alt={doctor.name}
      />
      <div className="hero-text">
        <h1>{doctor.name}</h1>
        {doctor.speciality && <p className="speciality">{doctor.speciality}</p>}
        {doctor.focus_area && <p className="focus">{doctor.focus_area}</p>}
      </div>
    </div>
  );
}

/* ================= CLINIC ================= */

function Clinic({ doctor }) {
  return (
    <div className="profile-section">
      <h3>Clinic</h3>
      <p>{doctor.address1}</p>
      <p>{doctor.city}</p>
    </div>
  );
}

/* ================= ABOUT ================= */

function About({ doctor }) {
  return (
    <div className="profile-section">
      <h3>About Doctor</h3>
      <p className="description">{doctor.about || "About not available"}</p>
    </div>
  );
}

/* ================= LOCATION MAP ================= */

function LocationMap({ doctor }) {
  if (!doctor.latitude || !doctor.longitude) return null;

  return (
    <div className="profile-section">
      <h3>Location</h3>
      <iframe
        title="Clinic Location"
        src={`https://www.google.com/maps?q=${doctor.latitude},${doctor.longitude}&z=15&output=embed`}
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

  const hours = (doctor.consultation_hours || []).filter(
    (h) => h.from || h.to
  );

  if (hours.length === 0) {
    return <div className="booking-sticky">No consultation hours</div>;
  }

  const days = [...new Set(hours.map((h) => h.day))];
  const selectedDay = days[dayIndex];

  const slots = hours
    .filter((h) => h.day === selectedDay)
    .flatMap((h) => [h.from?.slice(0, 5), h.to?.slice(0, 5)])
    .filter(Boolean);

  const fee = doctor.Rokka || 0;

  function getNextDate(dayName) {
  const daysList = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

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
    if (!user) {
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
      vendorId: doctor.vendorId,
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
      console.log("User object:", user);

      /* ✅ SEND DATA TO AUTOMATION API */
      const automationPayload = {
        doctorList: [
          {
            location: doctor.city || "",
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

      console.log("Automation Payload:", automationPayload);

      await fetch(`${process.env.REACT_APP_API_URL}/api/automation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(automationPayload),
      });

      // ✅ Google Calendar integration
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