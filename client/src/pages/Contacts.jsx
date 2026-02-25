import InfoPageLayout from "../components/InfoPageLayout";

const sections = [
  {
    title: "Канали за контакт",
    paragraphs: [
      "Имейл: support@realestateapp.bg",
      "Телефон: +359 2 123 4567",
      "Работно време: Понеделник - Петък, 09:00 - 18:00",
    ],
  },
  {
    title: "Адрес за кореспонденция",
    paragraphs: [
      "RealEstate App България, гр. София, бул. Витоша 15, ет. 2",
      "При посещение на място молим за предварителна уговорка по телефон или имейл.",
    ],
  },
  {
    title: "Какво да включиш в запитването",
    list: [
      "Потребителско име или имейл за връзка.",
      "Кратко описание на проблема и къде се случва.",
      "ID на обява (ако въпросът е за конкретен имот).",
      "Screenshot при технически проблем.",
    ],
  },
];

export default function Contacts() {
  return (
    <InfoPageLayout
      titleText="Контакти"
      subtitleText="Свържи се с екипа за техническа помощ, въпроси за обяви и обща информация."
      updatedText="Последна актуализация: 25.02.2026"
      sections={sections}
    />
  );
}

