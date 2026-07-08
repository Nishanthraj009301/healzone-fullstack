import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";

import { useNavigate } from "react-router-dom";

import "./SalonsPage.css"; // Keep same CSS

const LIMIT = 20;

const SpasPage = () => {
  const navigate = useNavigate();

  const [spas, setSpas] = useState([]);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [hasMore, setHasMore] = useState(true);

  const [search, setSearch] = useState("");

  const observer = useRef();
  const loader = useRef();
  const fetchedPages = useRef(new Set());

const fetchSpas = useCallback(async (pageNo) => {
  if (fetchedPages.current.has(pageNo)) return;

  fetchedPages.current.add(pageNo);

  try {
    if (pageNo === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    const res = await fetch(
      `https://www.heal-zone.com/api/spas?page=${pageNo}&limit=${LIMIT}`,
      {
        credentials: "include",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch spas");
    }

    const data = await res.json();

    console.log("API Response:", data);

    if (pageNo === 1) {
      setSpas(data.spas);
    } else {
      setSpas((prev) => [...prev, ...data.spas]);
    }

    setHasMore(data.hasMore);

  } catch (err) {
    fetchedPages.current.delete(pageNo);
    console.error(err);
  } finally {
    setLoading(false);
    setLoadingMore(false);
  }
}, []);

  useEffect(() => {
    fetchSpas(page);
  }, [page, fetchSpas]);

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

  const filteredSpas = useMemo(() => {
    const q = search.toLowerCase();

    return spas.filter((spa) => {
      return (
        spa.SalonName?.toLowerCase().includes(q) ||
        spa.AddressJson?.simpleFormatted
          ?.toLowerCase()
          .includes(q) ||
        spa.ServicesJson?.[0]?.name
          ?.toLowerCase()
          .includes(q)
      );
    });
  }, [spas, search]);

  return (
    <div className="salon-page">
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
              placeholder="Search spa, service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="salon-title">
        <h1>Discover Spas</h1>
        <p>Find top-rated spas near you</p>
      </div>

      <div className="salon-shell">
        {loading ? (
          <div className="empty-state">
            Loading spas...
          </div>
        ) : filteredSpas.length === 0 ? (
          <div className="empty-state">
            No spas found.
          </div>
        ) : (
          <>
            <div className="salon-card-grid">
              {filteredSpas.map((spa) => {
                const service = spa.ServicesJson?.[0];

                return (
                  <div
                    key={spa._id}
                    className="salon-card"
                    onClick={() => navigate(`/spa/${spa._id}`)}
                  >
                    <img
                      className="salon-image"
                      src={
                        spa.ImagesJson?.[0]?.url ||
                        "https://via.placeholder.com/400x250"
                      }
                      alt={spa.SalonName}
                    />

                    <div className="rating-row">
                      <span className="rating">
                        ⭐ {spa.Rating}
                      </span>

                      <span className="reviews">
                        {spa.ReviewsCount} Reviews
                      </span>
                    </div>

                    <h3>{spa.SalonName}</h3>

                    <p className="address">
                      📍 {spa.AddressJson?.simpleFormatted}
                    </p>

                    {service && (
                      <>
                        <p className="service">
                          💆 {service.name}
                        </p>

                        <p className="price">
                          💰 {service.formattedRetailPrice}
                        </p>

                        <p className="duration">
                          ⏱ {service.caption}
                        </p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div
              ref={loader}
              style={{
                padding: "40px",
                textAlign: "center",
              }}
            >
              {loadingMore && (
                <h3>Loading more spas...</h3>
              )}

              {!hasMore && (
                <h3>🎉 You've reached the end.</h3>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SpasPage;