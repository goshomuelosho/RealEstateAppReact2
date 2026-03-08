import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { Mail, Search } from "lucide-react";
import NavBar from "../components/NavBar";
import useViewportWidth from "../hooks/useViewportWidth";


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
  padding: "2rem",
  maxWidth: 1400,
  margin: "0 auto",
  position: "relative",
  zIndex: 1,
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
  marginBottom: "1.25rem",
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
  gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
  gap: "1rem",
};

const card = {
  background: "rgba(255,255,255,0.95)",
  borderRadius: 18,
  overflow: "hidden",
  color: "#0f172a",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 10px 35px rgba(0,0,0,0.25)",
  position: "relative",
};

const priceBadge = {
  display: "inline-block",
  padding: "0.4rem 0.9rem",
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  color: "#fff",
  fontWeight: 800,
  borderRadius: 10,
  fontSize: "1.02rem",
};

const sellerRow = {
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
  marginTop: "0.75rem",
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


const favToggleRow = {
  gridColumn: "1 / -1",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 14,
  padding: "0.72rem 0.85rem",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
};

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

const toggleKnob = (on) => ({
  width: 24,
  height: 24,
  borderRadius: 999,
  background: "#fff",
  position: "absolute",
  top: 2.5,
  left: on ? 26 : 3,
  transition: "left 0.2s ease",
  boxShadow: "0 8px 16px rgba(0,0,0,0.18)",
});


export default function Marketplace() {
  const viewportWidth = useViewportWidth();
  const isMobile = viewportWidth <= 768;
  const isCompactLayout = viewportWidth <= 1400;
  const isNarrowTablet = viewportWidth <= 1024;
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(() => !isCompactLayout);

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

  const filterColumns = isMobile
    ? "1fr"
    : isNarrowTablet
    ? "repeat(2, minmax(150px, 1fr))"
    : isCompactLayout
    ? "repeat(3, minmax(160px, 1fr))"
    : filterBar.gridTemplateColumns;

  const fetchListings = async ({
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
  };

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
      fetchListings({
        qTitleVal: qTitle,
        qLocationVal: qLocation,
        minPriceVal: minPrice,
        maxPriceVal: maxPrice,
        sortVal: sort,
        propertyTypeVal: propertyType,
        buildingTypeVal: buildingType,
        floorVal: floor,
        act16Val: act16,
        onlyFavoritesVal: onlyFavorites,
      });
    }, 400);

    return () => clearTimeout(t);
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
    favoriteIds,
    profile,
  ]);

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
      alert(`Неуспешно изпращане. Моля, опитайте отново. ${e?.message || ""}`);
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
            ? "1.4rem 1rem 1.25rem"
            : content.padding,
        }}
      >
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
              ...filterBar,
              gridTemplateColumns: filterColumns,
            }}
          >
            <input
              placeholder="Търси по заглавие"
              value={qTitle}
              onChange={(e) => setQTitle(e.target.value)}
              style={filterInput}
            />
            <input
              placeholder="Търси по локация"
              value={qLocation}
              onChange={(e) => setQLocation(e.target.value)}
              style={filterInput}
            />
            <input
              placeholder="Минимална цена"
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              style={filterInput}
            />
            <input
              placeholder="Максимална цена"
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              style={filterInput}
            />

            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              style={selectStyle}
            >
              <option value="">Вид на имота (всички)</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select value={act16} onChange={(e) => setAct16(e.target.value)} style={selectStyle}>
              <option value="all">Акт 16 (всички)</option>
              <option value="yes">Само с Акт 16</option>
              <option value="no">Само без Акт 16</option>
            </select>

            <select
              value={buildingType}
              onChange={(e) => setBuildingType(e.target.value)}
              style={selectStyle}
            >
              <option value="">Вид на сградата (всички)</option>
              {BUILDING_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select value={floor} onChange={(e) => setFloor(e.target.value)} style={selectStyle}>
              <option value="">Етаж (всички)</option>
              {FLOORS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>

            <select value={sort} onChange={(e) => setSort(e.target.value)} style={selectStyle}>
              <option value="newest">Най-нови</option>
              <option value="low-high">Цена: ниска → висока</option>
              <option value="high-low">Цена: висока → ниска</option>
            </select>

            
            <div
              style={{
                ...favToggleRow,
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-start" : "center",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div style={{ fontWeight: 900, letterSpacing: 0.2 }}>⭐</div>
                <div style={{ fontSize: 13, color: "rgba(226,232,240,0.8)" }}>
                  {isCompactLayout
                    ? "Показва само любими имоти."
                    : "Показва само имотите, които си отбелязал като любими."}
                </div>
              </div>

              <div
                role="switch"
                aria-checked={onlyFavorites}
                tabIndex={0}
                onClick={() => setOnlyFavorites((v) => !v)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setOnlyFavorites((v) => !v);
                }}
                style={{
                  ...toggleTrack(onlyFavorites),
                  alignSelf: isMobile ? "flex-end" : "auto",
                }}
                title={onlyFavorites ? "Показва любими" : "Показва всички"}
              >
                <div style={toggleKnob(onlyFavorites)} />
              </div>
            </div>

            <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, flexWrap: "wrap" }}>
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

                  fetchListings(cleared);
                }}
                style={{
                  padding: "0.62rem 0.9rem",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.25)",
                  background: "transparent",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Нулирай
              </button>
            </div>
          </div>
        ) : null}

        
        {loading ? (
          <div style={loaderContainer}>
            <div style={loaderSpinner} />
          </div>
        ) : estates.length ? (
          <div
            style={{
              ...grid,
              gridTemplateColumns: isMobile ? "1fr" : grid.gridTemplateColumns,
              gap: isMobile ? "1rem" : isCompactLayout ? "0.9rem" : grid.gap,
              animation: "fadeInUp 0.6s ease",
            }}
          >
            {estates.map((estate) => {
              const showFloor =
                estate.floor &&
                estate.floor !== "Не е приложимо" &&
                String(estate.floor).trim() !== "";
              const showAct16 = estate.has_act16 === true;

              const isFav = favoriteIds.has(estate.id);
              const compactCard = isCompactLayout && !isMobile;

              return (
                <div key={estate.id} style={card}>
                  
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
                        height: isMobile ? 165 : compactCard ? 178 : 200,
                        objectFit: "cover",
                      }}
                      loading="lazy"
                    />
                  )}

                  <div style={{ padding: isMobile ? "0.85rem 0.9rem" : "0.9rem 1rem", flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: isMobile ? "flex-start" : "center",
                        gap: 10,
                        flexWrap: isMobile ? "wrap" : "nowrap",
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          fontSize: isMobile ? "1.12rem" : compactCard ? "1.22rem" : "1.4rem",
                          fontWeight: "700",
                          color: "#0f172a",
                          paddingRight: isMobile ? 0 : compactCard ? 46 : 52,
                        }}
                      >
                        {estate.title}
                      </h3>
                      <span
                        style={{
                          ...priceBadge,
                          fontSize: isMobile ? "0.92rem" : compactCard ? "0.97rem" : priceBadge.fontSize,
                          padding: isMobile ? "0.34rem 0.74rem" : priceBadge.padding,
                        }}
                      >
                        €{Number(estate.price || 0).toLocaleString()}
                      </span>
                    </div>

                    <p style={{ margin: "0.3rem 0 0.45rem", color: "#475569" }}>
                      📍 {estate.location}
                    </p>

                    <p style={{ margin: 0, color: "#6b7280" }}>
                      {(estate.description || "").slice(0, 120)}
                      {(estate.description || "").length > 120 ? "…" : ""}
                    </p>

                    <div style={metaRow}>
                      {estate.property_type ? (
                        <span style={pill("type")}>🏠 {estate.property_type}</span>
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
                        marginTop: 12,
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
        ) : (
          <p style={{ color: "#94a3b8" }}>Няма намерени обяви.</p>
        )}
      </main>

      
      {contactOpen && selectedListing && (
        <div style={overlay}>
          <div style={modal}>
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>Свържи се с продавача</h3>
            {sellerProfile ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <img
                    src={sellerProfile.avatar_url || "https://via.placeholder.com/40"}
                    alt="seller"
                    style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
                  />
                  <div>
                    <div style={{ fontWeight: 700 }}>{sellerProfile.name || "Продавач"}</div>
                    <div style={{ fontSize: 14, color: "#475569" }}>
                      Изпрати лично съобщение в приложението:
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
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
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
      <span style={{ fontSize: 14, color: "#334155" }}>От {seller.name || "Продавач"}</span>
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
  borderRadius: 18,
  padding: "1.25rem 1.25rem 1rem",
  boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
};

