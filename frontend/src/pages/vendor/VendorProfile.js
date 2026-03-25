import { useEffect, useState } from "react";
import "./VendorProfile.css";

export default function VendorProfile() {

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

    fetch(`http://localhost:5000/api/vendors/${user._id}`)
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

  }, []);

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

    if (photo) {
      form.append("photo", photo);
    }

    const res = await fetch(
      `http://localhost:5000/api/vendors/${user._id}/update`,
      {
        method: "PUT",
        body: form
      }
    );

    const data = await res.json();

    if (data.success) {
      setVendor(data.vendor);
      setEditMode(false);
      alert("Profile updated");
    }

  };

  if (!vendor) return <div>Loading...</div>;

  return (

    <div className="vendor-profile">

      {/* ================= HEADER WITH LOGO ================= */}

      <div className="profile-header">

        <img
          src="/healonelogo.png"
          alt="HealZone"
          className="profile-logo"
        />

        <h1>Vendor Profile</h1>

      </div>


      {/* ================= PROFILE COMPLETION ================= */}

      <div className="profile-completion">

        <p>Profile Completion: {completion}%</p>

        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: `${completion}%` }}
          />
        </div>

      </div>


      {/* ================= PROFILE CARD ================= */}

      <div className="profile-card">

        <div className="profile-photo">

          {vendor.photo ? (
            <img
              src={`http://localhost:5000/uploads/${vendor.photo}`}
              alt="profile"
            />
          ) : (
            <div className="photo-placeholder">
              {vendor.firstName?.charAt(0)}
            </div>
          )}

          {editMode && (
            <input
              type="file"
              onChange={(e) => setPhoto(e.target.files[0])}
            />
          )}

        </div>


        <div className="profile-details">

          {editMode ? (

            <>
              <input
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />

              <input
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />

              <input
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
              />

              <input
                value={formData.speciality}
                onChange={(e) =>
                  setFormData({ ...formData, speciality: e.target.value })
                }
              />

              <input
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />

              <button onClick={updateProfile}>
                Save
              </button>
            </>

          ) : (

            <>
              <p><b>Name:</b> {vendor.firstName} {vendor.lastName}</p>
              <p><b>Email:</b> {vendor.email}</p>
              <p><b>Phone:</b> {vendor.mobile}</p>
              <p><b>Speciality:</b> {vendor.speciality}</p>
              <p><b>Address:</b> {vendor.address}</p>

              <button onClick={() => setEditMode(true)}>
                Edit Profile
              </button>
            </>

          )}

        </div>

      </div>

    </div>

  );

}