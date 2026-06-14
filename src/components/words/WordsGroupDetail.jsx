import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Icon from "../../Icon.jsx";
import BackLink from "../BackLink.jsx";
import {
  FONT, TEXT, TEXT_MUTED, PRIMARY, PRIMARY_LIGHT,
  CARD_BG, CARD_BORDER, CARD_RADIUS, CORRECT_FG, NEW_FG, NEW_BG,
} from "../../theme.js";
import { getGroupDef } from "../../data/wordGroups.js";
import { getVerbs } from "../../data/verbs/index.js";
import { loadWordProgress } from "../../utils/progressStore.js";

const PREVIEW_COUNT = 6;

function ModeCard({ icon, iconBg, iconFg, title, subtitle, onClick, disabled }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%",
        padding: 16, background: CARD_BG,
        border: `1px solid ${CARD_BORDER}`, borderRadius: CARD_RADIUS,
        cursor: disabled ? "default" : "pointer", textAlign: "left",
        fontFamily: FONT, opacity: disabled ? 0.6 : 1,
      }}
    >
      <span style={{
        width: 44, height: 44, borderRadius: 12, background: iconBg, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name={icon} size={22} style={{ color: iconFg }} />
      </span>
      <span style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{title}</span>
        <span style={{ fontSize: 13, color: TEXT_MUTED }}>{subtitle}</span>
      </span>
      {!disabled && <Icon name="chevron_right" size={22} style={{ color: TEXT_MUTED, flexShrink: 0 }} />}
    </button>
  );
}

export default function WordsGroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  const group = getGroupDef(groupId);
  if (!group || !group.seeded) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <BackLink to="/words" label="Words" />
        <p style={{ fontFamily: FONT, color: TEXT_MUTED }}>This group isn’t available yet.</p>
      </div>
    );
  }

  const wordProg = loadWordProgress();
  const verbs = getVerbs(group.words);
  const seen = verbs.filter((v) => wordProg[v.id]?.seen);
  const mastered = verbs.filter((v) => wordProg[v.id]?.mastered);
  const unseen = verbs.filter((v) => !wordProg[v.id]?.seen);

  const allIntroduced = unseen.length === 0;
  const hasSeen = seen.length > 0;

  const shown = showAll ? verbs : verbs.slice(0, PREVIEW_COUNT);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <BackLink to="/words" label="Words" />

      <div>
        <h1 style={{ margin: 0, fontFamily: FONT, fontSize: 22, fontWeight: 700, color: TEXT }}>
          {group.name} · G{group.number}
        </h1>
        <p style={{ margin: "4px 0 0", fontFamily: FONT, fontSize: 14, color: TEXT_MUTED }}>
          {mastered.length} of {verbs.length} verbs mastered
        </p>
      </div>

      {/* mode selection */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <ModeCard
          icon="refresh" iconBg={PRIMARY_LIGHT} iconFg={PRIMARY}
          title="Review learned words"
          subtitle={hasSeen
            ? `${seen.length} word${seen.length === 1 ? "" : "s"} you've practiced before`
            : "Nothing to review yet — learn some first"}
          disabled={!hasSeen}
          onClick={() => navigate(`/words/${groupId}/session?mode=review`)}
        />
        <ModeCard
          icon="auto_awesome" iconBg={NEW_BG} iconFg={NEW_FG}
          title="Learn new words"
          subtitle={allIntroduced
            ? "All words introduced — review to master them"
            : `${unseen.length} word${unseen.length === 1 ? "" : "s"} remaining`}
          disabled={allIntroduced}
          onClick={() => navigate(`/words/${groupId}/session?mode=learn`)}
        />
      </div>

      {/* word list preview */}
      <div>
        <div style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, letterSpacing: 0.3, color: TEXT_MUTED, textTransform: "uppercase", marginBottom: 8 }}>
          Words in this group
        </div>
        <div style={{
          background: CARD_BG, border: `1px solid ${CARD_BORDER}`,
          borderRadius: CARD_RADIUS, overflow: "hidden",
        }}>
          {shown.map((v, i) => {
            const p = wordProg[v.id];
            return (
              <div key={v.id} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "11px 14px",
                borderTop: i === 0 ? "none" : `1px solid ${CARD_BORDER}`,
              }}>
                <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: TEXT }}>
                  {v.swedish.infinitive}
                </span>
                <span style={{ fontFamily: FONT, fontSize: 13, color: TEXT_MUTED, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {v.english}
                </span>
                {p?.mastered ? (
                  <Icon name="check_circle" size={16} style={{ color: CORRECT_FG, flexShrink: 0 }} />
                ) : !p?.seen ? (
                  <span style={{
                    flexShrink: 0, fontSize: 10, fontWeight: 700, letterSpacing: 0.3,
                    color: NEW_FG, background: NEW_BG, borderRadius: 5, padding: "2px 6px",
                  }}>NEW</span>
                ) : null}
              </div>
            );
          })}
        </div>
        {verbs.length > PREVIEW_COUNT && (
          <button
            onClick={() => setShowAll((s) => !s)}
            style={{
              marginTop: 10, background: "transparent", border: "none", cursor: "pointer",
              fontFamily: FONT, fontSize: 13, fontWeight: 500, color: PRIMARY, padding: "4px 0",
              display: "block", width: "100%", textAlign: "center",
            }}
          >
            {showAll ? "Show less" : `See all ${verbs.length} words`}
          </button>
        )}
      </div>
    </div>
  );
}
