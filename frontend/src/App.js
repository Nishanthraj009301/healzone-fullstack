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

// ================= GLOBAL =================
import Loader from "./loader/Loader";
import Footer from "./components/Footer";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // 🔐 GLOBAL LOADER
  if (loading) {
    return <Loader />;
  }

  return (
    <BrowserRouter>
      {/* Main layout wrapper */}
      <div style={{ 
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column"
      }}>
        
        {/* Page Content */}
        <div style={{ flex: 1 }}>
          <Routes>

            {/* ================= LANDING ================= */}
            <Route path="/" element={<Home />} />

            {/* ================= INFO ================= */}
            <Route path="/about" element={<AboutUs />} />

            {/* ================= VENDOR REGISTER ================= */}
            <Route path="/register" element={<Register />} />

            {/* ================= FIND A DOCTOR FLOW ================= */}
            <Route path="/specialities" element={<SpecialitySelect />} />
            <Route path="/doctors" element={<DoctorList />} />
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
        </div>

        {/* 🔥 Global Footer (Appears Everywhere) */}
        <Footer />

      </div>
    </BrowserRouter>
  );
}

export default App;