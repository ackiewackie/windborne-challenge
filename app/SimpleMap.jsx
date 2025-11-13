"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for Leaflet markers in Next.js
let DefaultIcon, BalloonIcon;
if (typeof window !== "undefined") {
  delete L.Icon.Default.prototype._getIconUrl;
  
  // Try default Leaflet icon first
  DefaultIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  
  // Custom balloon emoji icon as fallback
  BalloonIcon = L.divIcon({
    html: '<div style="background: #ff6b6b; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🎈</div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
    className: 'balloon-marker'
  });
  
  L.Marker.prototype.options.icon = BalloonIcon;
}

export default function SimpleMap({ balloons = [] }) {
  if (typeof window === "undefined") return <div>Loading map...</div>;
  
  console.log("🗺️ SimpleMap received:", balloons?.length, "balloons");
  console.log("🔍 First few balloons:", balloons?.slice(0, 3));
  
  // Test with just a few balloons to avoid performance issues
  const validBalloons = balloons
    .filter(b => b && typeof b.lat === 'number' && typeof b.lon === 'number' && !isNaN(b.lat) && !isNaN(b.lon))
    .slice(0, 20);
    
  console.log("🎯 Rendering", validBalloons.length, "valid balloons on map");
  console.log("📊 Balloon positions:", validBalloons.map(b => `[${b.lat}, ${b.lon}]`));
  
  if (validBalloons.length === 0) {
    return (
      <div className="h-96 bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">No balloon data available yet...</p>
      </div>
    );
  }
  
  try {
    return (
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: "70vh", width: "100%", borderRadius: "12px" }}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        worldCopyJump={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {validBalloons.map((b, i) => {
          console.log(`📍 Rendering marker ${i + 1} at [${b.lat}, ${b.lon}]`);
          return (
            <Marker 
              key={`balloon-${i}`} 
              position={[b.lat, b.lon]}
              icon={BalloonIcon || DefaultIcon}
            >
              <Popup>
                <strong>🎈 Balloon {i + 1}</strong><br/>
                📍 Lat: {b.lat.toFixed(2)}, Lon: {b.lon.toFixed(2)}<br/>
                ⬆️ Alt: {(b.alt || 0).toFixed(2)} km
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    );
  } catch (error) {
    console.error("Map rendering error:", error);
    return (
      <div className="h-96 bg-red-900 rounded-lg flex items-center justify-center">
        <p className="text-red-300">Map failed to load: {error.message}</p>
      </div>
    );
  }
}