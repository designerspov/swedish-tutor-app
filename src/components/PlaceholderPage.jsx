import { useNavigate } from "react-router-dom";
import Icon from "../Icon.jsx";
import { FONT, TEXT, TEXT_MUTED, PRIMARY, CARD_BG, CARD_BORDER, CARD_RADIUS } from "../theme.js";

// Simple placeholder for pages we'll build out in follow-up specs: page name +
// back button. Lives inside the AppShell, so the bottom nav is still present.
export default function PlaceholderPage({ title, note }) {
  const navigate = useNavigate();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 4, alignSelf: "flex-start",
          background: "transparent", border: "none", cursor: "pointer",
          fontFamily: FONT, fontSize: 14, fontWeight: 500, color: PRIMARY, padding: "4px 0",
        }}
      >
        <Icon name="arrow_back" size={18} style={{ color: PRIMARY }} />
        Back
      </button>

      <div style={{
        background: CARD_BG,
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: CARD_RADIUS,
        padding: 24,
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <h1 style={{ margin: 0, fontFamily: FONT, fontSize: 20, fontWeight: 700, color: TEXT }}>
          {title}
        </h1>
        <p style={{ margin: 0, fontFamily: FONT, fontSize: 14, color: TEXT_MUTED }}>
          {note || "Coming soon."}
        </p>
      </div>
    </div>
  );
}
