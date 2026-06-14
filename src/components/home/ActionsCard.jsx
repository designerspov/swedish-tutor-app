import { useNavigate } from "react-router-dom";
import Icon from "../../Icon.jsx";
import {
  FONT, TEXT, TEXT_MUTED, PRIMARY, PRIMARY_LIGHT,
  GREEN_LIGHT, GREEN_DARK, CARD_BG, CARD_BORDER, CARD_RADIUS,
} from "../../theme.js";

function ActionRow({ row, first }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(row.to)}
      style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%",
        padding: 14, background: "transparent", border: "none",
        borderTop: first ? "none" : `1px solid ${CARD_BORDER}`,
        cursor: "pointer", textAlign: "left", fontFamily: FONT,
      }}
    >
      <span style={{
        width: 40, height: 40, borderRadius: 10, background: row.iconBg,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon name={row.icon} size={20} style={{ color: row.iconColor }} />
      </span>
      <span style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>{row.title}</span>
        <span style={{
          fontSize: 13, color: TEXT_MUTED,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {row.subtitle}
        </span>
      </span>
      <Icon name="chevron_right" size={22} style={{ color: TEXT_MUTED, flexShrink: 0 }} />
    </button>
  );
}

// Single white card, three navigation rows (Lessons / Words / New chat).
export default function ActionsCard({ currentLesson, currentWordGroup }) {
  const rows = [
    {
      icon: "menu_book", iconBg: PRIMARY_LIGHT, iconColor: PRIMARY,
      title: "Lessons",
      subtitle: `${currentLesson.name} · ${currentLesson.level}`,
      to: "/lessons",
    },
    {
      icon: "style", iconBg: GREEN_LIGHT, iconColor: GREEN_DARK,
      title: "Words",
      subtitle: `${currentWordGroup.category} · Group ${currentWordGroup.groupNumber}`,
      to: "/words",
    },
    {
      icon: "chat_bubble_outline", iconBg: PRIMARY, iconColor: "#ffffff",
      title: "New chat",
      subtitle: "Free conversation in Swedish",
      to: "/chat",
    },
  ];

  return (
    <div style={{
      background: CARD_BG,
      border: `1px solid ${CARD_BORDER}`,
      borderRadius: CARD_RADIUS,
      overflow: "hidden",
    }}>
      {rows.map((row, i) => (
        <ActionRow key={row.title} row={row} first={i === 0} />
      ))}
    </div>
  );
}
