import { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  SELECTED_MAP_ZOOM,
  ensureLeafletMarkerIcons,
  geocodeAddress,
  parseCoordinatePair,
  reverseGeocode,
} from "../utils/locationMap";

const mapContainerStyle = {
  width: "100%",
  height: 220,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.2)",
  overflow: "hidden",
  marginTop: "0.6rem",
};

const actionButtonStyle = (disabled) => ({
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.22)",
  background: disabled ? "rgba(148,163,184,0.28)" : "rgba(59,130,246,0.26)",
  color: "#f8fafc",
  padding: "0.75rem 0.95rem",
  cursor: disabled ? "not-allowed" : "pointer",
  fontWeight: 700,
  minWidth: 108,
});

const hintStyle = {
  fontSize: "0.82rem",
  color: "#cbd5e1",
  margin: "0.5rem 0 0",
};

const errorStyle = {
  ...hintStyle,
  color: "#fecaca",
};

export default function LocationPicker({
  value,
  onChange,
  label = "Локация",
  placeholder = "Напиши адрес или избери от картата",
  required = false,
  autoLocateOnInitialValue = false,
  inputStyle,
  labelStyle,
}) {
  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const geocodeControllerRef = useRef(null);
  const hasCenteredFromInitialValue = useRef(false);

  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState("");
  const [hint, setHint] = useState(
    "Кликни върху картата за pin или намери адрес по текст."
  );

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

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

    map.on("click", async (event) => {
      const { lat, lng } = event.latlng;
      setError("");

      if (!markerRef.current) {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      } else {
        markerRef.current.setLatLng([lat, lng]);
      }

      map.setView([lat, lng], SELECTED_MAP_ZOOM);

      geocodeControllerRef.current?.abort();
      const controller = new AbortController();
      geocodeControllerRef.current = controller;

      setIsResolving(true);
      try {
        const resolvedAddress = await reverseGeocode(lat, lng, controller.signal);
        if (resolvedAddress) {
          onChangeRef.current(resolvedAddress);
          setHint("Адресът е взет от избраната точка.");
        } else {
          const fallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          onChangeRef.current(fallback);
          setHint("Не открих точен адрес, записах координати.");
        }
      } catch (resolveError) {
        if (resolveError?.name !== "AbortError") {
          const fallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          onChangeRef.current(fallback);
          setError("Не успях да взема адрес от картата. Запазих координати.");
        }
      } finally {
        setIsResolving(false);
      }
    });

    mapRef.current = map;

    return () => {
      geocodeControllerRef.current?.abort();
      map.off();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  const placeMarker = useCallback((lat, lng, zoom = SELECTED_MAP_ZOOM) => {
    const map = mapRef.current;
    if (!map) return;

    if (!markerRef.current) {
      markerRef.current = L.marker([lat, lng]).addTo(map);
    } else {
      markerRef.current.setLatLng([lat, lng]);
    }

    map.setView([lat, lng], zoom);
  }, []);

  const findAddressOnMap = useCallback(async (normalizeInput = true) => {
    const query = (value || "").trim();
    if (!query) {
      setError("Въведи адрес.");
      return;
    }

    setError("");

    const parsed = parseCoordinatePair(query);
    if (parsed) {
      placeMarker(parsed.lat, parsed.lng);
      setHint("Позицията е поставена по координати.");
      return;
    }

    geocodeControllerRef.current?.abort();
    const controller = new AbortController();
    geocodeControllerRef.current = controller;

    setIsResolving(true);
    try {
      const result = await geocodeAddress(query, controller.signal);
      if (!result) {
        setError("Не открих адрес. Пробвай по-точно описание.");
        return;
      }

      placeMarker(result.lat, result.lng);
      if (normalizeInput && result.address) {
        onChange(result.address);
      }
      setHint("Адресът е намерен и pin-ът е поставен.");
    } catch (geocodeError) {
      if (geocodeError?.name !== "AbortError") {
        setError("Проблем при търсене на адрес. Опитай отново.");
      }
    } finally {
      setIsResolving(false);
    }
  }, [onChange, placeMarker, value]);

  useEffect(() => {
    if (!autoLocateOnInitialValue) return;

    const query = (value || "").trim();
    if (!query || hasCenteredFromInitialValue.current) return;
    hasCenteredFromInitialValue.current = true;

    findAddressOnMap(false);
  }, [autoLocateOnInitialValue, findAddressOnMap, value]);

  return (
    <div>
      <label style={labelStyle}>{label}</label>

      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <input
          name="location"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          style={{ ...inputStyle, flex: 1 }}
          required={required}
        />
        <button
          type="button"
          onClick={() => findAddressOnMap(true)}
          disabled={isResolving}
          style={actionButtonStyle(isResolving)}
        >
          {isResolving ? "..." : "Намери"}
        </button>
      </div>

      <div ref={mapNodeRef} style={mapContainerStyle} />

      {error ? <p style={errorStyle}>{error}</p> : <p style={hintStyle}>{hint}</p>}
    </div>
  );
}
