import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { towers } from "@/lib/mockData";
import { getMapboxToken, hasCustomMapboxToken } from "@/lib/mapbox";

// Get Mapbox token from environment variable(s)
const MAPBOX_TOKEN = getMapboxToken();
const USING_CUSTOM_TOKEN = hasCustomMapboxToken();

// Debug: Log all environment variables
console.log("🔍 DEBUG: Environment Variables");
console.log("- import.meta.env:", import.meta.env);
console.log("- VITE_MAPBOX_ACCESS_TOKEN:", import.meta.env.VITE_MAPBOX_ACCESS_TOKEN);
console.log("- MAPBOX_ACCESS_TOKEN:", import.meta.env.MAPBOX_ACCESS_TOKEN);
console.log("- Token being used:", MAPBOX_TOKEN);
console.log("- Token starts with 'pk.':", MAPBOX_TOKEN.startsWith('pk.'));
console.log("- Token length:", MAPBOX_TOKEN.length);
console.log("- Using custom token:", USING_CUSTOM_TOKEN ? "✓ Yes" : "✗ No");

interface MapboxMapProps {
  className?: string;
  onTowerClick?: (tower: typeof towers[0]) => void;
}

export const MapboxMap = ({ className, onTowerClick }: MapboxMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Debug: Check if token is loaded
    console.log("🗺️ Initializing Mapbox Map...");
    console.log("- Token exists:", MAPBOX_TOKEN ? "✓ Yes" : "✗ No");
    console.log("- Token value:", MAPBOX_TOKEN);
    console.log("- Token valid format:", MAPBOX_TOKEN.startsWith('pk.') ? "✓ Yes" : "✗ No");
    console.log("- Using fallback token:", USING_CUSTOM_TOKEN ? "✗ No" : "✓ Yes");
    
    mapboxgl.accessToken = MAPBOX_TOKEN;
    console.log("- mapboxgl.accessToken set to:", mapboxgl.accessToken);

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [-99.9018, 31.9686], // Center of Texas
        zoom: 6, // Zoomed to show Texas state
      });

      // Add navigation controls with custom styling
      const nav = new mapboxgl.NavigationControl();
      map.current.addControl(nav, "top-right");

      // Add tower markers after map loads
      map.current.on("load", () => {
        console.log("✅ SUCCESS: Mapbox map loaded successfully!");
        console.log("- Adding", towers.length, "tower markers...");
        
        // Add tower markers
        towers.forEach((tower) => {
          const marker = addTowerMarker(tower, map.current!, onTowerClick);
          markersRef.current.push(marker);
        });
        console.log("✅ All tower markers added!");
      });

      // Log any errors
      map.current.on("error", (e) => {
        console.error("❌ MAPBOX ERROR:", e);
        console.error("- Error type:", e.error?.message || 'Unknown');
        console.error("- This usually means:");
        console.error("  1. Invalid or expired access token");
        console.error("  2. Network connectivity issue");
        console.error("  3. Token doesn't have proper permissions");
      });
    } catch (error) {
      console.error("❌ CRITICAL: Failed to initialize Mapbox:", error);
      console.error("- Make sure you have a valid Mapbox token in .env file");
      console.error("- Token should be: VITE_MAPBOX_ACCESS_TOKEN=pk.your_token_here");
    }

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, [onTowerClick]);

  return <div ref={mapContainer} className={className} />;
};

// Helper function to add tower markers
const addTowerMarker = (
  tower: typeof towers[0], 
  mapInstance: mapboxgl.Map,
  onTowerClick?: (tower: typeof towers[0]) => void
) => {
  // Create custom marker element with glassmorphic design
  const el = document.createElement("div");
  el.className = "tower-marker";
  el.style.width = "50px";
  el.style.height = "50px";
  el.style.cursor = "pointer";
  el.style.display = "flex";
  el.style.alignItems = "center";
  el.style.justifyContent = "center";
  el.style.transition = "all 0.3s ease";
  el.style.position = "relative";

  // Create the inner circle (glassmorphic)
  const inner = document.createElement("div");
  inner.style.width = "40px";
  inner.style.height = "40px";
  inner.style.borderRadius = "50%";
  inner.style.backdropFilter = "blur(10px)";
  inner.style.border = tower.health === "ok" 
    ? "3px solid rgba(34, 197, 94, 0.8)" 
    : "3px solid rgba(234, 179, 8, 0.8)";
  inner.style.backgroundColor = tower.health === "ok" 
    ? "rgba(34, 197, 94, 0.2)" 
    : "rgba(234, 179, 8, 0.2)";
  inner.style.boxShadow = tower.health === "ok"
    ? "0 0 20px rgba(34, 197, 94, 0.5), inset 0 0 10px rgba(34, 197, 94, 0.2)"
    : "0 0 20px rgba(234, 179, 8, 0.5), inset 0 0 10px rgba(234, 179, 8, 0.2)";
  inner.style.display = "flex";
  inner.style.alignItems = "center";
  inner.style.justifyContent = "center";
  inner.style.transition = "all 0.3s ease";

  // Create pulsing animation
  const pulse = document.createElement("div");
  pulse.style.position = "absolute";
  pulse.style.width = "40px";
  pulse.style.height = "40px";
  pulse.style.borderRadius = "50%";
  pulse.style.border = tower.health === "ok" 
    ? "2px solid rgba(34, 197, 94, 0.6)" 
    : "2px solid rgba(234, 179, 8, 0.6)";
  pulse.style.animation = "pulse 2s ease-out infinite";

  // Add icon (radio tower)
  const icon = document.createElement("div");
  icon.style.fontSize = "18px";
  icon.innerHTML = "📡";
  icon.style.filter = "grayscale(0.3)";

  inner.appendChild(icon);
  el.appendChild(pulse);
  el.appendChild(inner);

  // Add hover effects
  el.addEventListener("mouseenter", () => {
    inner.style.transform = "scale(1.2)";
    inner.style.boxShadow = tower.health === "ok"
      ? "0 0 30px rgba(34, 197, 94, 0.8), inset 0 0 15px rgba(34, 197, 94, 0.3)"
      : "0 0 30px rgba(234, 179, 8, 0.8), inset 0 0 15px rgba(234, 179, 8, 0.3)";
  });

  el.addEventListener("mouseleave", () => {
    inner.style.transform = "scale(1)";
    inner.style.boxShadow = tower.health === "ok"
      ? "0 0 20px rgba(34, 197, 94, 0.5), inset 0 0 10px rgba(34, 197, 94, 0.2)"
      : "0 0 20px rgba(234, 179, 8, 0.5), inset 0 0 10px rgba(234, 179, 8, 0.2)";
  });

  // Add click handler
  el.addEventListener("click", () => {
    if (onTowerClick) {
      onTowerClick(tower);
    }
  });

  // Create tooltip popup
  const popup = new mapboxgl.Popup({ 
    offset: 25,
    closeButton: false,
    className: "tower-popup"
  }).setHTML(`
    <div style="
      padding: 12px; 
      font-family: system-ui;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(20px);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    ">
      <h3 style="margin: 0 0 8px 0; font-weight: 700; color: white; font-size: 16px;">${tower.id}</h3>
      <p style="margin: 0 0 6px 0; font-size: 13px; color: rgba(255, 255, 255, 0.7);">${tower.region} Region</p>
      <div style="
        display: inline-flex; 
        align-items: center; 
        gap: 6px;
        padding: 4px 10px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        background: ${tower.health === "ok" ? "rgba(34, 197, 94, 0.2)" : "rgba(234, 179, 8, 0.2)"};
        border: 1px solid ${tower.health === "ok" ? "rgba(34, 197, 94, 0.4)" : "rgba(234, 179, 8, 0.4)"};
        color: ${tower.health === "ok" ? "rgb(34, 197, 94)" : "rgb(234, 179, 8)"};
      ">
        <span style="font-size: 8px;">●</span>
        ${tower.health === "ok" ? "Operational" : "Degraded"}
      </div>
      <p style="margin: 8px 0 0 0; font-size: 11px; color: rgba(255, 255, 255, 0.5); font-style: italic;">
        Click for details
      </p>
    </div>
  `);

  // Add marker to map
  const marker = new mapboxgl.Marker(el)
    .setLngLat([tower.lng, tower.lat])
    .setPopup(popup)
    .addTo(mapInstance);

  return marker;
};

// Add CSS animation for pulse effect
const style = document.createElement("style");
style.textContent = `
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }
  
  .tower-popup .mapboxgl-popup-content {
    padding: 0 !important;
    background: transparent !important;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5) !important;
  }
  
  .tower-popup .mapboxgl-popup-tip {
    border-top-color: rgba(0, 0, 0, 0.8) !important;
  }
`;
document.head.appendChild(style);
