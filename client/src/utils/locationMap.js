import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

export const DEFAULT_MAP_CENTER = [42.6977, 23.3219]; // Sofia
export const DEFAULT_MAP_ZOOM = 12;
export const SELECTED_MAP_ZOOM = 16;

let markerIconsConfigured = false;

export function ensureLeafletMarkerIcons() {
  if (markerIconsConfigured) return;

  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });

  markerIconsConfigured = true;
}

export function parseCoordinatePair(input) {
  if (!input || typeof input !== "string") return null;

  const match = input
    .trim()
    .match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);

  if (!match) return null;

  const lat = Number(match[1]);
  const lng = Number(match[2]);

  if (
    Number.isNaN(lat) ||
    Number.isNaN(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }

  return { lat, lng };
}

export async function geocodeAddress(query, signal) {
  const q = query?.trim();
  if (!q) return null;

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.search = new URLSearchParams({
    q,
    format: "jsonv2",
    limit: "1",
    addressdetails: "1",
  }).toString();

  const response = await fetch(url.toString(), {
    signal,
    headers: {
      "Accept-Language": "bg,en",
    },
  });

  if (!response.ok) {
    throw new Error(`Geocoding error: ${response.status}`);
  }

  const results = await response.json();
  if (!Array.isArray(results) || results.length === 0) return null;

  const first = results[0];
  return {
    lat: Number(first.lat),
    lng: Number(first.lon),
    address: first.display_name || q,
  };
}

export async function reverseGeocode(lat, lng, signal) {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.search = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: "jsonv2",
    zoom: "18",
    addressdetails: "1",
  }).toString();

  const response = await fetch(url.toString(), {
    signal,
    headers: {
      "Accept-Language": "bg,en",
    },
  });

  if (!response.ok) {
    throw new Error(`Reverse geocoding error: ${response.status}`);
  }

  const result = await response.json();
  return result?.display_name || null;
}

