import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

// ================= PAGES =================
import Home from "./Home";
import DoctorList from "./DoctorList";
import DoctorProfile from "./DoctorProfile";
import AboutUs from "./pages/AboutUs";
import Register from "./register/Register";
import SpecialitySelect from "./specialities/SpecialitySelect";

// ================= ADMIN =================
import AdminLogin from "./admin/AdminLogin";
import AdminVendors from "./admin/AdminVendors";

// ================= LOADER =================
import Loader from "./loader/Loader";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔥 Global app loader (branding + smooth entry)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200); // 1.2s feels premium

    return () => clearTimeout(timer);
  }, []);

  // 🔐 GLOBAL LOADER
  if (loading) {
    return <Loader />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* ================= LANDING ================= */}
        <Route path="/" element={<Home />} />

        {/* ================= INFO ================= */}
        <Route path="/about" element={<AboutUs />} />

        {/* ================= VENDOR REGISTER ================= */}
        <Route path="/register" element={<Register />} />

        {/* ================= FIND A DOCTOR FLOW ================= */}
        {/* Step 1: Choose Speciality */}
        <Route path="/specialities" element={<SpecialitySelect />} />

        {/* Step 2: Doctor List (filtered by speciality via query param) */}
        <Route path="/doctors" element={<DoctorList />} />

        {/* Step 3: Doctor Profile */}
        <Route path="/doctor/:id" element={<DoctorProfile />} />

        {/* ================= ADMIN ================= */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/vendors" element={<AdminVendors />} />

        {/* ================= FALLBACK ================= */}
        <Route
          path="*"
          element={
            <div
              style={{
                minHeight: "100vh",
                display: "grid",
                placeItems: "center",
                background: "#020617",
                color: "#94a3b8",
                fontSize: "14px",
              }}
            >
              Page not found
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
