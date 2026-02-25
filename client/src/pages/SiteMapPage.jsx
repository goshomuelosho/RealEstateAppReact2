import { Link } from "react-router-dom";
import InfoPageLayout from "../components/InfoPageLayout";

const sections = [
  {
    title: "Основни секции",
    paragraphs: [
      "Използвай тази карта на сайта за бърз достъп до ключовите страници.",
    ],
  },
];

const linksWrap = {
  marginTop: "0.4rem",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "0.8rem",
};

const linkCard = {
  display: "block",
  textDecoration: "none",
  border: "1px solid rgba(148,163,184,0.28)",
  borderRadius: 12,
  padding: "0.75rem 0.85rem",
  color: "#dbeafe",
  fontWeight: 700,
  background: "rgba(15,23,42,0.45)",
};

const groups = [
  {
    title: "Навигация",
    links: [
      { to: "/dashboard", label: "Табло" },
      { to: "/marketplace", label: "Пазар" },
      { to: "/my-estates", label: "Моите имоти" },
      { to: "/add-estate", label: "Добави имот" },
      { to: "/messages", label: "Съобщения" },
      { to: "/profile", label: "Профил" },
      { to: "/admin", label: "Админ панел" },
    ],
  },
  {
    title: "Публични",
    links: [
      { to: "/login", label: "Вход" },
      { to: "/register", label: "Регистрация" },
    ],
  },
  {
    title: "Информация",
    links: [
      { to: "/help", label: "Помощен център" },
      { to: "/contacts", label: "Контакти" },
      { to: "/terms", label: "Общи условия" },
      { to: "/privacy", label: "Лични данни" },
      { to: "/sitemap", label: "Карта на сайта" },
    ],
  },
];

export default function SiteMapPage() {
  return (
    <InfoPageLayout
      titleText="Карта на сайта"
      subtitleText="Структура на основните страници и бързи линкове."
      updatedText="Последна актуализация: 25.02.2026"
      sections={sections}
    >
      {groups.map((group) => (
        <section key={group.title} style={{ marginTop: "0.9rem" }}>
          <h2 style={{ margin: "0 0 0.5rem", color: "#e2e8f0", fontSize: "1.1rem" }}>
            {group.title}
          </h2>
          <div style={linksWrap}>
            {group.links.map((entry) => (
              <Link key={`${group.title}-${entry.to}`} style={linkCard} to={entry.to}>
                {entry.label}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </InfoPageLayout>
  );
}
