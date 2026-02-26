const FALLBACK_APP_URL = "https://realestate-frontend-vlts.onrender.com";

const rawBaseUrl =
  import.meta.env.VITE_APP_URL ||
  (typeof window !== "undefined" ? window.location.origin : FALLBACK_APP_URL);

const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, "");

export const LOGIN_REDIRECT_URL = `${normalizedBaseUrl}/login`;
export const PASSWORD_RESET_REDIRECT_URL = `${normalizedBaseUrl}/reset-password`;
