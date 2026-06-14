import { useNavigate } from "react-router-dom";
import Icon from "../../Icon.jsx";
import {
  FONT, TEXT, TEXT_MUTED, PRIMARY, PRIMARY_LIGHT,
  GREEN_LIGHT, GREEN_DARK, CARD_BG, CARD_BORDER, CARD_RADIUS,
} from "../../theme.js";
import { CATEGORIES } from "../../data/words.js";

// Per-category icon tint, reusing the palette.
const TINTS = {
  verb: { bg: PRIMARY_LIGHT, fg: PRIMARY },
  noun: { bg: GREEN_LIGHT, fg: GREEN_DARK },
  adjective: { bg: "#FDEEDD", fg: "#B5651D" },
};

function CategoryCard({ category }) {
  const navigate = useNavigate();
  const tint = TINTS[category.type];
  return (
    <div style={{
      background: CARD_BG,
      border: `1px solid ${CARD_BORDER}`,
      borderRadius: CARD_RADIUS,
      overflow: "hidden",
    }}>
      {/* header */}
      <div style={{ padding: 16, borderBottom: `1px solid ${CARD_BORDER}`, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{
          width: 40, height: 40, borderRadius: 10, background: tint.bg,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Icon name={category.icon} size={22} style={{ color: tint.fg }} />
        </span>
        <span style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: TEXT }}>
            {category.label}
          </span>
          <span style={{ fontFamily: FONT, fontSize: 12, color: TEXT_MUTED }}>
            {category.blurb}
          </span>
        </span>
      </div>

      {/* group rows */}
      {category.groups.map((g, i) => (
        <button
          key={g.id}
          onClick={() => navigate(`/words/${g.id}`)}
          style={{
            display: "flex", alignItems: "center", gap: 12, width: "100%",
            padding: 14, background: "transparent", border: "none",
            borderTop: i === 0 ? "none" : `1px solid ${CARD_BORDER}`,
            cursor: "pointer", textAlign: "left", fontFamily: FONT,
          }}
        >
          <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: TEXT }}>
            Group {g.number}
          </span>
          <span style={{ fontSize: 13, color: TEXT_MUTED }}>{g.words.length} words</span>
          <Icon name="chevron_right" size={22} style={{ color: TEXT_MUTED }} />
        </button>
      ))}
    </div>
  );
}

// Word practice hub: choose a word type, then a 50-word group to drill.
export default function WordsHub() {
  const navigate = useNavigate();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <button
        onClick={() => navigate("/")}
        style={{
          display: "inline-flex", alignItems: "center", gap: 4, alignSelf: "flex-start",
          background: "transparent", border: "none", cursor: "pointer",
          fontFamily: FONT, fontSize: 14, fontWeight: 500, color: PRIMARY, padding: "4px 0",
        }}
      >
        <Icon name="arrow_back" size={18} style={{ color: PRIMARY }} />
        Home
      </button>

      <div>
        <h1 style={{ margin: 0, fontFamily: FONT, fontSize: 22, fontWeight: 700, color: TEXT }}>
          Words
        </h1>
        <p style={{ margin: "4px 0 0", fontFamily: FONT, fontSize: 14, color: TEXT_MUTED }}>
          Pick a set and practise the forms as flashcards.
        </p>
      </div>

      {CATEGORIES.map((c) => (
        <CategoryCard key={c.type} category={c} />
      ))}
    </div>
  );
}
