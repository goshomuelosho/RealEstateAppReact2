import { useEffect, useRef } from "react";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const px = (value) => `${Math.round(value)}px`;

export default function InsetScrollbarOverlay({
  scrollRef,
  topInset = 30,
  bottomInset = 30,
  rightInset = 8,
  width = 6,
  minThumbHeight = 40,
}) {
  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  const rafRef = useRef(0);
  const metricsRef = useRef({
    maxScroll: 0,
    maxThumbMove: 0,
    thumbHeight: 0,
  });
  const dragCleanupRef = useRef(null);

  const update = () => {
    const scrollEl = scrollRef?.current;
    const trackEl = trackRef.current;
    const thumbEl = thumbRef.current;
    if (!scrollEl || !trackEl || !thumbEl) return;

    const clientHeight = scrollEl.clientHeight;
    const scrollHeight = scrollEl.scrollHeight;
    const scrollTop = scrollEl.scrollTop;

    const maxInset = Math.max(0, (clientHeight - 20) / 2);
    const safeTopInset = Math.min(topInset, maxInset);
    const safeBottomInset = Math.min(bottomInset, maxInset);
    const trackHeight = Math.max(0, clientHeight - safeTopInset - safeBottomInset);
    const maxScroll = Math.max(0, scrollHeight - clientHeight);
    const visible = maxScroll > 1 && trackHeight > 1;

    trackEl.style.top = px(safeTopInset);
    trackEl.style.height = px(trackHeight);
    trackEl.style.opacity = visible ? "1" : "0";
    trackEl.style.pointerEvents = visible ? "auto" : "none";
    trackEl.dataset.visible = visible ? "1" : "0";

    if (!visible) {
      metricsRef.current = { maxScroll: 0, maxThumbMove: 0, thumbHeight: 0 };
      thumbEl.style.height = "0px";
      thumbEl.style.transform = "translateY(0px)";
      return;
    }

    const thumbHeight = clamp((clientHeight / scrollHeight) * trackHeight, minThumbHeight, trackHeight);
    const maxThumbMove = Math.max(0, trackHeight - thumbHeight);
    const thumbOffset = maxScroll > 0 ? (scrollTop / maxScroll) * maxThumbMove : 0;

    metricsRef.current = {
      maxScroll,
      maxThumbMove,
      thumbHeight,
    };

    thumbEl.style.height = px(thumbHeight);
    thumbEl.style.transform = `translateY(${Math.round(thumbOffset)}px)`;
  };

  const scheduleUpdate = () => {
    if (rafRef.current) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = 0;
      update();
    });
  };

  useEffect(() => {
    const scrollEl = scrollRef?.current;
    if (!scrollEl) return undefined;

    scheduleUpdate();

    const onScroll = () => scheduleUpdate();
    const onResize = () => scheduleUpdate();
    const onLoad = () => scheduleUpdate();

    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    scrollEl.addEventListener("load", onLoad, true);
    window.addEventListener("resize", onResize);

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => scheduleUpdate());
      resizeObserver.observe(scrollEl);
    }

    return () => {
      scrollEl.removeEventListener("scroll", onScroll);
      scrollEl.removeEventListener("load", onLoad, true);
      window.removeEventListener("resize", onResize);
      if (resizeObserver) resizeObserver.disconnect();
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      if (dragCleanupRef.current) {
        dragCleanupRef.current();
        dragCleanupRef.current = null;
      }
    };
  }, [scrollRef, topInset, bottomInset, minThumbHeight]);

  const jumpToClientY = (clientY) => {
    const scrollEl = scrollRef?.current;
    const trackEl = trackRef.current;
    if (!scrollEl || !trackEl) return;

    const { maxThumbMove, thumbHeight, maxScroll } = metricsRef.current;
    if (maxThumbMove <= 0 || maxScroll <= 0) return;

    const rect = trackEl.getBoundingClientRect();
    const localY = clientY - rect.top;
    const nextOffset = clamp(localY - thumbHeight / 2, 0, maxThumbMove);
    scrollEl.scrollTop = (nextOffset / maxThumbMove) * maxScroll;
  };

  const handleTrackPointerDown = (e) => {
    const trackEl = trackRef.current;
    if (!trackEl || trackEl.dataset.visible !== "1") return;
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    jumpToClientY(e.clientY);
  };

  const handleThumbPointerDown = (e) => {
    const scrollEl = scrollRef?.current;
    const thumbEl = thumbRef.current;
    if (!scrollEl || !thumbEl) return;

    const { maxThumbMove, maxScroll } = metricsRef.current;
    if (maxThumbMove <= 0 || maxScroll <= 0) return;

    e.preventDefault();

    const startY = e.clientY;
    const startScrollTop = scrollEl.scrollTop;
    thumbEl.style.cursor = "grabbing";

    const onPointerMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const scrollDelta = (deltaY / maxThumbMove) * maxScroll;
      scrollEl.scrollTop = startScrollTop + scrollDelta;
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      thumbEl.style.cursor = "grab";
      dragCleanupRef.current = null;
    };

    dragCleanupRef.current = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      thumbEl.style.cursor = "grab";
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp, { once: true });
  };

  return (
    <div
      aria-hidden="true"
      ref={trackRef}
      onPointerDown={handleTrackPointerDown}
      style={{
        position: "absolute",
        right: rightInset,
        width,
        borderRadius: 999,
        background: "rgba(148,163,184,0.2)",
        opacity: 0,
        pointerEvents: "none",
        zIndex: 3,
      }}
    >
      <div
        ref={thumbRef}
        onPointerDown={handleThumbPointerDown}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 0,
          borderRadius: 999,
          background: "rgba(148,163,184,0.92)",
          cursor: "grab",
          transform: "translateY(0px)",
        }}
      />
    </div>
  );
}
