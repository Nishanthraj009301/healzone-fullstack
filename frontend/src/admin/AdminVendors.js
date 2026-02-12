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
        const res = await fetch("http://localhost:5000/api/admin/vendors");
        const data = await res.json();

        console.log("ADMIN VENDORS FROM API 👉", data);

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
        `http://localhost:5000/api/admin/vendors/${id}`,
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

      // Remove vendor from list after decision
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

      {!loading &&
        vendors.map((v) => (
          <div key={v._id} className="vendor-card">
            <h4>
              {v.firstName} {v.lastName}
            </h4>

            <div className="vendor-meta">
              <span>Email: {v.email}</span>
              <span>Phone: {v.mobile}</span>
              <span>Status: {v.status}</span>
            </div>

            <div className="vendor-actions">
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
          </div>
        ))}
    </div>
  );
}
