import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useQuery } from "@tanstack/react-query";
import { getMapboxToken, hasCustomMapboxToken } from "@/lib/mapbox";
import { getTowers } from "@/lib/supabaseService";
import { Tower } from "@/lib/supabase";

const MAPBOX_TOKEN = getMapboxToken();
const USING_CUSTOM_TOKEN = hasCustomMapboxToken();

interface MapboxMapProps {
  className?: string;
  onTowerClick?: (tower: Tower) => void;
  userLocation?: {
    latitude: number;
    longitude: number;
  } | null;
  towers?: Tower[]; // Optional: allows parent to override towers (for demo purposes)
}

export const MapboxMap = ({ className, onTowerClick, userLocation, towers: towersProp }: MapboxMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersMapRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const userLocationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const mapLoadedRef = useRef(false);

  // Fetch towers from database (unless overridden by prop)
  const { data: towersFromDb = [] } = useQuery<Tower[]>({
    queryKey: ['towers'],
    queryFn: getTowers,
    enabled: !towersProp, // Only fetch if not provided via prop
  });

  // Use prop towers if provided, otherwise use database towers
  const towers = towersProp || towersFromDb;

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

      // Mark map as loaded when ready
      map.current.once("load", () => {
        mapLoadedRef.current = true;
        console.log('🗺️ Map loaded');
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
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.remove();
        userLocationMarkerRef.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
        mapLoadedRef.current = false;
      }
    };
  }, []);

  // Update towers when they change or when map loads
  useEffect(() => {
    if (!map.current) {
      console.log('⏳ Map not initialized yet, waiting...');
      return;
    }

    const updateTowersOnMap = () => {
      if (!map.current) return;

      // Create a Set of current tower IDs
      const currentTowerIds = new Set(towers.map(t => t.id));
      
      // Remove markers for towers that no longer exist
      markersMapRef.current.forEach((marker, towerId) => {
        if (!currentTowerIds.has(towerId)) {
          console.log(`🗑️ Removing marker for tower ${towerId}`);
          marker.remove();
          markersMapRef.current.delete(towerId);
        }
      });

      // Add or update markers for current towers
      towers.forEach((tower) => {
        // Validate coordinates
        if (!tower.lat || !tower.lng || isNaN(tower.lat) || isNaN(tower.lng)) {
          console.error(`❌ Invalid coordinates for tower ${tower.id}:`, { lat: tower.lat, lng: tower.lng });
          return;
        }

        // Check if marker already exists
        const existingMarker = markersMapRef.current.get(tower.id);
        
        if (existingMarker) {
          // Update existing marker position if coordinates changed
          const currentLngLat = existingMarker.getLngLat();
          if (Math.abs(currentLngLat.lat - tower.lat) > 0.0001 || Math.abs(currentLngLat.lng - tower.lng) > 0.0001) {
            console.log(`📍 Updating position for tower ${tower.id}`);
            existingMarker.setLngLat([tower.lng, tower.lat]);
          }
          
          // Update marker appearance and popup if health changed (always update to ensure popup shows correct status)
          updateTowerMarkerHealth(existingMarker, tower.health, tower);
        } else {
          // Create new marker
          try {
            console.log(`📍 Adding new marker for tower ${tower.id} at (${tower.lat}, ${tower.lng})`);
            const marker = addTowerMarker(tower, map.current!, onTowerClick);
            markersMapRef.current.set(tower.id, marker);
          } catch (error) {
            console.error(`❌ Error adding tower ${tower.id}:`, error);
          }
        }
      });

      console.log(`✅ Tower markers updated: ${markersMapRef.current.size} markers on map`);
    };

    // Check if map is loaded
    if (mapLoadedRef.current || map.current.loaded()) {
      updateTowersOnMap();
    } else {
      // Wait for map to load
      console.log('⏳ Waiting for map to load before adding towers...');
      const handleLoad = () => {
        mapLoadedRef.current = true;
        updateTowersOnMap();
      };
      map.current.once("load", handleLoad);
      
      // Also check if it's already loaded (race condition)
      if (map.current.isStyleLoaded()) {
        setTimeout(() => {
          if (map.current && map.current.loaded()) {
            mapLoadedRef.current = true;
            updateTowersOnMap();
          }
        }, 100);
      }
    }
  }, [towers, onTowerClick]);

  // Update user location marker
  useEffect(() => {
    if (!map.current) return;

    const updateUserLocation = () => {
      // Remove existing user location marker
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.remove();
        userLocationMarkerRef.current = null;
      }

      // Add new user location marker if location is provided
      if (userLocation && userLocation.latitude && userLocation.longitude) {
        console.log('📍 Adding user location marker at:', userLocation.latitude, userLocation.longitude);
        try {
          const userMarker = addUserLocationMarker(
            userLocation.latitude,
            userLocation.longitude,
            map.current!
          );
          userLocationMarkerRef.current = userMarker;
        } catch (error) {
          console.error('❌ Error adding user location marker:', error);
        }
      } else {
        console.log('📍 No user location to display');
      }
    };

    // Check if map is loaded
    if (mapLoadedRef.current || map.current.loaded()) {
      updateUserLocation();
    } else {
      // Wait for map to load
      const handleLoad = () => {
        mapLoadedRef.current = true;
        updateUserLocation();
      };
      map.current.once("load", handleLoad);
    }
  }, [userLocation]);

  return <div ref={mapContainer} className={className} />;
};

// Helper function to add user location marker (pink dot)
const addUserLocationMarker = (
  latitude: number,
  longitude: number,
  mapInstance: mapboxgl.Map
): mapboxgl.Marker => {
  // Create container element with larger clickable area
  const el = document.createElement("div");
  el.className = "user-location-marker";
  el.style.width = "44px"; // Larger clickable area (44px = 20px dot + 12px padding on each side)
  el.style.height = "44px";
  el.style.display = "flex";
  el.style.alignItems = "center";
  el.style.justifyContent = "center";
  el.style.cursor = "pointer";
  el.style.position = "relative";
  el.style.pointerEvents = "auto";
  // Transparent background - only the inner dot is visible
  el.style.backgroundColor = "transparent";

  // Create wrapper for the visual dot (centered in the larger clickable area)
  const dotWrapper = document.createElement("div");
  dotWrapper.style.position = "relative";
  dotWrapper.style.width = "20px";
  dotWrapper.style.height = "20px";
  dotWrapper.style.pointerEvents = "none"; // Don't block clicks on the parent

  // Create pulsing animation
  const pulse = document.createElement("div");
  pulse.style.position = "absolute";
  pulse.style.top = "50%";
  pulse.style.left = "50%";
  pulse.style.transform = "translate(-50%, -50%)";
  pulse.style.width = "20px";
  pulse.style.height = "20px";
  pulse.style.borderRadius = "50%";
  pulse.style.backgroundColor = "rgba(226, 0, 116, 0.4)";
  pulse.style.animation = "pulse-user-location 2s ease-out infinite";
  pulse.style.pointerEvents = "none"; // Don't block clicks
  dotWrapper.appendChild(pulse);

  // Create outer ring (visible part of the dot)
  const outerRing = document.createElement("div");
  outerRing.style.position = "absolute";
  outerRing.style.top = "50%";
  outerRing.style.left = "50%";
  outerRing.style.transform = "translate(-50%, -50%)";
  outerRing.style.width = "20px";
  outerRing.style.height = "20px";
  outerRing.style.borderRadius = "50%";
  outerRing.style.backgroundColor = "#E20074"; // Pink color
  outerRing.style.border = "4px solid rgba(226, 0, 116, 0.3)";
  outerRing.style.boxShadow = "0 0 20px rgba(226, 0, 116, 0.6), 0 0 40px rgba(226, 0, 116, 0.4)";
  outerRing.style.pointerEvents = "none"; // Don't block clicks
  dotWrapper.appendChild(outerRing);

  // Create inner dot
  const inner = document.createElement("div");
  inner.style.position = "absolute";
  inner.style.top = "50%";
  inner.style.left = "50%";
  inner.style.transform = "translate(-50%, -50%)";
  inner.style.width = "12px";
  inner.style.height = "12px";
  inner.style.borderRadius = "50%";
  inner.style.backgroundColor = "#E20074";
  inner.style.border = "2px solid white";
  inner.style.pointerEvents = "none"; // Don't block clicks
  dotWrapper.appendChild(inner);

  // Add wrapper to container
  el.appendChild(dotWrapper);

  // Create tooltip popup with coordinates
  const popup = new mapboxgl.Popup({
    offset: 25,
    closeButton: true,
    closeOnClick: false,
    className: "user-location-popup",
  }).setHTML(`
    <div style="
      padding: 16px; 
      font-family: system-ui;
      background: rgba(226, 0, 116, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      min-width: 200px;
    ">
      <h3 style="margin: 0 0 12px 0; font-weight: 700; color: white; font-size: 18px;">📍 Your Location</h3>
      <div style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.95); line-height: 1.6;">
        <div style="margin-bottom: 8px;">
          <strong style="color: rgba(255, 255, 255, 0.8);">Latitude:</strong><br>
          <span style="font-family: 'Monaco', 'Menlo', monospace; font-size: 13px;">${latitude.toFixed(6)}°N</span>
        </div>
        <div>
          <strong style="color: rgba(255, 255, 255, 0.8);">Longitude:</strong><br>
          <span style="font-family: 'Monaco', 'Menlo', monospace; font-size: 13px;">${longitude.toFixed(6)}°W</span>
        </div>
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.2); font-size: 12px; color: rgba(255, 255, 255, 0.7);">
          Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
        </div>
      </div>
    </div>
  `);

  // Create marker with popup
  const marker = new mapboxgl.Marker({
    element: el,
    anchor: 'center',
  })
    .setLngLat([longitude, latitude])
    .setPopup(popup)
    .addTo(mapInstance);

  // Ensure the marker element is clickable and opens popup on click
  el.style.pointerEvents = "auto";
  el.style.cursor = "pointer";
  
  // Explicitly open popup on click (Mapbox should handle this, but making it explicit)
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!marker.getPopup().isOpen()) {
      marker.togglePopup();
    }
  });

  return marker;
};

// Helper function to update tower marker health appearance
const updateTowerMarkerHealth = (marker: mapboxgl.Marker, health: 'ok' | 'degraded', tower?: Tower) => {
  const element = marker.getElement();
  if (!element) return;

  // The marker element structure: el > wrapper > [pulse, inner]
  const wrapper = element.firstChild as HTMLElement;
  if (!wrapper) return;

  // Find pulse (first child) and inner (second child) elements
  const pulse = wrapper.children[0] as HTMLElement;
  const inner = wrapper.children[1] as HTMLElement;

  // Update pulse border color
  if (pulse) {
    pulse.style.border = health === "ok" 
      ? "2px solid rgba(34, 197, 94, 0.6)" 
      : "2px solid rgba(239, 68, 68, 0.6)"; // Red for degraded
  }

  // Update inner circle appearance (this is what makes it green/red)
  if (inner) {
    inner.style.border = health === "ok" 
      ? "3px solid rgba(34, 197, 94, 0.8)" 
      : "3px solid rgba(239, 68, 68, 0.8)"; // Red for degraded
    inner.style.backgroundColor = health === "ok" 
      ? "rgba(34, 197, 94, 0.2)" 
      : "rgba(239, 68, 68, 0.2)"; // Red for degraded
    inner.style.boxShadow = health === "ok"
      ? "0 0 20px rgba(34, 197, 94, 0.5), inset 0 0 10px rgba(34, 197, 94, 0.2)"
      : "0 0 20px rgba(239, 68, 68, 0.5), inset 0 0 10px rgba(239, 68, 68, 0.2)"; // Red for degraded
  }

  // Update popup content - regenerate HTML to ensure it shows correct status
  const popup = marker.getPopup();
  if (popup && tower) {
    // Update popup HTML with current health status
    popup.setHTML(`
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
        <div class="tower-health-badge" data-health="${health}" style="
          display: inline-flex; 
          align-items: center; 
          gap: 6px;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          background: ${health === "ok" ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"};
          border: 1px solid ${health === "ok" ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)"};
          color: ${health === "ok" ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"};
        ">
          <span style="font-size: 8px;">●</span>
          <span class="tower-health-text">${health === "ok" ? "Operational" : "Degraded"}</span>
        </div>
        <p style="margin: 8px 0 0 0; font-size: 11px; color: rgba(255, 255, 255, 0.5); font-style: italic;">
          Click for details
        </p>
      </div>
    `);
  }
};

// Helper function to add tower markers
const addTowerMarker = (
  tower: Tower, 
  mapInstance: mapboxgl.Map,
  onTowerClick?: (tower: Tower) => void
) => {
  // Validate coordinates
  if (!tower.lat || !tower.lng || isNaN(tower.lat) || isNaN(tower.lng)) {
    throw new Error(`Invalid coordinates for tower ${tower.id}: lat=${tower.lat}, lng=${tower.lng}`);
  }

  // Create custom marker element with glassmorphic design
  // IMPORTANT: Do NOT set position on this element - Mapbox handles positioning via coordinates
  const el = document.createElement("div");
  el.className = "tower-marker";
  el.style.width = "40px"; // Reduced from 50px
  el.style.height = "40px"; // Reduced from 50px
  el.style.cursor = "pointer";
  el.style.display = "flex";
  el.style.alignItems = "center";
  el.style.justifyContent = "center";
  el.style.transition = "transform 0.3s ease"; // Only transition transform, not all properties

  // Create wrapper for absolute positioning context
  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  wrapper.style.width = "40px"; // Reduced from 50px
  wrapper.style.height = "40px"; // Reduced from 50px
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "center";
  wrapper.style.justifyContent = "center";

  // Create pulsing animation - positioned absolutely within wrapper
  const pulse = document.createElement("div");
  pulse.style.position = "absolute";
  pulse.style.top = "50%";
  pulse.style.left = "50%";
  pulse.style.transform = "translate(-50%, -50%)";
  pulse.style.width = "32px"; // Reduced from 40px
  pulse.style.height = "32px"; // Reduced from 40px
  pulse.style.borderRadius = "50%";
  pulse.style.border = tower.health === "ok" 
    ? "2px solid rgba(34, 197, 94, 0.6)" 
    : "2px solid rgba(239, 68, 68, 0.6)"; // Red for degraded
  pulse.style.animation = "pulse 2s ease-out infinite";
  pulse.style.pointerEvents = "none"; // Don't interfere with marker clicks
  pulse.style.zIndex = "1"; // Behind the inner circle
  pulse.style.margin = "0";
  pulse.style.padding = "0";
  pulse.style.boxSizing = "border-box";

  // Create the inner circle (glassmorphic) - positioned absolutely within wrapper
  const inner = document.createElement("div");
  inner.style.position = "absolute";
  inner.style.top = "50%";
  inner.style.left = "50%";
  inner.style.transform = "translate(-50%, -50%)";
  inner.style.width = "32px"; // Reduced from 40px
  inner.style.height = "32px"; // Reduced from 40px
  inner.style.borderRadius = "50%";
  inner.style.backdropFilter = "blur(10px)";
  inner.style.border = tower.health === "ok" 
    ? "3px solid rgba(34, 197, 94, 0.8)" 
    : "3px solid rgba(239, 68, 68, 0.8)"; // Red for degraded
  inner.style.backgroundColor = tower.health === "ok" 
    ? "rgba(34, 197, 94, 0.2)" 
    : "rgba(239, 68, 68, 0.2)"; // Red for degraded
  inner.style.boxShadow = tower.health === "ok"
    ? "0 0 20px rgba(34, 197, 94, 0.5), inset 0 0 10px rgba(34, 197, 94, 0.2)"
    : "0 0 20px rgba(239, 68, 68, 0.5), inset 0 0 10px rgba(239, 68, 68, 0.2)"; // Red for degraded
  inner.style.display = "flex";
  inner.style.alignItems = "center";
  inner.style.justifyContent = "center";
  inner.style.transition = "transform 0.3s ease, box-shadow 0.3s ease";
  inner.style.zIndex = "2"; // Above the pulse
  inner.style.margin = "0";
  inner.style.padding = "0";
  inner.style.boxSizing = "border-box";

  // Add icon (radio tower)
  const icon = document.createElement("div");
  icon.style.fontSize = "14px"; // Reduced from 18px
  icon.innerHTML = "📡";
  icon.style.filter = "grayscale(0.3)";
  icon.style.margin = "0";
  icon.style.padding = "0";
  icon.style.lineHeight = "1";
  icon.style.pointerEvents = "none";

  inner.appendChild(icon);
  wrapper.appendChild(pulse); // Add pulse first (behind)
  wrapper.appendChild(inner); // Add inner circle on top
  el.appendChild(wrapper); // Add wrapper to main element

  // Add hover effects
  el.addEventListener("mouseenter", () => {
    // Scale from center - maintain the translate to keep it centered
    inner.style.transform = "translate(-50%, -50%) scale(1.2)";
    inner.style.boxShadow = tower.health === "ok"
      ? "0 0 30px rgba(34, 197, 94, 0.8), inset 0 0 15px rgba(34, 197, 94, 0.3)"
      : "0 0 30px rgba(239, 68, 68, 0.8), inset 0 0 15px rgba(239, 68, 68, 0.3)"; // Red for degraded
  });

  el.addEventListener("mouseleave", () => {
    inner.style.transform = "translate(-50%, -50%) scale(1)";
    inner.style.boxShadow = tower.health === "ok"
      ? "0 0 20px rgba(34, 197, 94, 0.5), inset 0 0 10px rgba(34, 197, 94, 0.2)"
      : "0 0 20px rgba(239, 68, 68, 0.5), inset 0 0 10px rgba(239, 68, 68, 0.2)"; // Red for degraded
  });

  // Add click handler
  el.addEventListener("click", () => {
    if (onTowerClick) {
      onTowerClick(tower);
    }
  });

  // Create tooltip popup with data attributes for easy updates
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
      <div class="tower-health-badge" data-health="${tower.health}" style="
        display: inline-flex; 
        align-items: center; 
        gap: 6px;
        padding: 4px 10px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        background: ${tower.health === "ok" ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"};
        border: 1px solid ${tower.health === "ok" ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)"};
        color: ${tower.health === "ok" ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"};
      ">
        <span style="font-size: 8px;">●</span>
        <span class="tower-health-text">${tower.health === "ok" ? "Operational" : "Degraded"}</span>
      </div>
      <p style="margin: 8px 0 0 0; font-size: 11px; color: rgba(255, 255, 255, 0.5); font-style: italic;">
        Click for details
      </p>
    </div>
  `);

  // Create marker with explicit anchor point to ensure it stays fixed to coordinates
  const marker = new mapboxgl.Marker({
    element: el,
    anchor: 'center', // Center the marker on the coordinates
  })
    .setLngLat([tower.lng, tower.lat]) // Set coordinates (longitude first, then latitude)
    .setPopup(popup)
    .addTo(mapInstance);

  // Verify the marker was placed correctly
  const markerLngLat = marker.getLngLat();
  console.log(`✅ Marker ${tower.id} placed at:`, {
    expected: { lat: tower.lat, lng: tower.lng },
    actual: { lat: markerLngLat.lat, lng: markerLngLat.lng },
  });

  return marker;
};

// Add CSS animation for pulse effect
const style = document.createElement("style");
style.textContent = `
  @keyframes pulse {
    0% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.8;
    }
    50% {
      opacity: 0.4;
    }
    100% {
      transform: translate(-50%, -50%) scale(2.5);
      opacity: 0;
    }
  }
  
  
  @keyframes pulse-user-location {
    0% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(3);
      opacity: 0;
    }
  }
  
  .user-location-popup .mapboxgl-popup-content {
    padding: 0 !important;
    background: transparent !important;
    box-shadow: 0 10px 40px rgba(226, 0, 116, 0.5) !important;
  }
  
  .user-location-popup .mapboxgl-popup-tip {
    border-top-color: rgba(226, 0, 116, 0.95) !important;
  }
  
  .user-location-popup .mapboxgl-popup-close-button {
    color: white !important;
    font-size: 20px !important;
    padding: 8px !important;
    opacity: 0.8 !important;
  }
  
  .user-location-popup .mapboxgl-popup-close-button:hover {
    opacity: 1 !important;
    background: rgba(255, 255, 255, 0.1) !important;
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
