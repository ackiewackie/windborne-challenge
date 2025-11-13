"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("./SimpleMap"), { ssr: false });

// Mock balloon data as fallback
const mockBalloons = [
  [37.7749, -122.4194, 12.5], // San Francisco
  [40.7128, -74.0060, 8.2],   // New York
  [51.5074, -0.1278, 15.1],   // London
  [35.6762, 139.6503, 9.8],   // Tokyo
  [-33.8688, 151.2093, 11.3], // Sydney
  [48.8566, 2.3522, 7.9],     // Paris
  [52.5200, 13.4050, 13.7],   // Berlin
  [55.7558, 37.6176, 6.4],    // Moscow
  [39.9042, 116.4074, 14.2],  // Beijing
  [-23.5505, -46.6333, 10.1], // São Paulo
  [19.4326, -99.1332, 16.8],  // Mexico City
  [28.6139, 77.2090, 5.5],    // Delhi
  [1.3521, 103.8198, 12.9],   // Singapore
  [25.2048, 55.2708, 8.7],    // Dubai
  [-26.2041, 28.0473, 11.6],  // Johannesburg
].map(([lat, lon, alt]) => ({ lat, lon, alt }));

export default function Home() {
  const [balloons, setBalloons] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const urls = Array.from({ length: 24 }, (_, i) =>
          `https://a.windbornesystems.com/treasure/${i.toString().padStart(2, "0")}.json`
        );

        const responses = await Promise.allSettled(
          urls.map(async url => {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
          })
        );

        const clean = responses
          .filter(r => r.status === "fulfilled" && Array.isArray(r.value))
          .flatMap(r => r.value)
          .filter(arr => Array.isArray(arr) && arr.length >= 2)
          .map(([lat, lon, alt]) => ({
            lat: parseFloat(lat),
            lon: parseFloat(lon),
            alt: parseFloat(alt) || 0,
          }))
          .filter(b => !isNaN(b.lat) && !isNaN(b.lon));

        setBalloons(clean.length > 0 ? clean : mockBalloons);
      } catch (err) {
        setBalloons(mockBalloons);
      }
    }

    fetchData();
  }, []);


  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-slate-900 text-white">
      <h1 className="text-4xl font-extrabold text-cyan-300 mb-3">
        WindBorne Constellation Dashboard
      </h1>
      <p className="text-gray-400 mb-6 text-center max-w-2xl">
        Live positions of WindBorne weather balloons combined with Open-Meteo data.
        Hover over any marker to see temperature readings for that location.
      </p>
      <div className="w-full max-w-5xl">
        <div className="mb-4 text-center">
          <span className="bg-cyan-800 px-3 py-1 rounded-full text-sm">
            🎈 {balloons.length} balloons tracked
          </span>

        </div>
        <Map balloons={balloons} />
      </div>
      <footer className="mt-8 text-sm text-gray-500">
        Built by Anjali Kok • Powered by WindBorne + Open-Meteo
      </footer>
    </main>
  );
}
