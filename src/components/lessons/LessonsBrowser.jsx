import { useNavigate } from "react-router-dom";
import Icon from "../../Icon.jsx";
import BackLink from "../BackLink.jsx";
import {
  FONT, TEXT, TEXT_MUTED, PRIMARY, PRIMARY_LIGHT,
  CARD_BG, CARD_BORDER, CARD_RADIUS,
} from "../../theme.js";
import { CURRICULUM } from "../../curriculum.js";

// Group lessons by CEFR level, preserving curriculum order.
function lessonsByLevel() {
  const groups = [];
  const seen = {};
  for (const l of CURRICULUM) {
    if (!(l.level in seen)) {
      seen[l.level] = groups.length;
      groups.push({ level: l.level, lessons: [] });
    }
    groups[seen[l.level]].lessons.push(l);
  }
  return groups;
}

function LevelCard({ level, lessons }) {
  const navigate = useNavigate();
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
          width: 40, height: 40, borderRadius: 10, background: PRIMARY_LIGHT,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          fontFamily: FONT, fontWeight: 700, fontSize: 14, color: PRIMARY,
        }}>
          {level}
        </span>
        <span style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: TEXT }}>
            Level {level}
          </span>
          <span style={{ fontFamily: FONT, fontSize: 12, color: TEXT_MUTED }}>
            {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
          </span>
        </span>
      </div>

      {/* lesson rows */}
      {lessons.map((l, i) => (
        <button
          key={l.id}
          onClick={() => navigate(`/lessons/${l.id}`)}
          style={{
            display: "flex", alignItems: "center", gap: 12, width: "100%",
            padding: 14, background: "transparent", border: "none",
            borderTop: i === 0 ? "none" : `1px solid ${CARD_BORDER}`,
            cursor: "pointer", textAlign: "left", fontFamily: FONT,
          }}
        >
          <span style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>{l.title}</span>
            <span style={{
              fontSize: 13, color: TEXT_MUTED,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {l.theme}
            </span>
          </span>
          <Icon name="chevron_right" size={22} style={{ color: TEXT_MUTED, flexShrink: 0 }} />
        </button>
      ))}
    </div>
  );
}

// Lessons hub: choose a lesson to start in a conversation. Mirrors the Words hub.
export default function LessonsBrowser() {
  const levels = lessonsByLevel();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <BackLink to="/" label="Home" />

      <div>
        <h1 style={{ margin: 0, fontFamily: FONT, fontSize: 22, fontWeight: 700, color: TEXT }}>
          Lessons
        </h1>
        <p style={{ margin: "4px 0 0", fontFamily: FONT, fontSize: 14, color: TEXT_MUTED }}>
          Choose a situation to practise in conversation.
        </p>
      </div>

      {levels.map((g) => (
        <LevelCard key={g.level} level={g.level} lessons={g.lessons} />
      ))}
    </div>
  );
}
