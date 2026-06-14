import { Link } from "react-router-dom";
import Icon from "../../Icon.jsx";
import {
  FONT, TEXT, TEXT_MUTED, TEXT_LOCKED, PRIMARY,
  CARD_BG, CARD_BORDER, CARD_RADIUS, STATUS,
} from "../../theme.js";
import { situationMeta } from "../../data/situations.js";

function SituationTile({ situation, situations }) {
  const locked = situation.status === "locked";
  const status = STATUS[situation.status];
  const pct = situation.wordsRequired
    ? Math.round((situation.wordsMastered / situation.wordsRequired) * 100)
    : 0;
  const nameColor = locked ? TEXT_LOCKED : TEXT;
  const metaColor = locked ? TEXT_LOCKED : TEXT_MUTED;

  return (
    <div style={{ background: CARD_BG, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
      {/* status dot + label */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%", background: status.color, flexShrink: 0,
        }} />
        <span style={{
          fontFamily: FONT, fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
          color: status.color,
        }}>
          {status.label}
        </span>
      </div>

      {/* situation name */}
      <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: nameColor }}>
        {situation.name}
      </span>

      {/* meta */}
      <span style={{ fontFamily: FONT, fontSize: 12, color: metaColor }}>
        {situationMeta(situation, situations)}
      </span>

      {/* progress bar */}
      <div style={{ height: 4, borderRadius: 2, background: "rgba(0,0,0,0.06)", overflow: "hidden", marginTop: 2 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: locked ? TEXT_LOCKED : status.color }} />
      </div>
    </div>
  );
}

// White card: lesson-path header + 2-col grid of situation goals, with a
// "See all situations" link below.
export default function GoalsCard({ level, situations }) {
  return (
    <div>
      <div style={{
        background: CARD_BG,
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: CARD_RADIUS,
        overflow: "hidden",
      }}>
        {/* header */}
        <div style={{ padding: 16, borderBottom: `1px solid ${CARD_BORDER}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="menu_book" size={18} style={{ color: PRIMARY }} />
            <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: TEXT }}>
              Lesson path · {level}
            </span>
          </div>
          <div style={{ fontFamily: FONT, fontSize: 12, color: TEXT_MUTED, marginTop: 4 }}>
            Complete situations to advance
          </div>
        </div>

        {/* 2-col grid, 1px internal borders via gap over a tinted background */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1,
          background: CARD_BORDER,
        }}>
          {situations.map((s) => (
            <SituationTile key={s.id} situation={s} situations={situations} />
          ))}
        </div>
      </div>

      {/* below the card */}
      <div style={{ textAlign: "center", marginTop: 12 }}>
        <Link
          to="/situations"
          style={{ fontFamily: FONT, fontSize: 13, fontWeight: 500, color: PRIMARY, textDecoration: "none" }}
        >
          See all situations
        </Link>
      </div>
    </div>
  );
}
