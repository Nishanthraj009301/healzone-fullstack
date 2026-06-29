import React, { useEffect, useState } from "react";

const SpasPage = () => {
  const [spas, setSpas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpas = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/spas?t=${Date.now()}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch spas");
        }

        const data = await res.json();
        setSpas(data);
      } catch (err) {
        console.error("Error fetching spas:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpas();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>Loading spas...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>Spas</h1>

      {spas.length === 0 ? (
        <p>No spas found.</p>
      ) : (
        spas.map((spa) => (
          <div
            key={spa._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              background: "#fff",
            }}
          >
            {/* Image */}
            {spa.ImagesJson?.length > 0 && (
              <img
                src={spa.ImagesJson[0].url}
                alt={spa.SalonName}
                style={{
                  width: "100%",
                  height: "220px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "15px",
                }}
              />
            )}

            {/* Name */}
            <h2>{spa.SalonName}</h2>

            {/* Rating */}
            <p>
              <strong>⭐ Rating:</strong> {spa.Rating}
            </p>

            {/* Reviews */}
            <p>
              <strong>💬 Reviews:</strong> {spa.ReviewsCount}
            </p>

            {/* Address */}
            <p>
              <strong>📍 Address:</strong>{" "}
              {spa.AddressJson?.simpleFormatted || "Not Available"}
            </p>

            {/* Distance */}
            <p>
              <strong>📏 Distance:</strong>{" "}
              {spa.DistanceFormatted || "N/A"}
            </p>

            {/* Service Count */}
            <p>
              <strong>💆 Services:</strong> {spa.ServiceCount}
            </p>

            {/* First Service */}
            {spa.ServicesJson?.length > 0 && (
              <>
                <p>
                  <strong>Service:</strong> {spa.ServicesJson[0].name}
                </p>

                <p>
                  <strong>Price:</strong>{" "}
                  {spa.ServicesJson[0].formattedRetailPrice}
                </p>

                <p>
                  <strong>Duration:</strong>{" "}
                  {spa.ServicesJson[0].caption}
                </p>
              </>
            )}

            <button
              style={{
                marginTop: "15px",
                padding: "10px 20px",
                background: "#4CAF50",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Book Now
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default SpasPage;