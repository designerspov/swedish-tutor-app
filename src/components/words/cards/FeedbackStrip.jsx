import Icon from "../../../Icon.jsx";
import {
  FONT, CORRECT_FG, CORRECT_BG, WRONG_FG, WRONG_BG, NEW_FG, NEW_BG,
} from "../../../theme.js";

// status: "correct" | "wrong" | "learn"
// "learn" is used when the user tapped "I don't know" — informational styling,
// but the card still scores the answer as incorrect.
const STYLES = {
  correct: { fg: CORRECT_FG, bg: CORRECT_BG, icon: "check_circle" },
  wrong: { fg: WRONG_FG, bg: WRONG_BG, icon: "cancel" },
  learn: { fg: NEW_FG, bg: NEW_BG, icon: "school" },
};

export default function FeedbackStrip({ status, children }) {
  const s = STYLES[status] || STYLES.wrong;
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 8,
      background: s.bg, color: s.fg,
      borderRadius: 12, padding: 12,
      fontFamily: FONT, fontSize: 13, lineHeight: 1.45,
    }}>
      <Icon name={s.icon} size={18} style={{ color: s.fg, flexShrink: 0, marginTop: 1 }} />
      <div>{children}</div>
    </div>
  );
}
