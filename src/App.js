import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./Home";
import DoctorList from "./DoctorList";
import DoctorProfile from "./DoctorProfile";
import AboutUs from "./pages/AboutUs";
import Register from "./register/Register";
import Loader from "./loader/Loader";
import { parseDoctorCSVFromURL } from "./utils/parseDoctorCSV";

function App() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    parseDoctorCSVFromURL("/practo with latest format.csv")
      .then((data) => {
        console.log("DOCTORS IN APP.JS:", data);
        setDoctors(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("CSV LOAD ERROR:", err);
        setError("Failed to load doctors");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="container">{error}</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* 🔹 LANDING PAGE */}
        <Route path="/" element={<Home />} />

        {/* 🔹 ABOUT US PAGE */}
        <Route path="/about" element={<AboutUs />} />

        {/* 🔹 REGISTER PAGE (🔥 REQUIRED) */}
        <Route path="/register" element={<Register />} />

        {/* 🔹 SEARCH RESULTS PAGE */}
        <Route
          path="/doctors"
          element={<DoctorList doctors={doctors} />}
        />

        {/* 🔹 DOCTOR PROFILE PAGE */}
        <Route
          path="/doctor/:id"
          element={<DoctorProfile doctors={doctors} />}
        />

        {/* 🔹 FALLBACK */}
        <Route
          path="*"
          element={<div className="container">Page not found</div>}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
