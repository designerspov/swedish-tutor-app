import { useNavigate } from "react-router-dom";
import Icon from "../../Icon.jsx";
import BackLink from "../BackLink.jsx";
import {
  FONT, TEXT, TEXT_MUTED, TEXT_LOCKED, PRIMARY, PRIMARY_LIGHT,
  CARD_BG, CARD_BORDER, CARD_RADIUS, CORRECT_FG,
} from "../../theme.js";
import { getGroupsView, getOverallStats } from "../../utils/progressStore.js";

const CATEGORIES = [
  { key: "verbs", label: "Verbs", active: true },
  { key: "nouns", label: "Nouns", active: false },
  { key: "adjectives", label: "Adjectives", active: false },
];

function CategoryPills() {
  return (
    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
      {CATEGORIES.map((c) => (
        <span
          key={c.key}
          style={{
            flexShrink: 0,
            display: "inline-flex", alignItems: "center", gap: 6,
            height: 32, padding: "0 14px", borderRadius: 16,
            fontFamily: FONT, fontSize: 13, fontWeight: 600,
            background: c.active ? PRIMARY : "transparent",
            color: c.active ? "#fff" : TEXT_LOCKED,
            border: c.active ? "none" : `1px solid ${CARD_BORDER}`,
            cursor: c.active ? "default" : "not-allowed",
          }}
        >
          {c.label}
          {!c.active && (
            <span style={{ fontSize: 10, fontWeight: 500, opacity: 0.8 }}>soon</span>
          )}
        </span>
      ))}
    </div>
  );
}

function GroupBadge({ number, state }) {
  const base = {
    width: 34, height: 26, borderRadius: 7, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: FONT, fontSize: 12, fontWeight: 700,
  };
  const styles = {
    mastered: { ...base, background: PRIMARY, color: "#fff" },
    in_progress: { ...base, background: "transparent", color: PRIMARY, border: `1.5px dashed ${PRIMARY}` },
    unlocked: { ...base, background: "transparent", color: TEXT_MUTED, border: `1px solid ${CARD_BORDER}` },
    locked: { ...base, background: "#EDEDF2", color: TEXT_LOCKED },
  };
  return <span style={styles[state] || styles.locked}>G{number}</span>;
}

function GroupRow({ group, first }) {
  const navigate = useNavigate();
  const { state, stats, number, name, unlocked } = group;
  const interactive = unlocked;

  const right = () => {
    if (state === "locked") return <Icon name="lock" size={18} style={{ color: TEXT_LOCKED }} />;
    if (state === "unlocked") return (
      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: PRIMARY }}>Start</span>
        <Icon name="chevron_right" size={20} style={{ color: TEXT_MUTED }} />
      </span>
    );
    // mastered / in_progress show accuracy
    const pctColor = state === "mastered" ? CORRECT_FG : TEXT_MUTED;
    return (
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {state === "mastered" && <Icon name="check_circle" size={16} style={{ color: CORRECT_FG }} />}
        <span style={{ fontSize: 13, fontWeight: 600, color: pctColor }}>{stats.overallAccuracy}%</span>
        <Icon name="chevron_right" size={20} style={{ color: TEXT_MUTED }} />
      </span>
    );
  };

  const nameColor = state === "locked" ? TEXT_LOCKED : TEXT;
  const metaColor = state === "locked" ? TEXT_LOCKED : TEXT_MUTED;

  return (
    <button
      onClick={() => interactive && navigate(`/words/${group.id}`)}
      disabled={!interactive}
      style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%",
        padding: 14, background: "transparent", border: "none",
        borderTop: first ? "none" : `1px solid ${CARD_BORDER}`,
        cursor: interactive ? "pointer" : "default", textAlign: "left", fontFamily: FONT,
      }}
    >
      <GroupBadge number={number} state={state} />
      <span style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: nameColor }}>{name}</span>
        <span style={{ fontSize: 12, color: metaColor }}>
          {state === "locked" ? "Locked" : "25 words"}
        </span>
      </span>
      {right()}
    </button>
  );
}

export default function WordsHub() {
  const groups = getGroupsView();
  const overall = getOverallStats();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <BackLink to="/" label="Home" />

      <div>
        <h1 style={{ margin: 0, fontFamily: FONT, fontSize: 22, fontWeight: 700, color: TEXT }}>
          Words
        </h1>
        <p style={{ margin: "4px 0 0", fontFamily: FONT, fontSize: 14, color: TEXT_MUTED }}>
          {overall.learned} of {overall.total.toLocaleString()} verbs learned
        </p>
      </div>

      {/* overall progress bar */}
      <div>
        <div style={{ height: 8, borderRadius: 4, background: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${overall.pct}%`, background: PRIMARY }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontFamily: FONT, fontSize: 12, color: TEXT_MUTED }}>
            {overall.learned} / {overall.total.toLocaleString()}
          </span>
          <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: PRIMARY }}>
            {overall.pct}%
          </span>
        </div>
      </div>

      <CategoryPills />

      {/* group list */}
      <div style={{
        background: CARD_BG, border: `1px solid ${CARD_BORDER}`,
        borderRadius: CARD_RADIUS, overflow: "hidden",
      }}>
        {groups.map((g, i) => (
          <GroupRow key={g.id} group={g} first={i === 0} />
        ))}
      </div>
    </div>
  );
}
