import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import NavBar from "./NavBar";

const page = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  background:
    "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
  color: "#e2e8f0",
};

const main = {
  flex: 1,
  padding: "2rem 1rem 2.5rem",
};

const wrap = {
  maxWidth: 980,
  margin: "0 auto",
};

const card = {
  borderRadius: 20,
  border: "1px solid rgba(148,163,184,0.25)",
  background: "rgba(15,23,42,0.65)",
  backdropFilter: "blur(12px)",
  padding: "1.4rem 1.2rem",
  boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
};

const title = {
  margin: 0,
  fontSize: "2rem",
  fontWeight: 900,
  color: "#f8fafc",
};

const subtitle = {
  margin: "0.55rem 0 0.2rem",
  color: "rgba(226,232,240,0.86)",
  lineHeight: 1.7,
};

const updatedAt = {
  color: "#94a3b8",
  fontSize: "0.86rem",
  margin: "0.5rem 0 0",
};

const section = {
  marginTop: "1.15rem",
  paddingTop: "1rem",
  borderTop: "1px solid rgba(148,163,184,0.2)",
};

const sectionTitle = {
  margin: 0,
  fontSize: "1.18rem",
  color: "#e2e8f0",
  fontWeight: 800,
};

const paragraph = {
  margin: "0.55rem 0 0",
  color: "rgba(226,232,240,0.88)",
  lineHeight: 1.72,
};

const list = {
  margin: "0.5rem 0 0",
  paddingLeft: "1.1rem",
  color: "rgba(226,232,240,0.88)",
  lineHeight: 1.72,
};

export default function InfoPageLayout({
  titleText,
  subtitleText,
  updatedText,
  sections,
  children,
}) {
  const navigate = useNavigate();
  const [navProfile, setNavProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAuthLoading(false);
        navigate("/login", { replace: true });
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, is_admin")
        .eq("id", user.id)
        .single();

      setNavProfile(
        profileData || {
          id: user.id,
          name: user.email || "Профил",
          avatar_url: "",
          is_admin: false,
        }
      );
      setAuthLoading(false);
    };

    loadUserProfile();
  }, [navigate]);

  if (authLoading) {
    return (
      <div style={{ ...page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#cbd5e1", fontWeight: 700 }}>Зареждане...</div>
      </div>
    );
  }

  return (
    <div style={page}>
      <NavBar profile={navProfile} />

      <main style={main}>
        <div style={wrap}>
          <article style={card}>
            <header>
              <h1 style={title}>{titleText}</h1>
              <p style={subtitle}>{subtitleText}</p>
              <p style={updatedAt}>{updatedText}</p>
            </header>

            {sections.map((sectionItem) => (
              <section key={sectionItem.title} style={section}>
                <h2 style={sectionTitle}>{sectionItem.title}</h2>

                {(sectionItem.paragraphs || []).map((text, idx) => (
                  <p key={`${sectionItem.title}-p-${idx}`} style={paragraph}>
                    {text}
                  </p>
                ))}

                {sectionItem.list?.length ? (
                  <ul style={list}>
                    {sectionItem.list.map((item, idx) => (
                      <li key={`${sectionItem.title}-li-${idx}`}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            {children ? <section style={section}>{children}</section> : null}
          </article>
        </div>
      </main>
    </div>
  );
}
