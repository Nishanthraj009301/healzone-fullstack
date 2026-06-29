import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VendorProfile.css";

export default function VendorProfile() {

  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    address: "",
    speciality: ""
  });

  const [photo, setPhoto] = useState(null);

  /* ================= FETCH PROFILE ================= */

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user._id) {
      navigate("/");
      return;
    }

    fetch(`https://www.heal-zone.com/api/vendors/${user._id}`)
      .then(res => res.json())
      .then(data => {
        setVendor(data.vendor);

        setFormData({
          firstName: data.vendor.firstName || "",
          lastName: data.vendor.lastName || "",
          mobile: data.vendor.mobile || "",
          address: data.vendor.address || "",
          speciality: data.vendor.speciality || ""
        });
      });
  }, [navigate]);

  /* ================= PROFILE COMPLETION ================= */

  const profileFields = [
    vendor?.firstName,
    vendor?.lastName,
    vendor?.mobile,
    vendor?.address,
    vendor?.speciality,
    vendor?.photo
  ];

  const completed = profileFields.filter(Boolean).length;
  const completion = Math.round((completed / profileFields.length) * 100);

  /* ================= UPDATE PROFILE ================= */

  const updateProfile = async () => {

    const user = JSON.parse(localStorage.getItem("user"));
    const form = new FormData();

    Object.keys(formData).forEach(key => {
      form.append(key, formData[key]);
    });

    if (photo) form.append("photo", photo);

    const res = await fetch(
      `https://www.heal-zone.com/api/vendors/${user._id}/update`,
      {
        method: "PUT",
        body: form
      }
    );

    const data = await res.json();

    if (data.success) {
      setVendor(data.vendor);
      setEditMode(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!vendor) return <div>Loading...</div>;

  return (
    <div className="dashboard">

      {/* SIDEBAR */}
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

        {/* LOGOUT */}
        <button className="logout" onClick={logout}>
        
        Logout
        </button>

      </aside>

      {/* MAIN */}
      <main className="profile-main">

        {/* HEADER */}
        <div className="profile-top">

          <div className="profile-left">
            {vendor.photo ? (
              <img
                src={`https://www.heal-zone.com/uploads/${vendor.photo}`}
                alt="profile"
                className="avatar"
              />
            ) : (
              <div className="avatar-placeholder">
                {vendor.firstName?.charAt(0)}
              </div>
            )}

            <div>
              <h2>{vendor.firstName} {vendor.lastName}</h2>
              <p>{vendor.speciality || "No speciality added"}</p>
            </div>
          </div>

          <button
            onClick={() => setEditMode(!editMode)}
            className="edit-toggle"
          >
            {editMode ? "Cancel" : "Edit Profile"}
          </button>

        </div>

        {/* PROGRESS */}
        <div className="profile-progress">
          <div className="progress-info">
            <span>Profile Completion</span>
            <span>{completion}%</span>
          </div>

          <div className="progress-bar">
            <div className="progress" style={{ width: `${completion}%` }} />
          </div>
        </div>

        {/* GRID */}
        <div className="profile-grid">

          {/* BASIC INFO */}
          <div className="card">
            <h3>Basic Info</h3>

            {editMode ? (
              <>
                <input
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e)=>setFormData({...formData, firstName:e.target.value})}
                />

                <input
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e)=>setFormData({...formData, lastName:e.target.value})}
                />

                <input
                  placeholder="Mobile"
                  value={formData.mobile}
                  onChange={(e)=>setFormData({...formData, mobile:e.target.value})}
                />

                <button onClick={updateProfile}>Save</button>
              </>
            ) : (
              <>
                <div className="info-row">
  <span className="label">Name</span>
  <span className="value">{vendor.firstName} {vendor.lastName}</span>
</div>

<div className="info-row">
  <span className="label">Email</span>
  <span className="value">{vendor.email}</span>
</div>

<div className="info-row">
  <span className="label">Phone</span>
  <span className="value">{vendor.mobile}</span>
</div>
              </>
            )}
          </div>

          {/* PROFESSIONAL */}
          <div className="card">
            <h3>Professional Details</h3>

            {editMode ? (
              <>
                <input
                  placeholder="Speciality"
                  value={formData.speciality}
                  onChange={(e)=>setFormData({...formData, speciality:e.target.value})}
                />

                <input
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e)=>setFormData({...formData, address:e.target.value})}
                />
              </>
            ) : (
              <>
                <div className="info-row">
  <span className="label">Speciality</span>
  <span className="value">{vendor.speciality}</span>
</div>

<div className="info-row">
  <span className="label">Address</span>
  <span className="value">{vendor.address}</span>
</div>
              </>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}