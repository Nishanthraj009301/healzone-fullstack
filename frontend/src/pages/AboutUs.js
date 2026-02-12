import { useNavigate } from "react-router-dom";
import "./AboutUs.css";

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      <div className="about-container">

        {/* LOGO */}
              <div className="about-logo">
                  <img
                      src="/healonelogo.png"
                      alt="Healzone Logo"
                      onClick={() => navigate("/")}
                  />
              </div>


        <h1>About Healzone</h1>

        <p>
          At <strong>Healzone</strong>, we believe managing your health should be
          simple, seamless, and empowering.
        </p>

        <p>
          Whether you’re booking your next doctor’s appointment, exploring
          wellness classes, or nurturing your mental health, Healzone is your
          dedicated partner in achieving a balanced, healthier life.
        </p>

        <p>
          Inspired by the need for comprehensive care within a single intuitive
          platform, Healzone effortlessly connects you with trusted healthcare
          providers, wellness experts, and holistic therapists—all carefully
          vetted to deliver exceptional care tailored to your individual needs.
        </p>

        <p>
          We understand that health is more than just a doctor’s visit. That’s
          why Healzone integrates physical, mental, and spiritual wellness
          services, giving you access to appointments, classes, and treatments
          with just a few clicks. We simplify the search so you can spend less
          time navigating and more time thriving.
        </p>

        <p>
          Driven by innovation, our user-friendly platform empowers you with
          choice, clarity, and control over your wellbeing. Healzone prioritizes
          convenience, transparency, and personalized experiences—so you always
          feel supported throughout your wellness journey.
        </p>

        <p className="about-highlight">
          Join us at Healzone and experience healthcare redefined—where care
          meets convenience, and wellness becomes a way of life.
        </p>

        <p className="about-tagline">Your health, simplified.</p>
      </div>
    </div>
  );
}
