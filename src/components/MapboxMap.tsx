import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useQuery } from "@tanstack/react-query";
import { getTowers } from "@/lib/supabaseService";
import { Tower } from "@/lib/supabase";
import { getMapboxToken, hasCustomMapboxToken } from "@/lib/mapbox";

const MAPBOX_TOKEN = getMapboxToken();
const USING_CUSTOM_TOKEN = hasCustomMapboxToken();

interface MapboxMapProps {
  className?: string;
  onTowerClick?: (tower: Tower) => void;
}

export const MapboxMap = ({ className, onTowerClick }: MapboxMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  // Use Map to track markers by tower ID to prevent duplicates
  const markersMapRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const towersProcessedRef = useRef<Set<string>>(new Set());
  const mapInitializedRef = useRef(false);

  // Fetch towers from database
  const { data: towers = [] } = useQuery<Tower[]>({
    queryKey: ['towers'],
    queryFn: getTowers,
  });

  // Function to add towers to map (only add new ones, don't recreate existing)
  // This function is stable and won't cause re-renders
  const addTowersToMapRef = useRef<(towersToAdd: Tower[]) => void>();
  
  addTowersToMapRef.current = (towersToAdd: Tower[]) => {
    if (!map.current || !mapInitializedRef.current) return;

    const currentTowerIds = new Set(towersToAdd.map(t => t.id));
    
    // Remove markers for towers that no longer exist
    markersMapRef.current.forEach((marker, towerId) => {
      if (!currentTowerIds.has(towerId)) {
        marker.remove();
        markersMapRef.current.delete(towerId);
        towersProcessedRef.current.delete(towerId);
      }
    });

    // Add new towers (only if they haven't been added yet)
    towersToAdd.forEach((tower) => {
      // Only add if this tower hasn't been processed yet
      if (!towersProcessedRef.current.has(tower.id)) {
        try {
          const marker = addTowerMarker(tower, map.current!, onTowerClick);
          markersMapRef.current.set(tower.id, marker);
          towersProcessedRef.current.add(tower.id);
        } catch (error) {
          console.error(`Failed to add marker for tower ${tower.id}:`, error);
        }
      }
    });

    console.log(`✅ Map has ${markersMapRef.current.size} tower markers (fixed to coordinates)`);
  };

  // Initialize map (only once)
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

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

      // Wait for map to load, then mark as initialized
      map.current.once("load", () => {
        mapInitializedRef.current = true;
        // Markers will be added by the towers effect
        if (towers.length > 0 && addTowersToMapRef.current) {
          addTowersToMapRef.current(towers);
        }
      });

      // Log any errors
      map.current.on("error", (e) => {
        console.error("Mapbox error", e);
      });
    } catch (error) {
      console.error("Failed to initialize Mapbox", error);
    }

    return () => {
      // Clean up all markers
      markersMapRef.current.forEach(marker => marker.remove());
      markersMapRef.current.clear();
      towersProcessedRef.current.clear();
      if (map.current) {
        map.current.remove();
        map.current = null;
        mapInitializedRef.current = false;
      }
    };
  }, []);

  // Update markers when towers change (but only if map is initialized)
  useEffect(() => {
    if (!map.current || !mapInitializedRef.current || !addTowersToMapRef.current) {
      return;
    }

    if (towers.length === 0) {
      return;
    }

    // Only update if we have new towers or towers have changed
    const currentTowerIds = new Set(towers.map(t => t.id));
    const processedTowerIds = towersProcessedRef.current;
    
    // Check if we need to update (new towers or removed towers)
    const hasNewTowers = towers.some(t => !processedTowerIds.has(t.id));
    const hasRemovedTowers = Array.from(processedTowerIds).some(id => !currentTowerIds.has(id));
    const countMismatch = markersMapRef.current.size !== towers.length;

    if (hasNewTowers || hasRemovedTowers || countMismatch) {
      addTowersToMapRef.current(towers);
    }
  }, [towers, onTowerClick]);

  return <div ref={mapContainer} className={className} />;
};

// Helper function to add tower markers
const addTowerMarker = (
  tower: Tower, 
  mapInstance: mapboxgl.Map,
  onTowerClick?: (tower: Tower) => void
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
  el.style.transition = "transform 0.2s ease, box-shadow 0.2s ease"; // Only animate transform and shadow
  el.style.pointerEvents = "auto"; // Ensure marker is clickable
  // Note: Mapbox handles positioning, don't set position style

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

  // Create marker with fixed coordinates
  // Mapbox markers automatically stay fixed to their lat/lng coordinates
  // They update their screen position automatically during zoom/pan
  const marker = new mapboxgl.Marker({
    element: el,
    anchor: 'center', // Center the marker on the coordinates
  })
    .setLngLat([tower.lng, tower.lat]) // Set fixed geographic coordinates
    .setPopup(popup)
    .addTo(mapInstance);

  // Markers are now fixed to their coordinates and will stay there
  // Mapbox handles updating screen position during zoom/pan automatically
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
