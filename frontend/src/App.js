import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { LocationProvider } from "./context/LocationContext";
import { AuthProvider } from "./context/AuthContext";


// ================= PAGES =================
import Home from "./Home";
import DoctorList from "./DoctorList";
import DoctorProfile from "./DoctorProfile";
import AboutUs from "./pages/AboutUs";
import Register from "./register/Register";
import SpecialitySelect from "./specialities/SpecialitySelect";
import VendorDashboard from "./pages/VendorDashboard/VendorDashboard";
import VendorProfile from "./pages/vendor/VendorProfile";
import VendorServices from "./pages/vendor/vendorServices/VendorServices";
import VendorAvailability from "./pages/vendor/vendorAvailability/VendorAvailability";
import VendorAppointments from "./pages/vendor/vendorappointments/VendorAppointments";

// ================= ADMIN =================
import AdminLogin from "./admin/AdminLogin";
import AdminVendors from "./admin/AdminVendors";

// ================= GLOBAL =================
import Loader from "./loader/Loader";
import Footer from "./components/Footer";

// ================= Password Reset =================
import ResetPassword from "./ResetPassword";

// ================= User Dashboard =================
import UserDashboard from "./pages/UserDashboard";

// ================= Edit Profile =================
import EditProfile from "./pages/EditProfile/EditProfile";

// ================= Maps for Vendor SignIN =================
import "leaflet/dist/leaflet.css";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loader />;
  }

  // console.log("Google Client ID:", process.env.REACT_APP_GOOGLE_CLIENT_ID);

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
          <LocationProvider>
            <div
              style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/specialities" element={<SpecialitySelect />} />
                  <Route path="/doctors" element={<DoctorList />} />
                  <Route path="/doctor/:id" element={<DoctorProfile />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/vendors" element={<AdminVendors />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/profile/edit" element={<EditProfile />} />
                  <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                  <Route path="/vendor/profile" element={<VendorProfile />} />
                  <Route path="/vendor/services" element={<VendorServices />} />
                  <Route path="/vendor/availability" element={<VendorAvailability />} />
                  <Route path="/vendor/appointments" element={<VendorAppointments />} />
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

              <Footer />
            </div>
          </LocationProvider>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;