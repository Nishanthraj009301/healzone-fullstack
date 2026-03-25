import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VendorServices.css";

export default function VendorServices() {

  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [vendor, setVendor] = useState(null);

  /* ================= FETCH SERVICES ================= */

  useEffect(() => {

    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
      navigate("/");
      return;
    }

    fetch(`http://localhost:5000/api/vendors/${storedUser._id}`)
      .then(res => res.json())
      .then(data => {

        if (data.success) {

          setVendor(data.vendor);

          const dbServices = data.vendor.services;

          if (Array.isArray(dbServices)) {

            setServices(dbServices);

          } else if (typeof dbServices === "string") {

            setServices([
              {
                _id: "temp1",
                name: dbServices,
                description: "",
                price: "",
                duration: ""
              }
            ]);

          } else {

            setServices([]);

          }

        }

      })
      .catch(err => {
        console.error("Service fetch error:", err);
      });

  }, [navigate]);


  /* ================= DELETE SERVICE ================= */

  const deleteService = async (serviceId) => {

    const confirmDelete = window.confirm("Delete this service?");

    if (!confirmDelete) return;

    const storedUser = JSON.parse(localStorage.getItem("user"));

    try {

      const res = await fetch(
        `http://localhost:5000/api/vendors/${storedUser._id}/services/${serviceId}`,
        {
          method: "DELETE"
        }
      );

      const data = await res.json();

      if (data.success) {

        setServices(prev =>
          prev.filter(service => service._id !== serviceId)
        );

      }

    } catch (err) {

      console.error("Delete service error:", err);

    }

  };


  /* ================= LOGOUT ================= */

  const logout = () => {

    localStorage.removeItem("user");
    navigate("/");

  };


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
          Logout
        </button>

      </aside>


      {/* MAIN */}

      <main className="main">

        {/* TOPBAR */}

        <div className="topbar">

          <input
            className="search"
            placeholder="Search services..."
          />

          <div className="profile">
            {vendor?.firstName || vendor?.name}
          </div>

        </div>


        {/* SERVICES SECTION */}

        <div className="vendor-services-page">

          <div className="services-header">

            <h1>My Services</h1>

            <button
              className="add-service-btn"
              onClick={() => navigate("/vendor/add-service")}
            >
              + Add Service
            </button>

          </div>


          {services.length === 0 && (

            <div className="no-services">
              <p>No services added yet</p>
            </div>

          )}


          <div className="services-grid">

            {services.map(service => (

              <div className="service-card" key={service._id}>

                <h3>{service.name}</h3>

                {service.description && (
                  <p className="service-desc">
                    {service.description}
                  </p>
                )}

                {(service.price || service.duration) && (
                  <p className="service-meta">
                    {service.price && `₹${service.price}`}
                    {service.price && service.duration && " • "}
                    {service.duration && `${service.duration} mins`}
                  </p>
                )}


                {/* ACTION BUTTONS */}

                <div className="service-actions">

                  <button
                    className="edit-btn"
                    onClick={() =>
                      navigate(`/vendor/edit-service/${service._id}`)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => deleteService(service._id)}
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>

      </main>

    </div>

  );

}