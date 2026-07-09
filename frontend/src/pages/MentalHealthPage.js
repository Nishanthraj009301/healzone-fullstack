import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
    useCallback,
} from "react";

import { useNavigate } from "react-router-dom";

import "./SalonsPage.css"; // Reuse same CSS

const LIMIT = 20;

const MentalHealthPage = () => {
    const navigate = useNavigate();

    const [mentalHealth, setMentalHealth] = useState([]);
    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const [hasMore, setHasMore] = useState(true);

    const [search, setSearch] = useState("");

    const observer = useRef();
    const loader = useRef();
    const fetchedPages = useRef(new Set());

    const fetchMentalHealth = useCallback(async (pageNo) => {
        if (fetchedPages.current.has(pageNo)) return;

        fetchedPages.current.add(pageNo);

        try {
            if (pageNo === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const res = await fetch(
                `https://www.heal-zone.com/api/mental-health?page=${pageNo}&limit=${LIMIT}`,
                {
                    credentials: "include",
                }
            );

            if (!res.ok) {
                throw new Error("Failed to fetch mental health centers");
            }

            const data = await res.json();

            if (pageNo === 1) {
                setMentalHealth(data.mentalHealth);
            } else {
                setMentalHealth((prev) => [...prev, ...data.mentalHealth]);
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
        fetchMentalHealth(page);
    }, [page, fetchMentalHealth]);

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

    const filteredMentalHealth = useMemo(() => {
        const q = search.toLowerCase();

        return mentalHealth.filter((center) => {
            return (
                center.SalonName?.toLowerCase().includes(q) ||
                center.AddressJson?.simpleFormatted
                    ?.toLowerCase()
                    .includes(q) ||
                center.ServicesJson?.[0]?.name
                    ?.toLowerCase()
                    .includes(q)
            );
        });
    }, [mentalHealth, search]);

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
                            placeholder="Search therapist, counselling service..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="salon-title">
                <h1>Discover Mental Health Services</h1>
                <p>Find trusted therapists and counselling services near you</p>
            </div>

            <div className="salon-shell">
                {loading ? (
                    <div className="empty-state">
                        Loading mental health services...
                    </div>
                ) : filteredMentalHealth.length === 0 ? (
                    <div className="empty-state">
                        No mental health services found.
                    </div>
                ) : (
                    <>
                        <div className="salon-card-grid">
                            {filteredMentalHealth.map((center) => {
                                const service = center.ServicesJson?.[0];

                                return (
                                    <div
                                        key={center._id}
                                        className="salon-card"
                                        onClick={() => navigate(`/mental-health/${center._id}`)}
                                    >
                                        <img
                                            className="salon-image"
                                            src={
                                                center.ImagesJson?.[0]?.url ||
                                                "https://via.placeholder.com/400x250"
                                            }
                                            alt={center.SalonName}
                                        />

                                        <div className="rating-row">
                                            <span className="rating">
                                                ⭐ {center.Rating}
                                            </span>

                                            <span className="reviews">
                                                {center.ReviewsCount} Reviews
                                            </span>
                                        </div>

                                        <h3>{center.SalonName}</h3>

                                        <p className="address">
                                            📍 {center.AddressJson?.simpleFormatted}
                                        </p>

                                        {service && (
                                            <>
                                                <p className="service">
                                                    🧠 {service.name}
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
                                <h3>Loading more mental health services...</h3>
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

export default MentalHealthPage;