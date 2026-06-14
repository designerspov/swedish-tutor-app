import { useParams, useNavigate } from "react-router-dom";
import Icon from "../../Icon.jsx";
import {
  FONT, TEXT, TEXT_MUTED, PRIMARY,
  CARD_BG, CARD_BORDER, CARD_RADIUS, CORRECT_FG, WRONG_FG, WRONG_BG,
} from "../../theme.js";
import { getLastSession } from "../../utils/sessionHandoff.js";

function StatRow({ label, value, last }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "12px 0", borderBottom: last ? "none" : `1px solid ${CARD_BORDER}`,
    }}>
      <span style={{ fontFamily: FONT, fontSize: 14, color: TEXT_MUTED }}>{label}</span>
      <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: TEXT }}>{value}</span>
    </div>
  );
}

export default function SessionSummary() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const data = getLastSession();

  if (!data || data.groupId !== groupId) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <p style={{ fontFamily: FONT, color: TEXT_MUTED }}>No recent session to show.</p>
        <button onClick={() => navigate(`/words/${groupId}`)} style={primaryBtn}>Back to group</button>
      </div>
    );
  }

  const { groupName, mode, score, wrongWords, beforePct, afterPct, newlyLearned } = data;
  const modeLabel = mode === "learn" ? "Learn new" : "Review";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 8 }}>
      {/* header */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" }}>
        <Icon name="check_circle" size={48} style={{ color: CORRECT_FG }} />
        <h1 style={{ margin: 0, fontFamily: FONT, fontSize: 24, fontWeight: 700, color: TEXT }}>Nice work!</h1>
        <span style={{ fontFamily: FONT, fontSize: 14, color: TEXT_MUTED }}>{groupName} · {modeLabel}</span>
      </div>

      {/* stats */}
      <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: CARD_RADIUS, padding: "4px 16px" }}>
        <StatRow label="Words practiced" value={score.total} />
        <StatRow label="Correct on first try" value={`${score.firstTry} / ${score.total}`} />
        <StatRow label="Session accuracy" value={`${score.accuracy}%`} />
        <StatRow
          label="Group progress"
          value={`${beforePct}% → ${afterPct}%`}
          last={mode !== "learn"}
        />
        {mode === "learn" && <StatRow label="New words learned" value={newlyLearned} last />}
      </div>

      {/* words to revisit */}
      {wrongWords.length > 0 && (
        <div style={{ background: WRONG_BG, border: `1px solid ${WRONG_BG}`, borderRadius: CARD_RADIUS, padding: 16 }}>
          <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: WRONG_FG, marginBottom: 4 }}>
            Words to revisit
          </div>
          <div style={{ fontFamily: FONT, fontSize: 14, color: WRONG_FG }}>
            {wrongWords.join(", ")}
          </div>
        </div>
      )}

      {/* actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={() => navigate(`/words/${groupId}`)} style={primaryBtn}>Practice again</button>
        <button onClick={() => navigate("/words")} style={secondaryBtn}>Back to words</button>
      </div>
    </div>
  );
}

const primaryBtn = {
  height: 48, width: "100%", borderRadius: 12, border: "none",
  background: PRIMARY, color: "#fff", fontFamily: FONT, fontSize: 15, fontWeight: 600, cursor: "pointer",
};
const secondaryBtn = {
  height: 48, width: "100%", borderRadius: 12, border: `1px solid ${CARD_BORDER}`,
  background: CARD_BG, color: PRIMARY, fontFamily: FONT, fontSize: 15, fontWeight: 600, cursor: "pointer",
};
