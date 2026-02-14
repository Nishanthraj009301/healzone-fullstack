import { useNavigate } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);

    // Scroll to top after navigation
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 50);
  };

  return (
    <footer className="hz-footer">
      <div className="hz-footer-inner">

        {/* ================= BRAND ================= */}
        <div className="hz-footer-brand">
          <img
            src="/healonelogo.png"
            alt="Healzone"
            className="footer-logo"
            onClick={() => handleNavigate("/")}
            style={{ cursor: "pointer" }}
          />
          <p>
            One platform for health, wellness, and personal care.
          </p>
        </div>

        {/* ================= COMPANY ================= */}
        <div className="hz-footer-col">
          <h4>Company</h4>
          <button onClick={() => handleNavigate("/about")}>About</button>
          <button onClick={() => handleNavigate("/specialities")}>
            Find Doctors
          </button>
          <button onClick={() => handleNavigate("/register")}>
            Vendor Signup
          </button>
        </div>

        {/* ================= EXPLORE ================= */}
        <div className="hz-footer-col">
          <h4>Explore</h4>
          <button onClick={() => handleNavigate("/doctors")}>
            Doctors
          </button>
          <button onClick={() => handleNavigate("/")}>
            Mental Health
          </button>
          <button>Spas</button>
          <button>Fitness</button>
          <button>Beauty</button>
        </div>

        {/* ================= SUPPORT ================= */}
        <div className="hz-footer-col">
          <h4>Support</h4>
          <button>Help</button>
          <button>Contact</button>
          <button>Privacy</button>
        </div>

      </div>

      {/* ================= LEGAL STRIP ================= */}
      <div className="hz-footer-bottom">

        <div className="hz-legal-links">
          <button>Legal</button>
          <span>|</span>
          <button>Privacy Policy & Your Privacy Rights</button>
          <span>|</span>
          <button>Terms of Service</button>
          <span>|</span>
          <button>Copyright Policy & Claims</button>
          {/* <span>|</span>
          <span>Copyright ©2001-2025</span> */}
        </div>

        <div className="hz-copyright">
          © {new Date().getFullYear()} Healzone. All rights reserved.
        </div>

      </div>
    </footer>
  );
}