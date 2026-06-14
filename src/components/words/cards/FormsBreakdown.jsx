import {
  FONT, TEXT, TEXT_MUTED, CARD_BORDER,
  CORRECT_FG, CORRECT_BG, NEW_FG, NEW_BG,
} from "../../../theme.js";
import { normalize } from "../../../utils/answerMatcher.js";
import { FORM_ORDER, FORM_LABELS } from "../../../data/verbs/index.js";

function Chip({ label, fg, bg }) {
  return (
    <span style={{
      flexShrink: 0, fontFamily: FONT, fontSize: 10, fontWeight: 700,
      letterSpacing: 0.3, color: fg, background: bg, borderRadius: 5, padding: "2px 6px",
    }}>
      {label}
    </span>
  );
}

// Shown after a wrong / "I don't know" answer: the full conjugation table, with
// the correct answer highlighted and — if what the user typed is actually a
// different valid form — that form flagged too, so they see how it fits.
export default function FormsBreakdown({ verb, answerForm, userInput }) {
  const forms = FORM_ORDER.filter((f) => verb.swedish[f] && verb.swedish[f] !== "—");
  const typed = normalize(userInput || "");
  const yourForm = typed ? forms.find((f) => normalize(verb.swedish[f]) === typed) : null;

  const display = (f) =>
    f === "infinitive" ? `att ${verb.swedish[f]}`
      : f === "supine" ? `har ${verb.swedish[f]}`
      : verb.swedish[f];

  return (
    <div style={{ border: `1px solid ${CARD_BORDER}`, borderRadius: 12, overflow: "hidden" }}>
      <div style={{
        padding: "8px 12px", fontFamily: FONT, fontSize: 11, fontWeight: 700,
        letterSpacing: 0.4, textTransform: "uppercase", color: TEXT_MUTED,
        borderBottom: `1px solid ${CARD_BORDER}`,
      }}>
        All forms of {verb.swedish.infinitive} — {verb.english}
      </div>
      {forms.map((f, i) => {
        const isAnswer = f === answerForm;
        const isYours = !isAnswer && f === yourForm;
        const bg = isAnswer ? CORRECT_BG : isYours ? NEW_BG : "transparent";
        const fg = isAnswer ? CORRECT_FG : isYours ? NEW_FG : TEXT;
        return (
          <div key={f} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "9px 12px",
            background: bg, borderTop: i ? `1px solid ${CARD_BORDER}` : "none",
          }}>
            <span style={{ width: 84, flexShrink: 0, fontFamily: FONT, fontSize: 12, color: isAnswer || isYours ? fg : TEXT_MUTED }}>
              {FORM_LABELS[f]}
            </span>
            <span style={{ flex: 1, fontFamily: FONT, fontSize: 14, fontWeight: 600, color: fg }}>
              {display(f)}
            </span>
            {isAnswer && <Chip label="answer" fg={CORRECT_FG} bg="#fff" />}
            {isYours && <Chip label="you wrote this" fg={NEW_FG} bg="#fff" />}
          </div>
        );
      })}
    </div>
  );
}
