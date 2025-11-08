import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { towers } from "@/lib/mockData";

// Note: Replace with your actual Mapbox token
const MAPBOX_TOKEN = "pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNtM3I2ODJ5aTBqanEyanM5bzg0aWd2eXMifQ.b8bH9JxHXrLWDPzTqCGfQg";

interface MapboxMapProps {
  className?: string;
}

export const MapboxMap = ({ className }: MapboxMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-97.7431, 35.0], // Center between regions
      zoom: 4,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add tower markers
    towers.forEach((tower) => {
      // Create custom marker element
      const el = document.createElement("div");
      el.className = "tower-marker";
      el.style.width = "30px";
      el.style.height = "30px";
      el.style.borderRadius = "50%";
      el.style.border = tower.health === "ok" ? "3px solid hsl(var(--success))" : "3px solid hsl(var(--warning))";
      el.style.backgroundColor = tower.health === "ok" ? "hsl(var(--success) / 0.2)" : "hsl(var(--warning) / 0.2)";
      el.style.cursor = "pointer";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.fontSize = "14px";

      // Add popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px; font-family: system-ui;">
          <h3 style="margin: 0 0 8px 0; font-weight: 600; color: hsl(var(--foreground));">${tower.id}</h3>
          <p style="margin: 0 0 4px 0; font-size: 13px; color: hsl(var(--muted-foreground));">${tower.region}</p>
          <p style="margin: 0; font-size: 13px;">
            <span style="color: ${tower.health === "ok" ? "hsl(var(--success))" : "hsl(var(--warning))"};">
              ${tower.health === "ok" ? "● Operational" : "● Degraded"}
            </span>
          </p>
        </div>
      `);

      // Add marker to map
      new mapboxgl.Marker(el)
        .setLngLat([tower.lng, tower.lat])
        .setPopup(popup)
        .addTo(map.current!);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  return <div ref={mapContainer} className={className} />;
};
