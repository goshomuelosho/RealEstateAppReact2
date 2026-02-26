const DEFAULT_DEV_SOCKET_URL = "http://localhost:5000";
const DEFAULT_SOCKET_PATH = "/socket.io";

export function getSocketConfig() {
  const configuredUrl = import.meta.env.VITE_SOCKET_URL?.trim();
  const configuredPath = import.meta.env.VITE_SOCKET_PATH?.trim();

  const url =
    configuredUrl ||
    (import.meta.env.DEV
      ? DEFAULT_DEV_SOCKET_URL
      : window.location.origin);

  return {
    url,
    path: configuredPath || DEFAULT_SOCKET_PATH,
  };
}
