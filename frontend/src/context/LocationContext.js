import { createContext, useState, useEffect } from "react";

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  // Default values
  const [selectedCountry, setSelectedCountry] = useState("United States");
  const [selectedCity, setSelectedCity] = useState("");

  /* =====================================================
     LOAD SAVED LOCATION ON FIRST RENDER
  ===================================================== */
  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation");

    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);

        if (parsed.country) {
          setSelectedCountry(parsed.country);
        }

        if (parsed.city) {
          setSelectedCity(parsed.city);
        }
      } catch (error) {
        console.error("Failed to parse saved location:", error);
      }
    }
  }, []);

  /* =====================================================
     SAVE LOCATION WHENEVER IT CHANGES
  ===================================================== */
  useEffect(() => {
    localStorage.setItem(
      "userLocation",
      JSON.stringify({
        country: selectedCountry,
        city: selectedCity,
      })
    );
  }, [selectedCountry, selectedCity]);

  /* =====================================================
     PROVIDER
  ===================================================== */
  return (
    <LocationContext.Provider
      value={{
        selectedCountry,
        setSelectedCountry,
        selectedCity,
        setSelectedCity,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};