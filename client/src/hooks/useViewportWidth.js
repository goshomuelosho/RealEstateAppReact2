import { useEffect, useState } from "react";

function getViewportWidth() {
  if (typeof window === "undefined") return 1280;
  return window.innerWidth;
}

export default function useViewportWidth() {
  const [viewportWidth, setViewportWidth] = useState(getViewportWidth);

  useEffect(() => {
    const onResize = () => setViewportWidth(getViewportWidth());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return viewportWidth;
}
