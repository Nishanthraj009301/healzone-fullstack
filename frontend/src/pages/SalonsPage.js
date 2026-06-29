import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";

import { useNavigate } from "react-router-dom";

import "./SalonsPage.css";

const LIMIT = 20;

const SalonsPage = () => {
    const navigate = useNavigate();
  const [salons, setSalons] = useState([]);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [hasMore, setHasMore] = useState(true);

  const [search, setSearch] = useState("");

  const observer = useRef();

  const loader = useRef();

  const fetchSalons = useCallback(async (pageNo) => {
    try {
      if (pageNo === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const res = await fetch(
  `https://www.heal-zone.com/api/salons?page=${pageNo}&limit=${LIMIT}`,
  {
    credentials: "include",
  }
);

      if (!res.ok) {
        throw new Error("Failed to fetch salons");
      }

      const data = await res.json();

      setSalons((prev) => [...prev, ...data.salons]);

      setHasMore(data.hasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchSalons(page);
  }, [page, fetchSalons]);

  useEffect(() => {
    if (loading) return;

    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver((entries) => {
      if (
        entries[0].isIntersecting &&
        hasMore &&
        !loadingMore
      ) {
        setPage((prev) => prev + 1);
      }
    });

    if (loader.current) {
      observer.current.observe(loader.current);
    }

    return () => observer.current.disconnect();
  }, [hasMore, loadingMore, loading]);

  const filteredSalons = useMemo(() => {
    const q = search.toLowerCase();

    return salons.filter((salon) => {
      return (
        salon.SalonName?.toLowerCase().includes(q) ||
        salon.AddressJson?.simpleFormatted
          ?.toLowerCase()
          .includes(q) ||
        salon.ServicesJson?.[0]?.name
          ?.toLowerCase()
          .includes(q)
      );
    });
  }, [salons, search]);

    return (
    <div className="salon-page">
      {/* Header */}

      <div className="salon-header">
  <div className="salon-header-inner">

    <button
      className="logo-btn"
      onClick={() => navigate("/")}
    >
      <img
        src="/healonelogo.png"
        alt="HealZone"
      />
    </button>

    <div className="search-box">
      <input
        type="text"
        placeholder="Search salon, service..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>

  </div>
</div>

<div className="salon-title">
  <h1>Discover Salons</h1>
  <p>Find top-rated salons near you</p>
</div>

      {/* White Container */}

      <div className="salon-shell">

        {loading ? (

          <div className="empty-state">
            Loading salons...
          </div>

        ) : filteredSalons.length === 0 ? (

          <div className="empty-state">
            No salons found.
          </div>

        ) : (

          <>
  <div className="salon-card-grid">

    {filteredSalons.map((salon) => {

      const service = salon.ServicesJson?.[0];

      return (

        <div
          key={salon._id}
          className="salon-card"
          onClick={() => navigate(`/salon/${salon._id}`)}
        >

          <img
            className="salon-image"
            src={
              salon.ImagesJson?.[0]?.url ||
              "https://via.placeholder.com/400x250"
            }
            alt={salon.SalonName}
          />

          <div className="rating-row">
            <span className="rating">
              ⭐ {salon.Rating}
            </span>

            <span className="reviews">
              {salon.ReviewsCount} Reviews
            </span>
          </div>

          <h3>{salon.SalonName}</h3>

          <p className="address">
            📍 {salon.AddressJson?.simpleFormatted}
          </p>

          {service && (
            <>
              <p className="service">💇 {service.name}</p>
              <p className="price">💰 {service.formattedRetailPrice}</p>
              <p className="duration">⏱ {service.caption}</p>
            </>
          )}

        </div>

      );

    })}

  </div>

  {/* Infinite Scroll Loader */}
  <div
    ref={loader}
    style={{
      padding: "40px",
      textAlign: "center",
    }}
  >
    {loadingMore && <h3>Loading more salons...</h3>}

    {!hasMore && <h3>🎉 You've reached the end.</h3>}
  </div>
</>

        )}

      </div>
    </div>
  );
};

export default SalonsPage;