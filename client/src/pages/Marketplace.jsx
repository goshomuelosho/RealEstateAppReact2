import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";

/** ---------- Local styles ---------- */
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

const content = { flex: 1, padding: "2rem", maxWidth: 1400, margin: "0 auto" };

const filterBar = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
  gap: "0.75rem",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 16,
  padding: "1rem",
  marginBottom: "1.5rem",
};

const filterInput = {
  padding: "0.8rem 1rem",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.1)",
  color: "#fff",
  outline: "none",
};

const selectStyle = { ...filterInput, appearance: "none", cursor: "pointer" };

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "1.25rem",
};

const card = {
  background: "rgba(255,255,255,0.95)",
  borderRadius: 18,
  overflow: "hidden",
  color: "#0f172a",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 10px 35px rgba(0,0,0,0.25)",
};

const priceBadge = {
  display: "inline-block",
  padding: "0.45rem 1rem",
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  color: "#fff",
  fontWeight: 800,
  borderRadius: 10,
  fontSize: "1.1rem",
};

const sellerRow = {
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
  marginTop: "0.75rem",
};

const contactBtn = {
  width: "100%",
  padding: "0.9rem",
  border: "none",
  background: "linear-gradient(135deg,#10b981,#059669)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
  borderRadius: 12,
};

const footerStyle = {
  textAlign: "center",
  padding: "1rem",
  color: "#94a3b8",
  fontSize: "0.9rem",
  borderTop: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(10px)",
  background: "rgba(15,23,42,0.5)",
};

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

/* 🌟 Message sent modal styles (same vibe as AddEstate) */
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

/** ---------- Component ---------- */
export default function Marketplace() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  // listings
  const [estates, setEstates] = useState([]);
  const [loading, setLoading] = useState(true);

  // page fade-in
  const [isLoaded, setIsLoaded] = useState(false);

  // filters
  const [qTitle, setQTitle] = useState("");
  const [qLocation, setQLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");

  // contact modal state
  const [contactOpen, setContactOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // ✅ message sent modal
  const [showSentModal, setShowSentModal] = useState(false);

  const fetchListings = async () => {
    setLoading(true);
    let query = supabase.from("estates").select("*").eq("is_public", true);

    if (qTitle.trim()) query = query.ilike("title", `%${qTitle}%`);
    if (qLocation.trim()) query = query.ilike("location", `%${qLocation}%`);
    if (minPrice) query = query.gte("price", Number(minPrice));
    if (maxPrice) query = query.lte("price", Number(maxPrice));

    if (sort === "low-high") query = query.order("price", { ascending: true });
    else if (sort === "high-low") query = query.order("price", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    const { data, error } = await query;
    if (!error) setEstates(data || []);
    setLoading(false);
  };

  // on mount: get current user & profile, and initial listings
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate("/login");
        return;
      }

      const { data: myProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        console.error("Error loading profile in Marketplace:", profileError);
      }

      setProfile(myProfile || null);

      await fetchListings();
      setTimeout(() => setIsLoaded(true), 150);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const openContact = async (estate) => {
    setSelectedListing(estate);
    setSellerProfile(null);
    setContactOpen(true);

    const { data: sp, error } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
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
    if (!message.trim() || !sellerProfile) return;
    try {
      setSending(true);
      await supabase.from("messages").insert([
        {
          estate_id: selectedListing.id,
          sender_id: profile.id,
          receiver_id: sellerProfile.id,
          content: message.trim(),
        },
      ]);
      setMessage("");
      setSending(false);
      setContactOpen(false);

      // 🎉 show same style modal as AddEstate
      setShowSentModal(true);
      setTimeout(() => setShowSentModal(false), 2000);
    } catch (e) {
      console.error(e);
      setSending(false);
      alert(`Failed to send. Please try again. ${e?.message || ""}`);
    }
  };

  const clearAndSearch = () => fetchListings();

  const title = "Marketplace";

  return (
    <div style={mainWrap(isLoaded)}>
      <div style={bgLight("#3b82f6", "10%", "5%", 300)} />
      <div style={bgLight("#8b5cf6", "80%", "85%", 400)} />

      {/* 🧭 Global NavBar with active=marketplace */}
      <NavBar profile={profile} active="marketplace" />

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <main style={content}>
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
              fontSize: "2rem",
              fontWeight: 800,
              background: "linear-gradient(135deg,#fff,#94a3b8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {title}
          </h1>
        </div>

        {/* Filters */}
        <div style={filterBar}>
          <input
            placeholder="Search Title"
            value={qTitle}
            onChange={(e) => setQTitle(e.target.value)}
            style={filterInput}
          />
          <input
            placeholder="Search Location"
            value={qLocation}
            onChange={(e) => setQLocation(e.target.value)}
            style={filterInput}
          />
          <input
            placeholder="Min Price"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            style={filterInput}
          />
          <input
            placeholder="Max Price"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            style={filterInput}
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={selectStyle}
          >
            <option value="newest">🕒 Newest</option>
            <option value="low-high">💲 Price: Low → High</option>
            <option value="high-low">💰 Price: High → Low</option>
          </select>
          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
            <button
              onClick={clearAndSearch}
              style={{
                padding: "0.7rem 1rem",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg,#10b981,#059669)",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Apply
            </button>
            <button
              onClick={() => {
                setQTitle("");
                setQLocation("");
                setMinPrice("");
                setMaxPrice("");
                setSort("newest");
                fetchListings();
              }}
              style={{
                padding: "0.7rem 1rem",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.25)",
                background: "transparent",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={loaderContainer}>
            <div style={loaderSpinner} />
          </div>
        ) : estates.length ? (
          <div style={{ ...grid, animation: "fadeInUp 0.6s ease" }}>
            {estates.map((estate) => (
              <div key={estate.id} style={card}>
                {estate.image_url && (
                  <img
                    src={estate.image_url}
                    alt={estate.title}
                    style={{ width: "100%", height: 200, objectFit: "cover" }}
                    loading="lazy"
                  />
                )}
                <div style={{ padding: "1rem 1.1rem", flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.4rem",
                        fontWeight: "700",
                        color: "#0f172a",
                      }}
                    >
                      {estate.title}
                    </h3>
                    <span style={priceBadge}>
                      ${Number(estate.price || 0).toLocaleString()}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: "0.4rem 0 0.5rem",
                      color: "#475569",
                    }}
                  >
                    📍 {estate.location}
                  </p>
                  <p style={{ margin: 0, color: "#6b7280" }}>
                    {(estate.description || "").slice(0, 120)}
                    {(estate.description || "").length > 120 ? "…" : ""}
                  </p>

                  {/* Seller mini row */}
                  <SellerBadge userId={estate.user_id} />

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                      marginTop: 12,
                    }}
                  >
                    <button
                      style={contactBtn}
                      onClick={() => openContact(estate)}
                    >
                      ✉️ Contact
                    </button>
                    <button
                      style={{
                        ...contactBtn,
                        background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
                      }}
                      onClick={() => navigate(`/estate/${estate.id}`)}
                    >
                      🔎 Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#94a3b8" }}>No listings found.</p>
        )}
      </main>

      {/* Contact Modal */}
      {contactOpen && selectedListing && (
        <div style={overlay}>
          <div style={modal}>
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>Contact Seller</h3>
            {sellerProfile ? (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <img
                    src={
                      sellerProfile.avatar_url ||
                      "https://via.placeholder.com/40"
                    }
                    alt="seller"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      {sellerProfile.name || "Seller"}
                    </div>
                    <div style={{ fontSize: 14, color: "#475569" }}>
                      Send a private in-app message:
                    </div>
                  </div>
                </div>

                {/* In-app message composer */}
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Hi ${
                    sellerProfile.name || "there"
                  }, I'm interested in "${selectedListing.title}".`}
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
                    {sending ? "Sending..." : "Send Message"}
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
                    Close
                  </button>
                </div>
              </>
            ) : (
              <p>Loading seller…</p>
            )}
          </div>
        </div>
      )}

      {/* 🎉 Message Sent Modal (same style as AddEstate) */}
      {showSentModal && (
        <div style={sentOverlay}>
          <div style={sentCard}>
            <div style={sentCheckContainer}>
              <div style={sentCheckMark} />
            </div>
            <h3 style={sentTitle}>Message Sent!</h3>
            <p style={sentText}>Your message was delivered to the seller.</p>
            <div style={sentProgress} />
          </div>
        </div>
      )}

      {/* footer */}
      <footer style={footerStyle}>
        © {new Date().getFullYear()} Real Estate Marketplace | Built with ❤️
      </footer>
    </div>
  );
}

/** ---------- Small seller badge component (fetch per card) ---------- */
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
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />
      <span style={{ fontSize: 14, color: "#334155" }}>
        By {seller.name || "Seller"}
      </span>
    </div>
  ) : null;
}

/** ---------- Modal styles for contact ---------- */
const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  backdropFilter: "blur(6px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 50,
};

const modal = {
  width: "100%",
  maxWidth: 520,
  background: "#fff",
  color: "#0f172a",
  borderRadius: 18,
  padding: "1.25rem 1.25rem 1rem",
  boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
};
