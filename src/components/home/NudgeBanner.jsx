import Icon from "../../Icon.jsx";
import { FONT, TEXT, PRIMARY, PRIMARY_LIGHT, CARD_BORDER } from "../../theme.js";
import { remainingWords } from "../../data/situations.js";

// Tinted banner that bridges goals → actions: tells the user what to do next.
// The count + topic are derived from the active situation.
export default function NudgeBanner({ situation }) {
  if (!situation) return null;
  const count = remainingWords(situation);
  if (count <= 0) return null;
  const topic = situation.topic || "new";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      background: PRIMARY_LIGHT,
      border: `1px solid ${CARD_BORDER}`,
      borderRadius: 12,
      padding: 12,
    }}>
      <span style={{
        width: 32, height: 32, borderRadius: 8, background: "#ffffff",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon name="lightbulb" size={18} style={{ color: PRIMARY }} />
      </span>
      <span style={{ fontFamily: FONT, fontSize: 13, lineHeight: "18px", color: TEXT }}>
        Learn <strong style={{ fontWeight: 700 }}>{count} more {topic} words</strong> to unlock the next situation
      </span>
    </div>
  );
}
