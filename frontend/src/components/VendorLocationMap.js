    import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/* FIX LEAFLET MARKER */
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

/* ===============================
   MAP CLICK HANDLER
=============================== */

function MapClickHandler({ setPosition, updateAddress }) {
  useMapEvents({
    click(e) {
      const coords = [e.latlng.lat, e.latlng.lng];
      setPosition(coords);
      updateAddress(coords);
    }
  });

  return null;
}

export default function VendorLocationMap({ setCoordinates, setAddress }) {

  const [position, setPosition] = useState([12.9716, 77.5946]);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  /* ===============================
     SEARCH ADDRESS
  =============================== */

  const searchLocation = async (query) => {

    if (!query) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
    );

    const data = await res.json();
    setSuggestions(data);
  };

  /* ===============================
     SELECT SUGGESTION
  =============================== */

  const selectLocation = (item) => {

    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);

    setPosition([lat, lon]);
    setCoordinates([lat, lon]);

    if (setAddress) {
      setAddress(item.display_name);
    }

    setSearch(item.display_name);
    setSuggestions([]);
  };

  /* ===============================
     REVERSE GEOCODING
  =============================== */

  const updateAddress = async (coords) => {

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}`
    );

    const data = await res.json();

    if (data.display_name && setAddress) {
      setAddress(data.display_name);
      setSearch(data.display_name);
    }

    setCoordinates(coords);
  };

  /* ===============================
     CURRENT LOCATION
  =============================== */

  const detectLocation = () => {

    navigator.geolocation.getCurrentPosition(
      (pos) => {

        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        const coords = [lat, lon];

        setPosition(coords);
        setCoordinates(coords);
        updateAddress(coords);
      },
      () => alert("Unable to detect location")
    );
  };

  return (
    <div className="map-wrapper">

      {/* ADDRESS SEARCH */}

      <div className="map-search-box">

        <input
          type="text"
          placeholder="Search clinic address"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            searchLocation(e.target.value);
          }}
        />

        <button type="button" onClick={detectLocation}>
          Use My Location
        </button>

      </div>

      {/* SUGGESTIONS */}

      {suggestions.length > 0 && (
        <div className="map-suggestions">

          {suggestions.map((item, i) => (
            <div
              key={i}
              className="map-suggestion-item"
              onClick={() => selectLocation(item)}
            >
              {item.display_name}
            </div>
          ))}

        </div>
      )}

      {/* MAP */}

      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "350px", width: "100%", marginTop: "10px" }}
      >

        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker
          position={position}
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target;
              const latlng = marker.getLatLng();
              const coords = [latlng.lat, latlng.lng];

              setPosition(coords);
              setCoordinates(coords);
              updateAddress(coords);
            }
          }}
        />

        <MapClickHandler
          setPosition={setPosition}
          updateAddress={updateAddress}
        />

      </MapContainer>

    </div>
  );
}