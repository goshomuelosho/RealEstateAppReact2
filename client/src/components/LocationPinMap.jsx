import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  SELECTED_MAP_ZOOM,
  ensureLeafletMarkerIcons,
  geocodeAddress,
  parseCoordinatePair,
} from "../utils/locationMap";

const mapStyle = {
  width: "100%",
  height: 260,
  borderRadius: 14,
  border: "1px solid rgba(15,23,42,0.1)",
  overflow: "hidden",
  marginTop: "0.75rem",
};

const statusStyle = {
  margin: "0.5rem 0 0",
  fontSize: "0.88rem",
  color: "#475569",
};

export default function LocationPinMap({ location }) {
  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geocodeControllerRef = useRef(null);

  const [status, setStatus] = useState("");

  useEffect(() => {
    ensureLeafletMarkerIcons();

    if (!mapNodeRef.current || mapRef.current) return;

    const map = L.map(mapNodeRef.current, {
      center: DEFAULT_MAP_CENTER,
      zoom: DEFAULT_MAP_ZOOM,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      geocodeControllerRef.current?.abort();
      map.off();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !location?.trim()) return;

    const placeMarker = (lat, lng) => {
      if (!markerRef.current) {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      } else {
        markerRef.current.setLatLng([lat, lng]);
      }
      map.setView([lat, lng], SELECTED_MAP_ZOOM);
    };

    const parsed = parseCoordinatePair(location);
    if (parsed) {
      placeMarker(parsed.lat, parsed.lng);
      setStatus("Позицията е показана по координати.");
      return;
    }

    geocodeControllerRef.current?.abort();
    const controller = new AbortController();
    geocodeControllerRef.current = controller;

    const resolveAddress = async () => {
      setStatus("Локализиране на адреса...");
      try {
        const result = await geocodeAddress(location, controller.signal);
        if (!result) {
          setStatus("Не успях да покажа точната позиция на картата.");
          return;
        }
        placeMarker(result.lat, result.lng);
        setStatus("Точката е показана на картата.");
      } catch (error) {
        if (error?.name !== "AbortError") {
          setStatus("Грешка при зареждане на картата.");
        }
      }
    };

    resolveAddress();
  }, [location]);

  if (!location?.trim()) return null;

  return (
    <div>
      <h3 style={{ margin: "0.75rem 0 0.4rem", fontSize: "1.05rem" }}>Локация на картата</h3>
      <div ref={mapNodeRef} style={mapStyle} />
      {status ? <p style={statusStyle}>{status}</p> : null}
    </div>
  );
}

