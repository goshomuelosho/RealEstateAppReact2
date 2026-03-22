import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { Mail, Search } from "lucide-react";
import NavBar from "../components/NavBar";
import useViewportWidth from "../hooks/useViewportWidth";
import { toBgErrorMessage } from "../utils/errorMessages";


const PROPERTY_TYPES = [
  "1-СТАЕН",
  "2-СТАЕН",
  "3-СТАЕН",
  "4-СТАЕН",
  "МНОГОСТАЕН",
  "МЕЗОНЕТ",
  "ОФИС",
  "АТЕЛИЕ, ТАВАН",
  "ЕТАЖ ОТ КЪЩА",
  "КЪЩА",
  "ВИЛА",
  "МАГАЗИН",
  "ЗАВЕДЕНИЕ",
  "СКЛАД",
  "ГАРАЖ, ПАРКОМЯСТО",
  "ПРОМ. ПОМЕЩЕНИЕ",
  "ХОТЕЛ",
  "ПАРЦЕЛ",
];

const BUILDING_TYPES = [
  "Тухла",
  "Панел",
  "ЕПК",
  "ПК",
  "Гредоред",
  "Метална конструкция",
  "Сглобяема",
  "Друго",
];

const FLOORS = [
  "Сутерен",
  "Партер",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10+",
  "Последен",
  "Не е приложимо",
];


const bgLight = (color, top, left, size) => ({
  position: "absolute",
  top,
  left,
  width: `${size}px`,
  height: `${size}px`,
  background: `radial-gradient(circle, ${color}33, transparent)`,
  borderRadius: "50%",
  filter: "blur(60px)",
  opacity: 0.8,
  pointerEvents: "none",
});

const mainWrap = (isLoaded) => ({
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
  color: "#E2E8F0",
  position: "relative",
  overflow: "hidden",
  opacity: isLoaded ? 1 : 0,
  transition: "opacity 0.4s ease",
});

const content = {
  flex: 1,
  padding: "3rem 2rem",
  position: "relative",
  zIndex: 1,
};

const contentWrapper = {
  maxWidth: "1400px",
  margin: "0 auto",
};

const compactToggleBtn = {
  padding: "0.55rem 0.85rem",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(15,23,42,0.35)",
  color: "#e2e8f0",
  fontWeight: 700,
  cursor: "pointer",
};

const filterBar = {
  display: "grid",
  gridTemplateColumns: "repeat(6, minmax(160px, 1fr))",
  gap: "0.65rem",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 16,
  padding: "0.85rem",
  marginBottom: "1.4rem",
};

const filterInput = {
  padding: "0.68rem 0.85rem",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.1)",
  color: "#fff",
  outline: "none",
};

const selectStyle = {
  ...filterInput,
  appearance: "none",
  cursor: "pointer",
  backgroundColor: "#1e293b",
  color: "#f1f5f9",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: "1.25rem",
};

const card = {
  background: "rgba(255,255,255,0.95)",
  borderRadius: 20,
  overflow: "hidden",
  color: "#0f172a",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  transition: "all 0.4s cubic-bezier(0.175,0.885,0.32,1.275)",
  position: "relative",
};

const priceBadge = {
  display: "inline-block",
  padding: "0.45rem 1rem",
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  color: "#fff",
  fontWeight: 700,
  borderRadius: 10,
  fontSize: "1.1rem",
};

const sellerRow = {
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
  marginTop: "0.75rem",
  minWidth: 0,
};

const contactBtn = {
  width: 42,
  height: 38,
  padding: 0,
  border: "1px solid rgba(255,255,255,0.22)",
  background: "linear-gradient(135deg,#10b981,#059669)",
  color: "#fff",
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  borderRadius: 12,
  boxShadow: "0 8px 18px rgba(16,185,129,0.28)",
  transition: "transform 0.15s ease, filter 0.2s ease",
};


const metaRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 10,
};

const pill = (variant = "neutral") => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "0.28rem 0.55rem",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
  maxWidth: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  letterSpacing: 0.2,
  border: "1px solid rgba(0,0,0,0.08)",
  background:
    variant === "type"
      ? "linear-gradient(135deg, rgba(59,130,246,0.16), rgba(37,99,235,0.16))"
      : variant === "act16"
      ? "linear-gradient(135deg, rgba(16,185,129,0.18), rgba(5,150,105,0.18))"
      : variant === "floor"
      ? "linear-gradient(135deg, rgba(139,92,246,0.16), rgba(124,58,237,0.16))"
      : "rgba(15,23,42,0.06)",
  color:
    variant === "type"
      ? "#1d4ed8"
      : variant === "act16"
      ? "#065f46"
      : variant === "floor"
      ? "#5b21b6"
      : "#334155",
});

const oneLineClamp = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  minWidth: 0,
};

const twoLineClamp = {
  overflow: "hidden",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  wordBreak: "normal",
  overflowWrap: "break-word",
};

const paginationRow = {
  marginTop: "1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.45rem",
  flexWrap: "wrap",
};

const pageBtn = (active = false) => ({
  minWidth: 36,
  height: 34,
  padding: "0 0.7rem",
  borderRadius: 10,
  border: active ? "1px solid rgba(59,130,246,0.85)" : "1px solid rgba(148,163,184,0.45)",
  background: active
    ? "linear-gradient(135deg, rgba(59,130,246,0.9), rgba(37,99,235,0.9))"
    : "rgba(15,23,42,0.45)",
  color: "#e2e8f0",
  fontWeight: 700,
  cursor: "pointer",
});

const loaderContainer = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "220px",
};

const loaderSpinner = {
  width: "40px",
  height: "40px",
  border: "4px solid rgba(255,255,255,0.3)",
  borderTop: "4px solid #3b82f6",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};


const sentOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.7)",
  backdropFilter: "blur(8px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const sentCard = {
  background: "rgba(255,255,255,0.95)",
  borderRadius: "24px",
  padding: "3rem 2.5rem",
  textAlign: "center",
  boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
};

const sentCheckContainer = {
  width: "80px",
  height: "80px",
  margin: "0 auto 1.5rem",
  background: "linear-gradient(135deg, #10b981, #059669)",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const sentCheckMark = {
  width: "24px",
  height: "40px",
  borderRight: "5px solid white",
  borderBottom: "5px solid white",
  transform: "rotate(45deg)",
};

const sentTitle = {
  fontSize: "1.75rem",
  fontWeight: "800",
  color: "#0f172a",
  marginBottom: "0.75rem",
};

const sentText = {
  color: "#64748b",
  fontSize: "1rem",
  marginBottom: "1.5rem",
};

const sentProgress = {
  width: "60px",
  height: "4px",
  background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
  borderRadius: "2px",
  margin: "0 auto",
};


const favStarBtn = (active, compact = false) => ({
  position: "absolute",
  top: compact ? 8 : 10,
  right: compact ? 8 : 10,
  width: compact ? 42 : 48,
  height: compact ? 42 : 48,
  borderRadius: compact ? 14 : 16,
  border: active
    ? "1px solid rgba(245,158,11,0.45)"
    : "1px solid rgba(148,163,184,0.45)",
  background: active
    ? "linear-gradient(135deg, rgba(245,158,11,0.22), rgba(253,230,138,0.22))"
    : "rgba(15,23,42,0.08)",
  boxShadow: active
    ? "0 10px 25px rgba(245,158,11,0.22)"
    : "0 8px 20px rgba(0,0,0,0.14)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  lineHeight: 0,
  transition: "transform 0.12s ease, filter 0.2s ease",
});

const favStarGlyph = (active, compact = false) => ({
  fontSize: compact ? 24 : 28,
  lineHeight: 1,
  color: active ? "#fbbf24" : "#94a3b8", 
});


const toggleTrack = (on) => ({
  width: 52,
  height: 30,
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.18)",
  background: on
    ? "linear-gradient(135deg, rgba(245,158,11,0.85), rgba(217,119,6,0.85))"
    : "rgba(148,163,184,0.28)",
  position: "relative",
  cursor: "pointer",
  boxShadow: on ? "0 10px 24px rgba(245,158,11,0.18)" : "none",
  transition: "background 0.2s ease, box-shadow 0.2s ease",
});

const compactToggleTrack = (on) => ({
  ...toggleTrack(on),
  width: 42,
  height: 24,
  borderRadius: 999,
});

const compactToggleKnob = (on) => ({
  width: 18,
  height: 18,
  borderRadius: 999,
  background: "#fff",
  position: "absolute",
  top: 2,
  left: on ? 22 : 2,
  transition: "left 0.2s ease",
  boxShadow: "0 6px 12px rgba(0,0,0,0.2)",
});


export default function Marketplace() {
  const viewportWidth = useViewportWidth();
  const isMobile = viewportWidth <= 768;
  const isCompactLayout = viewportWidth <= 1400;
  const isNarrowTablet = viewportWidth <= 1024;
  const isWideDesktop = viewportWidth >= 1800;
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(() => !isCompactLayout);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);

  const [estates, setEstates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const [qTitle, setQTitle] = useState("");
  const [qLocation, setQLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");

  const [propertyType, setPropertyType] = useState("");
  const [buildingType, setBuildingType] = useState("");
  const [floor, setFloor] = useState("");
  const [act16, setAct16] = useState("all");

  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  const [contactOpen, setContactOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [showSentModal, setShowSentModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredCard, setHoveredCard] = useState(null);

  const denseFilters = isCompactLayout || isMobile;
  const compactFilterBar = {
    ...filterBar,
    gap: denseFilters ? "0.5rem" : filterBar.gap,
    padding: denseFilters ? (isMobile ? "0.55rem" : "0.62rem") : filterBar.padding,
    borderRadius: denseFilters ? 12 : filterBar.borderRadius,
    marginBottom: denseFilters ? "0.9rem" : filterBar.marginBottom,
  };
  const compactFilterInput = {
    ...filterInput,
    padding: denseFilters ? (isMobile ? "0.5rem 0.65rem" : "0.56rem 0.72rem") : filterInput.padding,
    borderRadius: denseFilters ? 10 : filterInput.borderRadius,
    fontSize: denseFilters ? "0.9rem" : undefined,
    minHeight: denseFilters ? 38 : undefined,
  };
  const compactFilterSelect = {
    ...selectStyle,
    ...compactFilterInput,
    backgroundColor: selectStyle.backgroundColor,
    color: selectStyle.color,
    paddingRight: denseFilters ? "2rem" : undefined,
  };
  const cardsPerPage = isMobile ? 4 : isCompactLayout ? 8 : 12;
  const totalPages = Math.max(1, Math.ceil(estates.length / cardsPerPage));
  const pagedEstates = estates.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage
  );
  const resultsMinHeight = isMobile || isCompactLayout ? "auto" : isWideDesktop ? "64vh" : "58vh";
  const advancedFiltersCount = [
    minPrice !== "",
    maxPrice !== "",
    !!propertyType,
    !!buildingType,
    !!floor,
    act16 !== "all",
  ].filter(Boolean).length;

  const fetchListings = useCallback(
    async ({
      qTitleVal = qTitle,
      qLocationVal = qLocation,
      minPriceVal = minPrice,
      maxPriceVal = maxPrice,
      sortVal = sort,
      propertyTypeVal = propertyType,
      buildingTypeVal = buildingType,
      floorVal = floor,
      act16Val = act16,
      onlyFavoritesVal = onlyFavorites,
    } = {}) => {
      setLoading(true);

      let query = supabase.from("estates").select("*").eq("is_public", true);

      if (qTitleVal.trim()) query = query.ilike("title", `%${qTitleVal}%`);
      if (qLocationVal.trim()) query = query.ilike("location", `%${qLocationVal}%`);
      if (minPriceVal) query = query.gte("price", Number(minPriceVal));
      if (maxPriceVal) query = query.lte("price", Number(maxPriceVal));

      if (propertyTypeVal) query = query.eq("property_type", propertyTypeVal);
      if (buildingTypeVal) query = query.eq("building_type", buildingTypeVal);
      if (floorVal) query = query.eq("floor", floorVal);

      if (act16Val === "yes") query = query.eq("has_act16", true);
      if (act16Val === "no") query = query.eq("has_act16", false);

      if (onlyFavoritesVal) {
        const ids = Array.from(favoriteIds);
        if (ids.length === 0) {
          setEstates([]);
          setLoading(false);
          return;
        }
        query = query.in("id", ids);
      }

      if (sortVal === "low-high") query = query.order("price", { ascending: true });
      else if (sortVal === "high-low")
        query = query.order("price", { ascending: false });
      else query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (!error) setEstates(data || []);
      setLoading(false);
    },
    [
      qTitle,
      qLocation,
      minPrice,
      maxPrice,
      sort,
      propertyType,
      buildingType,
      floor,
      act16,
      onlyFavorites,
      favoriteIds,
    ]
  );

  useEffect(() => {
    if (!isCompactLayout) setFiltersOpen(true);
  }, [isCompactLayout]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate("/login");
        return;
      }

      const { data: myProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, is_admin")
        .eq("id", data.user.id)
        .single();

      if (profileError) console.error("Error loading profile in Marketplace:", profileError);

      const currentProfile = myProfile || {
        id: data.user.id,
        name: "",
        avatar_url: "",
        is_admin: false,
      };

      currentProfile.is_admin = !!currentProfile.is_admin;

      setProfile(currentProfile);

      const { data: favs, error: favErr } = await supabase
        .from("favorites")
        .select("estate_id")
        .eq("user_id", currentProfile.id);

      if (!favErr) setFavoriteIds(new Set((favs || []).map((f) => f.estate_id)));
      else console.error("Error loading favorites:", favErr);

      setTimeout(() => setIsLoaded(true), 150);
    })();
  }, [navigate]);

  useEffect(() => {
    if (!profile) return;

    const t = setTimeout(() => {
      fetchListings();
    }, 400);

    return () => clearTimeout(t);
  }, [profile, fetchListings]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    qTitle,
    qLocation,
    minPrice,
    maxPrice,
    sort,
    propertyType,
    buildingType,
    floor,
    act16,
    onlyFavorites,
  ]);

  useEffect(() => {
    setCurrentPage((prev) => (prev > totalPages ? totalPages : prev));
  }, [totalPages]);

  const toggleFavorite = async (estateId) => {
    if (!profile?.id) return;

    const isFav = favoriteIds.has(estateId);

    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isFav) next.delete(estateId);
      else next.add(estateId);
      return next;
    });

    if (isFav) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", profile.id)
        .eq("estate_id", estateId);

      if (error) {
        console.error("Error removing favorite:", error);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.add(estateId);
          return next;
        });
      }
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert([{ user_id: profile.id, estate_id: estateId }]);

      if (error) {
        console.error("Error adding favorite:", error);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(estateId);
          return next;
        });
      }
    }
  };

  const openContact = async (estate) => {
    setSelectedListing(estate);
    setSellerProfile(null);
    setContactOpen(true);

    const { data: sp, error } = await supabase
      .from("profiles")
      .select("id, name, avatar_url, is_admin")
      .eq("id", estate.user_id)
      .single();

    if (error) {
      console.error("Error loading seller profile:", error);
      setContactOpen(false);
      return;
    }

    setSellerProfile(sp);
  };

  const sendMessage = async () => {
    if (!message.trim() || !sellerProfile || !selectedListing || !profile?.id) return;
    try {
      setSending(true);
      const { error: insertError } = await supabase.from("messages").insert([
        {
          estate_id: selectedListing.id,
          sender_id: profile.id,
          receiver_id: sellerProfile.id,
          content: message.trim(),
        },
      ]);

      if (insertError) {
        throw insertError;
      }

      setMessage("");
      setContactOpen(false);

      setShowSentModal(true);
      setTimeout(() => setShowSentModal(false), 2000);
    } catch (e) {
      console.error(e);
      alert(toBgErrorMessage(e, "Неуспешно изпращане. Моля, опитайте отново."));
    } finally {
      setSending(false);
    }
  };

  const title = "Пазар";

  return (
    <div style={mainWrap(isLoaded)}>
      <div style={bgLight("#3b82f6", "10%", "5%", 300)} />
      <div style={bgLight("#8b5cf6", "80%", "85%", 400)} />

      <NavBar profile={profile} active="marketplace" />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        select option { background: #0f172a; color: #f1f5f9; }
      `}</style>

      <main
        style={{
          ...content,
          padding: isMobile
            ? "1rem 0.85rem 1.2rem"
            : isCompactLayout
            ? "1.5rem 1rem 1.4rem"
            : content.padding,
        }}
      >
        <div style={contentWrapper}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: isMobile ? "1.65rem" : isCompactLayout ? "1.85rem" : "2rem",
              fontWeight: 800,
              background: "linear-gradient(135deg,#fff,#94a3b8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {title}
          </h1>
        </div>

        {isCompactLayout ? (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.55rem" }}>
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              style={compactToggleBtn}
              aria-label={filtersOpen ? "Скрий филтрите" : "Покажи филтрите"}
            >
              {filtersOpen ? "Скрий филтрите" : "Покажи филтрите"}
            </button>
          </div>
        ) : null}

        
        {!isCompactLayout || filtersOpen ? (
          <div
            style={{
              ...compactFilterBar,
              display: "flex",
              flexDirection: "column",
              gap: denseFilters ? "0.45rem" : "0.6rem",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : isNarrowTablet
                  ? "repeat(2, minmax(160px, 1fr))"
                  : "minmax(170px,1.2fr) minmax(170px,1.2fr) minmax(150px,0.9fr) auto",
                gap: denseFilters ? "0.45rem" : "0.6rem",
                alignItems: "stretch",
              }}
            >
              <input
                placeholder="Търси по заглавие"
                value={qTitle}
                onChange={(e) => setQTitle(e.target.value)}
                style={compactFilterInput}
              />

              <input
                placeholder="Търси по локация"
                value={qLocation}
                onChange={(e) => setQLocation(e.target.value)}
                style={compactFilterInput}
              />

              <select value={sort} onChange={(e) => setSort(e.target.value)} style={compactFilterSelect}>
                <option value="newest">Най-нови</option>
                <option value="low-high">Цена: ниска → висока</option>
                <option value="high-low">Цена: висока → ниска</option>
              </select>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: isMobile ? "flex-start" : "flex-end",
                  flexWrap: "wrap",
                  gap: denseFilters ? 6 : 8,
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: denseFilters ? "0.35rem 0.5rem" : "0.45rem 0.62rem",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.05)",
                  }}
                >
                  <span style={{ fontSize: denseFilters ? 12 : 13, fontWeight: 800 }}>⭐ Любими</span>
                  <div
                    role="switch"
                    aria-checked={onlyFavorites}
                    tabIndex={0}
                    onClick={() => setOnlyFavorites((v) => !v)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setOnlyFavorites((v) => !v);
                    }}
                    style={compactToggleTrack(onlyFavorites)}
                    title={onlyFavorites ? "Показва любими" : "Показва всички"}
                  >
                    <div style={compactToggleKnob(onlyFavorites)} />
                  </div>
                </div>

                <button
                  onClick={() => setAdvancedFiltersOpen((v) => !v)}
                  style={{
                    padding: denseFilters ? "0.5rem 0.72rem" : "0.62rem 0.9rem",
                    borderRadius: denseFilters ? 10 : 12,
                    border: "1px solid rgba(255,255,255,0.25)",
                    background: advancedFiltersOpen
                      ? "rgba(59,130,246,0.28)"
                      : "rgba(15,23,42,0.35)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: denseFilters ? "0.86rem" : undefined,
                    cursor: "pointer",
                  }}
                >
                  {advancedFiltersOpen
                    ? "Скрий детайлни"
                    : `Детайлни${advancedFiltersCount ? ` (${advancedFiltersCount})` : ""}`}
                </button>

                <button
                  onClick={() => {
                    const cleared = {
                      qTitleVal: "",
                      qLocationVal: "",
                      minPriceVal: "",
                      maxPriceVal: "",
                      sortVal: "newest",
                      propertyTypeVal: "",
                      buildingTypeVal: "",
                      floorVal: "",
                      act16Val: "all",
                      onlyFavoritesVal: false,
                    };

                    setQTitle("");
                    setQLocation("");
                    setMinPrice("");
                    setMaxPrice("");
                    setSort("newest");
                    setPropertyType("");
                    setBuildingType("");
                    setFloor("");
                    setAct16("all");
                    setOnlyFavorites(false);
                    setAdvancedFiltersOpen(false);
                    setCurrentPage(1);

                    fetchListings(cleared);
                  }}
                  style={{
                    padding: denseFilters ? "0.5rem 0.72rem" : "0.62rem 0.9rem",
                    borderRadius: denseFilters ? 10 : 12,
                    border: "1px solid rgba(255,255,255,0.25)",
                    background: "transparent",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: denseFilters ? "0.88rem" : undefined,
                    cursor: "pointer",
                  }}
                >
                  Нулирай
                </button>
              </div>
            </div>

            {advancedFiltersOpen ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "1fr"
                    : isNarrowTablet
                    ? "repeat(2, minmax(150px, 1fr))"
                    : "repeat(3, minmax(145px, 1fr))",
                  gap: denseFilters ? "0.45rem" : "0.6rem",
                }}
              >
                <input
                  placeholder="Минимална цена"
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  style={compactFilterInput}
                />
                <input
                  placeholder="Максимална цена"
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  style={compactFilterInput}
                />
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  style={compactFilterSelect}
                >
                  <option value="">Вид на имота (всички)</option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <select
                  value={buildingType}
                  onChange={(e) => setBuildingType(e.target.value)}
                  style={compactFilterSelect}
                >
                  <option value="">Вид на сградата (всички)</option>
                  {BUILDING_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <select value={floor} onChange={(e) => setFloor(e.target.value)} style={compactFilterSelect}>
                  <option value="">Етаж (всички)</option>
                  {FLOORS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                <select value={act16} onChange={(e) => setAct16(e.target.value)} style={compactFilterSelect}>
                  <option value="all">Акт 16 (всички)</option>
                  <option value="yes">Само с Акт 16</option>
                  <option value="no">Само без Акт 16</option>
                </select>
              </div>
            ) : null}
          </div>
        ) : null}

        
        {loading ? (
          <div style={loaderContainer}>
            <div style={loaderSpinner} />
          </div>
        ) : estates.length ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: resultsMinHeight,
            }}
          >
            <div
              style={{
                ...grid,
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : isCompactLayout
                  ? "repeat(auto-fill, minmax(230px, 1fr))"
                  : grid.gridTemplateColumns,
                gap: isMobile ? "0.85rem" : isCompactLayout ? "0.8rem" : "1.1rem",
                animation: "fadeInUp 0.6s ease",
              }}
            >
              {pagedEstates.map((estate) => {
              const showFloor =
                estate.floor &&
                estate.floor !== "Не е приложимо" &&
                String(estate.floor).trim() !== "";
              const showAct16 = estate.has_act16 === true;
              const parsedArea = Number(estate.area);
              const showArea = Number.isFinite(parsedArea) && parsedArea > 0;
              const titleText = estate.title || "Без заглавие";
              const locationText = estate.location || "Без локация";
              const priceText = `€${Number(estate.price || 0).toLocaleString()}`;

              const isFav = favoriteIds.has(estate.id);
              const compactCard = isCompactLayout && !isMobile;
              const compactText = isMobile || compactCard;
              const hoverable = !compactText;
              const compactHeader = isMobile || compactCard;
              const desktopCardMinHeight = isWideDesktop ? 560 : 520;

              return (
                <div
                  key={estate.id}
                  style={{
                    ...card,
                    minHeight: isMobile || compactCard ? undefined : desktopCardMinHeight,
                    boxShadow:
                      hoverable && hoveredCard === estate.id
                        ? "0 20px 60px rgba(59,130,246,0.4)"
                        : "0 10px 40px rgba(0,0,0,0.3)",
                    transform:
                      hoverable && hoveredCard === estate.id
                        ? "translateY(-8px) scale(1.02)"
                        : "translateY(0)",
                  }}
                  onMouseEnter={() => setHoveredCard(estate.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  
                  <button
                    onClick={() => toggleFavorite(estate.id)}
                    title={isFav ? "Премахни от любими" : "Добави в любими"}
                    style={favStarBtn(isFav, compactCard)}
                    onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
                    onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    aria-label={isFav ? "Премахни от любими" : "Добави в любими"}
                  >
                    <span style={favStarGlyph(isFav, compactCard)}>{isFav ? "★" : "☆"}</span>
                  </button>

                  {estate.image_url && (
                    <img
                      src={estate.image_url}
                      alt={estate.title}
                      style={{
                        width: "100%",
                        height: isMobile ? 156 : compactCard ? 164 : isWideDesktop ? 280 : 250,
                        objectFit: "cover",
                        transition: "transform 0.5s ease",
                        transform:
                          hoverable && hoveredCard === estate.id ? "scale(1.05)" : "scale(1)",
                      }}
                      loading="lazy"
                    />
                  )}

                  <div
                    style={{
                      padding: isMobile
                        ? "0.72rem 0.8rem"
                        : compactCard
                        ? "0.82rem 0.86rem"
                        : "1rem 1.08rem",
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: compactHeader ? "column" : "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: compactHeader ? 6 : 10,
                        flexWrap: "nowrap",
                      }}
                    >
                      <h3
                        title={titleText}
                        style={{
                          margin: 0,
                          fontSize: isMobile
                            ? "1.12rem"
                            : compactCard
                            ? "1.22rem"
                            : "1.4rem",
                          fontWeight: "700",
                          color: "#0f172a",
                          lineHeight: 1.25,
                          minHeight: "1.25em",
                          flex: 1,
                          paddingRight: compactHeader ? 0 : compactCard ? 46 : 52,
                          ...oneLineClamp,
                        }}
                      >
                        {titleText}
                      </h3>
                      <span
                        title={priceText}
                        style={{
                          ...priceBadge,
                          fontSize: isMobile
                            ? "0.94rem"
                            : compactCard
                            ? "0.97rem"
                            : "1rem",
                          padding: isMobile
                            ? "0.28rem 0.62rem"
                            : compactCard
                            ? "0.32rem 0.7rem"
                            : "0.36rem 0.82rem",
                          maxWidth: isMobile ? 136 : compactCard ? 150 : 170,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                          alignSelf: compactHeader ? "flex-start" : "auto",
                        }}
                      >
                        {priceText}
                      </span>
                    </div>

                    <p
                      title={locationText}
                      style={{
                        margin: "0.3rem 0 0.45rem",
                        color: "#475569",
                        lineHeight: 1.25,
                        minHeight: "1.25em",
                        ...oneLineClamp,
                      }}
                    >
                      📍 {locationText}
                    </p>

                    <p
                      style={{
                        margin: 0,
                        color: "#6b7280",
                        lineHeight: 1.35,
                        minHeight: "2.7em",
                        ...twoLineClamp,
                      }}
                    >
                      {(estate.description || "").slice(0, 120)}
                      {(estate.description || "").length > 120 ? "…" : ""}
                    </p>

                    <div style={metaRow}>
                      {estate.property_type ? (
                        <span style={pill("type")}>🏠 {estate.property_type}</span>
                      ) : null}
                      {showArea ? (
                        <span style={pill("neutral")}>📐 {parsedArea.toLocaleString()} кв.м</span>
                      ) : null}
                      {showAct16 ? <span style={pill("act16")}>✅ Акт 16</span> : null}
                      {showFloor ? <span style={pill("floor")}>🧱 Етаж: {estate.floor}</span> : null}
                      {estate.building_type ? (
                        <span style={pill("neutral")}>🏢 {estate.building_type}</span>
                      ) : null}
                    </div>

                    <SellerBadge userId={estate.user_id} />

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "0.6rem",
                        marginTop: "auto",
                        paddingTop: 12,
                      }}
                    >
                      <button
                        style={contactBtn}
                        onClick={() => openContact(estate)}
                        aria-label="Изпрати съобщение"
                      >
                        <Mail size={17} aria-hidden="true" />
                      </button>
                      <button
                        style={{
                          ...contactBtn,
                          background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
                          boxShadow: "0 8px 18px rgba(59,130,246,0.28)",
                        }}
                        onClick={() => navigate(`/estate/${estate.id}`)}
                        aria-label="Виж детайли"
                      >
                        <Search size={17} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>

            <div
              style={{
                ...paginationRow,
                marginTop: "auto",
                paddingTop: isMobile || isCompactLayout ? "0.95rem" : "1.45rem",
                paddingBottom: isMobile || isCompactLayout ? "0.1rem" : "0.55rem",
              }}
            >
              <button
                style={{
                  ...pageBtn(false),
                  opacity: currentPage === 1 ? 0.55 : 1,
                  cursor: currentPage === 1 ? "not-allowed" : pageBtn(false).cursor,
                }}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Предишна страница"
              >
                Назад
              </button>
              <span style={{ color: "rgba(226,232,240,0.9)", fontWeight: 700 }}>
                {currentPage} / {totalPages}
              </span>
              <button
                style={{
                  ...pageBtn(false),
                  opacity: currentPage === totalPages ? 0.55 : 1,
                  cursor:
                    currentPage === totalPages ? "not-allowed" : pageBtn(false).cursor,
                }}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Следваща страница"
              >
                Напред
              </button>
            </div>
          </div>
        ) : (
          <p style={{ color: "#94a3b8" }}>Няма намерени обяви.</p>
        )}
        </div>
      </main>

      
      {contactOpen && selectedListing && (
        <div style={overlay}>
          <div style={modal}>
            <div style={modalHeader}>
              <h3 style={modalTitle}>Свържи се с продавача</h3>
              <p style={modalSubtitle}>
                Изпрати лично съобщение за тази обява и ще го получи директно в чата.
              </p>
            </div>
            {sellerProfile ? (
              <>
                <div style={sellerInfoCard}>
                  <img
                    src={sellerProfile.avatar_url || "https://via.placeholder.com/40"}
                    alt="seller"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid rgba(59,130,246,0.2)",
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        color: "#0f172a",
                        ...oneLineClamp,
                      }}
                    >
                      {sellerProfile.name || "Продавач"}
                    </div>
                    <div style={{ fontSize: 13, color: "#475569" }}>
                      Отговорите ще пристигнат в секция „Съобщения“.
                    </div>
                  </div>
                </div>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Здравей ${sellerProfile.name || "там"}, интересувам се от "${
                    selectedListing.title
                  }".`}
                  style={{
                    width: "100%",
                    minHeight: 110,
                    resize: "none",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    color: "#0f172a",
                    fontFamily: "inherit",
                    lineHeight: 1.45,
                    outline: "none",
                    padding: "0.8rem 1rem",
                  }}
                />

                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <button
                    disabled={sending}
                    onClick={sendMessage}
                    style={{
                      flex: 1,
                      padding: "0.85rem",
                      border: "none",
                      borderRadius: 12,
                      background: sending
                        ? "linear-gradient(135deg,#94a3b8,#64748b)"
                        : "linear-gradient(135deg,#10b981,#059669)",
                      color: "#fff",
                      fontWeight: 800,
                      cursor: sending ? "not-allowed" : "pointer",
                    }}
                  >
                    {sending ? "Изпращане..." : "Изпрати"}
                  </button>

                  <button
                    onClick={() => setContactOpen(false)}
                    style={{
                      padding: "0.85rem 1rem",
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      background: "#fff",
                      color: "#0f172a",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Затвори
                  </button>
                </div>
              </>
            ) : (
              <p>Зареждане на продавача…</p>
            )}
          </div>
        </div>
      )}

      
      {showSentModal && (
        <div style={sentOverlay}>
          <div style={sentCard}>
            <div style={sentCheckContainer}>
              <div style={sentCheckMark} />
            </div>
            <h3 style={sentTitle}>Съобщението е изпратено!</h3>
            <p style={sentText}>Вашето съобщение беше доставено на продавача.</p>
            <div style={sentProgress} />
          </div>
        </div>
      )}

    </div>
  );
}


function SellerBadge({ userId }) {
  const [seller, setSeller] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("name, avatar_url")
        .eq("id", userId)
        .single();
      setSeller(data || null);
    })();
  }, [userId]);

  return seller ? (
    <div style={sellerRow}>
      <img
        src={seller.avatar_url || "https://via.placeholder.com/28"}
        alt="seller"
        style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
      />
      <span
        title={seller.name || "Продавач"}
        style={{
          fontSize: 14,
          color: "#334155",
          ...oneLineClamp,
        }}
      >
        От {seller.name || "Продавач"}
      </span>
    </div>
  ) : null;
}


const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  backdropFilter: "blur(6px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.8rem",
  zIndex: 50,
};

const modal = {
  width: "100%",
  maxWidth: 520,
  maxHeight: "calc(100vh - 1.6rem)",
  overflowY: "auto",
  background: "#fff",
  color: "#0f172a",
  fontFamily: "inherit",
  borderRadius: 18,
  padding: "1.25rem 1.25rem 1rem",
  boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
};

const modalHeader = {
  marginBottom: 12,
};

const modalTitle = {
  marginTop: 0,
  marginBottom: 6,
  color: "#0f172a",
  fontFamily: "inherit",
  fontWeight: 800,
  fontSize: "1.35rem",
  letterSpacing: "-0.015em",
  lineHeight: 1.2,
};

const modalSubtitle = {
  margin: 0,
  color: "#475569",
  fontSize: 14,
  lineHeight: 1.35,
};

const sellerInfoCard = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 12,
  padding: "0.65rem 0.72rem",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  background: "rgba(248,250,252,0.85)",
};

