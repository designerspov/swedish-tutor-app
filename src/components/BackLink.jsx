import { useNavigate } from "react-router-dom";
import Icon from "../Icon.jsx";
import { FONT, PRIMARY } from "../theme.js";

// Shared return-path link used across all Home-reachable screens (Words,
// Lessons, New Chat, Situations). A purple "← Label" text link, left-aligned.
// Pass `onClick` to override the default navigate(to) behaviour.
export default function BackLink({ to = "/", label = "Home", onClick }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={onClick || (() => navigate(to))}
      aria-label={`Back to ${label}`}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4, alignSelf: "flex-start",
        background: "transparent", border: "none", cursor: "pointer",
        fontFamily: FONT, fontSize: 14, fontWeight: 500, color: PRIMARY, padding: "4px 0",
      }}
    >
      <Icon name="arrow_back" size={18} style={{ color: PRIMARY }} />
      {label}
    </button>
  );
}
