"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Fix invisible markers in Next.js
const DefaultIcon = L.icon({
  iconUrl: icon.src || icon,
  shadowUrl: iconShadow.src || iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Prevent SSR/Hot-reload errors
delete L.Icon.Default.prototype._getIconUrl;

// small inner component to fetch weather for each balloon
function Weather({ lat, lon }) {
  const [temp, setTemp] = useState(null);
  const [wind, setWind] = useState(null);

  useEffect(() => {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    )
      .then((res) => res.json())
      .then((data) => {
        const weather = data.current_weather;
        if (weather) {
          setTemp(weather.temperature);
          setWind(weather.windspeed);
        }
      })
      .catch(() => {
        setTemp("N/A");
        setWind("N/A");
      });
  }, [lat, lon]);

  if (temp === null) return <p>Loading weather...</p>;
  return (
    <p>
      🌡 {temp}°C &nbsp; 💨 {wind} m/s
    </p>
  );
}

export default function Map({ balloons }) {
  // Ensure this only renders in the browser
  if (typeof window === "undefined") return null;
  
  console.log("Map component received balloons:", balloons?.length, balloons?.slice(0, 3));

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{
        height: "70vh",
        width: "100%",
        borderRadius: "12px",
      }}
      className="shadow-lg"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {balloons
        .filter(b => b.lat && b.lon && !isNaN(b.lat) && !isNaN(b.lon))
        .map((b, i) => (
          <Marker key={`balloon-${i}`} position={[b.lat, b.lon]}>
            <Popup>
              <strong>ID:</strong> Balloon #{i + 1}
              <br />
              Lat: {b.lat?.toFixed(2)} Lon: {b.lon?.toFixed(2)}
              <br />
              Alt: {(b.alt ?? 0).toFixed(2)} km
              <br />
              <Weather lat={b.lat} lon={b.lon} />
            </Popup>
          </Marker>
        ))
    </MapContainer>
  );
}
    