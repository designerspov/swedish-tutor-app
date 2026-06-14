// Shared building blocks for the practice cards. Standard HTML inputs only —
// the mobile keyboard provides speech-to-text, so there is no custom mic UI.
import Icon from "../../../Icon.jsx";
import {
  FONT, TEXT, TEXT_MUTED, PRIMARY, PRIMARY_LIGHT,
  CARD_BORDER, CORRECT_FG, CORRECT_BG, WRONG_FG, WRONG_BG,
} from "../../../theme.js";

export function CardLabel({ children }) {
  return (
    <span style={{
      alignSelf: "flex-start",
      fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: 1,
      textTransform: "uppercase", color: PRIMARY,
      background: PRIMARY_LIGHT, borderRadius: 6, padding: "4px 8px",
    }}>
      {children}
    </span>
  );
}

export function Prompt({ children }) {
  return (
    <p style={{ margin: 0, fontFamily: FONT, fontSize: 14, color: TEXT_MUTED, lineHeight: 1.4 }}>
      {children}
    </p>
  );
}

export function BigWord({ children }) {
  return (
    <div style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, color: TEXT, lineHeight: 1.2 }}>
      {children}
    </div>
  );
}

export function Hint({ children }) {
  return (
    <div style={{ fontFamily: FONT, fontSize: 13, color: TEXT_MUTED }}>{children}</div>
  );
}

// status: null | "correct" | "wrong"
export function TextField({ value, onChange, onEnter, placeholder, disabled, status, prefix, autoFocus }) {
  const border =
    status === "correct" ? CORRECT_FG : status === "wrong" ? WRONG_FG : CARD_BORDER;
  const bg =
    status === "correct" ? CORRECT_BG : status === "wrong" ? WRONG_BG : "#fff";
  return (
    <div style={{
      display: "flex", alignItems: "center",
      border: `1.5px solid ${border}`, background: bg, borderRadius: 10,
      padding: "0 12px", height: 48,
    }}>
      {prefix && <span style={{ fontFamily: FONT, fontSize: 16, color: TEXT_MUTED, marginRight: 4 }}>{prefix}</span>}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && onEnter) { e.preventDefault(); onEnter(); } }}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        style={{
          flex: 1, border: "none", outline: "none", background: "transparent",
          fontFamily: FONT, fontSize: 16, color: TEXT, width: "100%",
        }}
      />
    </div>
  );
}

// "Show a hint" trigger — a subtle nudge, doesn't reveal the full answer.
export function HintButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 36, width: "100%", borderRadius: 10, border: "none",
        background: "transparent", color: PRIMARY,
        fontFamily: FONT, fontSize: 13, fontWeight: 600, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      }}
    >
      <Icon name="lightbulb" size={16} style={{ color: PRIMARY }} />
      Show a hint
    </button>
  );
}

// The revealed hint content.
export function HintLine({ children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      background: PRIMARY_LIGHT, color: PRIMARY,
      borderRadius: 10, padding: "8px 10px",
      fontFamily: FONT, fontSize: 13,
    }}>
      <Icon name="lightbulb" size={16} style={{ color: PRIMARY, flexShrink: 0 }} />
      <span>{children}</span>
    </div>
  );
}

// Pick a context sentence to use as an example hint.
//   prefer: return a sentence testing this form if one exists
//   avoid:  skip sentences testing this form (so the hint isn't the answer)
export function pickSentence(verb, { prefer, avoid } = {}) {
  const list = verb.contextSentences || [];
  if (!list.length) return null;
  if (prefer) {
    const m = list.find((s) => s.form === prefer);
    if (m) return m;
  }
  const pool = avoid ? list.filter((s) => s.form !== avoid) : list;
  return (pool.length ? pool : list)[0];
}

// Hint rendered as an example sentence with the target word left BLANK — the
// surrounding context is the clue, not the answer.
export function ExampleHint({ sentence }) {
  if (!sentence) return null;
  const [before, after] = sentence.sentence.split("___");
  return (
    <HintLine>
      {before}
      <span style={{
        display: "inline-block", minWidth: 34, borderBottom: `2px dashed ${PRIMARY}`,
        margin: "0 3px", height: 13, verticalAlign: "middle",
      }} />
      {after}
    </HintLine>
  );
}

// Short pedagogical nudge for a verb's conjugation group.
export function verbGroupHint(n) {
  switch (n) {
    case 1: return "Group 1: regular — ‑ar / ‑ade / ‑at endings.";
    case 2: return "Group 2: ‑er / ‑de (or ‑te) / ‑t endings.";
    case 3: return "Group 3: short verb — ‑r / ‑dde / ‑tt.";
    default: return "Group 4: strong/irregular — the vowel changes (watch the past tense).";
  }
}

// Secondary "give up / I don't know" action.
export function GhostButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 40, width: "100%", borderRadius: 12, border: "none",
        background: "transparent", color: TEXT_MUTED,
        fontFamily: FONT, fontSize: 14, fontWeight: 500, cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        height: 48, width: "100%", borderRadius: 12, border: "none",
        background: PRIMARY, color: "#fff", fontFamily: FONT, fontSize: 15, fontWeight: 600,
        cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

// Wraps a card's content in the standard white panel.
export function CardPanel({ children }) {
  return (
    <div style={{
      background: "#fff", border: `1px solid ${CARD_BORDER}`, borderRadius: 16,
      padding: 20, display: "flex", flexDirection: "column", gap: 16,
    }}>
      {children}
    </div>
  );
}
