import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import LoginModal from "../../components/Userlogin/LoginModal";
import "./SalonDetailsPage.css";

const FitnessDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [fitness, setFitness] = useState(null);
    const [loading, setLoading] = useState(true);

    const [selectedImage, setSelectedImage] = useState(0);

    const { user } = useContext(AuthContext);

const [selectedService, setSelectedService] = useState(null);

const [showBookingModal, setShowBookingModal] = useState(false);

const [showLogin, setShowLogin] = useState(false);

const [selectedDate, setSelectedDate] = useState("");

const [selectedSlot, setSelectedSlot] = useState("");

const [slots, setSlots] = useState([]);

const [showConfirmModal, setShowConfirmModal] = useState(false);

const [bookingLoading, setBookingLoading] = useState(false);

useEffect(() => {
    fetch(`http://localhost:5000/api/fitness/${id}`, {
        credentials: "include",
    })
        .then((res) => res.json())
        .then((data) => {
            setFitness(data);
            setLoading(false);
        })
        .catch((err) => {
            console.error(err);
            setLoading(false);
        });
}, [id]);

if (loading)
    return <div className="details-loading">Loading Fitness Center...</div>;

if (!fitness)
    return <div className="details-loading">Fitness Center not found.</div>;
    return (
        <div className="details-page">

            {/* ================= HEADER ================= */}

            <header className="details-header">

                <div className="header-inner">

                    <img
                        src="/healonelogo.png"
                        alt="HealZone"
                        className="details-logo"
                        onClick={() => navigate(-1)}
                    />

                </div>

            </header>

            {/* ================= MAIN CARD ================= */}

            <main className="details-layout">

                <div className="details-card">

                    {/* ================= LEFT ================= */}

                    <section className="details-left">

                        {/* ================= HERO ================= */}

                        <div className="hero-gallery">

                            <div className="hero-image-wrapper">

                                <img
                                    className="hero-image"
                                    src={
                                        fitness.ImagesJson?.[selectedImage]?.url ||
                                        "https://via.placeholder.com/1200x700"
                                    }
                                    alt={fitness.VenueName}
                                />

                                <div className="hero-overlay">

                                    <div>

                                        <span className="verified-badge">
                                            ✓ HealZone Verified
                                        </span>

                                        <h1>{fitness.VenueName}</h1>

                                        <div className="hero-rating">

                                            <span>⭐ {fitness.Rating || "4.8"}</span>

                                            {/* <span>
                                                ({fitness.ReviewsCount || 0} Reviews)
                                            </span> */}

                                        </div>

                                        <p>

                                            📍 {fitness.AddressJson?.simpleFormatted}

                                        </p>

                                        {/* <p>

                                            🚗 {fitness.DistanceFormatted}

                                        </p> */}

                                    </div>

                                </div>

                            </div>

                            {/* ================= THUMBNAILS ================= */}

                            <div className="thumbnail-row">

                                {fitness.ImagesJson?.map((img, index) => (

                                    <img
                                        key={index}
                                        src={img.url}
                                        alt=""
                                        className={`thumbnail ${selectedImage === index ? "active" : ""
                                            }`}
                                        onClick={() => setSelectedImage(index)}
                                    />

                                ))}

                            </div>

                        </div>

                        {/* ================= ABOUT ================= */}

                        <div className="details-section">

                            <h2>About Fitness Center</h2>

<p>
  {fitness.VenueName} offers professional fitness training, wellness programs, and experienced trainers to help you achieve your health and fitness goals.
</p>

                        </div>
                        {/* ================= SERVICES ================= */}

                        <div className="details-section">

                            <div className="section-header">

                                <h2>Available Services</h2>

                                <span>
                                    {fitness.ServicesJson?.length || 0} Services
                                </span>

                            </div>



                            <div className="services-grid">
  {fitness.ServicesJson?.map((service) => (
    <div key={service.id} className="service-card">

      <h2 className="service-name">
        {service.name}
      </h2>

      <p className="service-duration">
        ⏱ {service.caption}
      </p>

      <h2 className="service-price">
        {service.formattedRetailPrice}
      </h2>

      <button
    className="book-btn"
    onClick={() => {

    setSelectedService(service);

    setSelectedDate("");

    setSelectedSlot("");

    setSlots([]);

    setShowBookingModal(true);

}}
>
    Book Now
</button>

    </div>
  ))}
</div>
                        </div>

                    </section>

                </div>
                {/* ================= LEFT CONTENT CONTINUES ================= */}

                <section className="details-bottom">

                    {/* ================= GALLERY ================= */}

                    <div className="details-section">

                        <div className="section-header">
                            <h2>Gallery</h2>
                        </div>

                        <div className="gallery-grid">

                            {fitness.ImagesJson?.map((image, index) => (

                                <div
                                    key={index}
                                    className="gallery-item"
                                    onClick={() => setSelectedImage(index)}
                                >

                                    <img
                                        src={image.url}
                                        alt={image.shortDescription || "fitness"}
                                    />

                                </div>

                            ))}

                        </div>

                    </div>

                    {/* ================= LOCATION ================= */}

                    <div className="details-section">

                        <div className="section-header">

                            <h2>Location</h2>

                        </div>

                        <div className="map-card">

                            <iframe
                                title="fitness center Location"
                                src={`https://maps.google.com/maps?q=${fitness.AddressJson.latitude},${fitness.AddressJson.longitude}&z=15&output=embed`}
                                loading="lazy"
                            />

                        </div>

                    </div>

                </section>

                <BookingModal

open={showBookingModal}

service={selectedService}

selectedDate={selectedDate}

setSelectedDate={setSelectedDate}

selectedSlot={selectedSlot}

setSelectedSlot={setSelectedSlot}

slots={slots}

setSlots={setSlots}

onClose={()=>{

setShowBookingModal(false);

}}

onContinue={() => {

    setShowBookingModal(false);

    if (!user) {

        setShowLogin(true);

    } else {

        setShowConfirmModal(true);

    }

}}

/>



<LoginModal

show={showLogin}

onClose={()=>setShowLogin(false)}

onSuccess={() => {

    setShowLogin(false);

    setTimeout(() => {

        setShowConfirmModal(true);

    }, 300);

}}

/>

<ConfirmBooking
  open={showConfirmModal}
  service={selectedService}
  date={selectedDate}
  slot={selectedSlot}
  loading={bookingLoading}
  onClose={() => {
    setShowConfirmModal(false);
  }}
  onConfirm={async () => {

    setBookingLoading(true);

    try {

      const response = await fetch(
        "http://localhost:5000/api/fitness-bookings",
        {
          method: "POST",
          credentials: "include", // send JWT cookie
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
  fitnessID: fitness._id,
  serviceId: selectedService.id,
  serviceName: selectedService.name,
  servicePrice: selectedService.formattedRetailPrice,
  bookingDate: selectedDate,
  bookingTime: selectedSlot,
}),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Booking failed");
      }

      alert(" Fitness Booking Confirmed!");

      setShowConfirmModal(false);

      console.log(data);

    } catch (err) {

      console.error(err);

      alert(err.message);

    } finally {

      setBookingLoading(false);

    }

  }}
/>

            </main>

        </div>

    );

};

function getDurationInMinutes(caption) {
  if (!caption) return 30;

  const text = caption.toLowerCase();

  let minutes = 0;

  const hr = text.match(/(\d+)\s*hr/);
  const min = text.match(/(\d+)\s*min/);

  if (hr) minutes += parseInt(hr[1]) * 60;
  if (min) minutes += parseInt(min[1]);

  return minutes || 30;
}

function generateSlots(duration) {
  const slots = [];

  const start = 10 * 60;
  const end = 17 * 60;

  let current = start;

  while (current + duration <= end) {

    const hour24 = Math.floor(current / 60);
    const minute = current % 60;

    const hour12 =
      hour24 > 12
        ? hour24 - 12
        : hour24 === 0
        ? 12
        : hour24;

    const ampm = hour24 >= 12 ? "PM" : "AM";

    slots.push(
      `${hour12}:${String(minute).padStart(2, "0")} ${ampm}`
    );

    current += duration;
  }

  return slots;
}

function BookingModal({

    open,
    service,

    selectedDate,
    setSelectedDate,

    selectedSlot,
    setSelectedSlot,

    slots,
    setSlots,

    onClose,

    onContinue

}){

    if(!open || !service) return null;

    const handleDateChange=(e)=>{

        const date=e.target.value;

        setSelectedDate(date);

        setSelectedSlot("");

        const duration=getDurationInMinutes(service.caption);

        const generatedSlots=generateSlots(duration);

        setSlots(generatedSlots);

    };

    return(

<div className="modal-backdrop">

<div className="modal-card">

    <div className="modal-content">

<h2>

Book Service

</h2>

<hr/>

<h3>

{service.name}

</h3>

<p>

⏱ {service.caption}

</p>

<p>

Price : {service.formattedRetailPrice}

</p>

<label>

Select Date

</label>

<input
  type="date"
  min={new Date().toISOString().split("T")[0]}
  value={selectedDate}
  onChange={handleDateChange}
/>

{

selectedDate &&

<>

<h3>

Available Slots

</h3>

<div className="slots-grid">

{

slots.map((slot) => (

<button
    type="button"
    style={{
        background: selectedSlot === slot ? "#3b82f6" : "#ffffff",
        color: selectedSlot === slot ? "#ffffff" : "#111827",
        border: "1px solid #3b82f6",
        borderRadius: "12px",
        height: "45px",
        cursor: "pointer"
    }}
    key={slot}
    onClick={() => setSelectedSlot(slot)}
>
    {slot}
</button>

))

}

</div>

</>

}
</div>

<div className="modal-buttons">

<button

className="cancel-btn"

onClick={onClose}

>

Cancel

</button>

<button

className="continue-btn"

disabled={!selectedSlot}

onClick={onContinue}

>

Continue

</button>

</div>

</div>

</div>

);

}

function ConfirmBooking({

open,

service,

date,

slot,

onClose,

onConfirm,

loading

}){

if(!open) return null;

return(

<div className="modal-backdrop">

<div className="modal-card">

<div className="modal-content">

<h2>

Confirm Booking

</h2>

<hr/>

<p>

<b>Service</b><br/>

{service.name}

</p>

<p>

<b>Duration</b><br/>

{service.caption}

</p>

<p>

<b>Price</b><br/>

{service.formattedRetailPrice}

</p>

<p>

<b>Date</b><br/>

{date}

</p>

<p>

<b>Slot</b><br/>

{slot}

</p>

</div>

<div className="modal-buttons">

<button

className="cancel-btn"

onClick={onClose}

>

Cancel

</button>

<button

className="continue-btn"

onClick={onConfirm}

disabled={loading}

>

{loading ? "Booking..." : "Confirm Booking"}

</button>

</div>

</div>

</div>

);

}

export default FitnessDetailsPage;