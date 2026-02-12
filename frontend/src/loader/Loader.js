import "./Loader.css";

export default function Loader() {
  return (
    <div className="loader-page">
      <div className="loader-content">
        <img
          src="/healonelogo.png"
          alt="Healzone"
          className="loader-logo"
        />
        <div className="loader-spinner"></div>
        <p>Your health, simplified…</p>
      </div>
    </div>
  );
}
