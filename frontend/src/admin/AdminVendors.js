import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminVendors.css";

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* ================= ADMIN GUARD ================= */
  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) {
      navigate("/admin/login");
    }
  }, [navigate]);

  /* ================= FETCH VENDORS ================= */
  useEffect(() => {
    async function fetchVendors() {
      try {
        const res = await fetch(
  `${process.env.REACT_APP_API_URL}/api/admin/vendors`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch vendors");
        }

        setVendors(data);
      } catch (err) {
        console.error("FETCH ERROR", err);
        alert("Failed to load vendors");
      } finally {
        setLoading(false);
      }
    }

    fetchVendors();
  }, []);

  /* ================= UPDATE STATUS ================= */
  async function updateStatus(id, status) {
    try {
      const res = await fetch(
  `${process.env.REACT_APP_API_URL}/api/admin/vendors/${id}`,
  {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  }
);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Update failed");
      }

      setVendors((prev) => prev.filter((v) => v._id !== id));
    } catch (err) {
      console.error("UPDATE ERROR", err);
      alert("Failed to update vendor status");
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>Pending Vendor Requests</h2>
        <button
          className="admin-logout"
          onClick={() => {
            localStorage.removeItem("isAdmin");
            navigate("/");
          }}
        >
          Logout
        </button>
      </div>

      {loading && <div className="admin-empty">Loading...</div>}

      {!loading && vendors.length === 0 && (
        <div className="admin-empty">No pending vendor requests</div>
      )}

      {!loading && vendors.length > 0 && (
        <div className="table-wrapper">
          <table className="vendor-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Category</th>
                <th>Speciality</th>
                <th>Fee</th>
                <th>Duration</th>
                <th>Location</th>
                <th>Services</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {vendors.map((v) => (
                <tr key={v._id}>
                  <td>{v.firstName} {v.lastName}</td>
                  <td>{v.email}</td>
                  <td>{v.mobile}</td>
                  <td>{v.category}</td>
                  <td>{v.speciality}</td>
                  <td>₹{v.consultationFee}</td>
                  <td>{v.appointmentDuration} mins</td>
                  <td>{v.state}, {v.country}</td>
                  <td>
                    {Array.isArray(v.services)
                      ? v.services.join(", ")
                      : v.services}
                  </td>
                  <td>
                    <span className={`status-badge ${v.status.toLowerCase()}`}>
                      {v.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-approve"
                        onClick={() => updateStatus(v._id, "APPROVED")}
                      >
                        Approve
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => updateStatus(v._id, "REJECTED")}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
}