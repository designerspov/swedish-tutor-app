import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Icon from "../../Icon.jsx";
import {
  FONT, TEXT, TEXT_MUTED, PRIMARY, PRIMARY_LIGHT,
  CARD_BG, CARD_BORDER, CARD_RADIUS,
} from "../../theme.js";
import { getGroup, wordForms } from "../../data/words.js";

const TYPE_LABEL = { verb: "verb", noun: "noun", adjective: "adjective" };

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function WordsSession() {
  const { group: groupId } = useParams();
  const navigate = useNavigate();
  const group = getGroup(groupId);

  const [queue, setQueue] = useState([]);
  const [revealed, setRevealed] = useState(false);
  const [known, setKnown] = useState(0);
  const [direction, setDirection] = useState("en-sv"); // en-sv: see English, recall Swedish

  const total = group ? group.words.length : 0;

  const reset = useCallback(() => {
    if (!group) return;
    setQueue(shuffle(group.words));
    setRevealed(false);
    setKnown(0);
  }, [group]);

  // (Re)start whenever the group changes.
  useEffect(() => { reset(); }, [reset]);

  if (!group) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <BackButton onClick={() => navigate("/words")} label="Words" />
        <p style={{ fontFamily: FONT, color: TEXT_MUTED }}>That word set doesn’t exist.</p>
      </div>
    );
  }

  const done = queue.length === 0;
  const current = queue[0];

  const gotIt = () => {
    setKnown((k) => k + 1);
    setQueue((q) => q.slice(1));
    setRevealed(false);
  };
  const again = () => {
    // send to the back so it comes round again
    setQueue((q) => (q.length > 1 ? [...q.slice(1), q[0]] : q));
    setRevealed(false);
  };

  const pct = total ? Math.round((known / total) * 100) : 0;

  // Front-of-card prompt and the headword answer depend on direction.
  const promptText = current && (direction === "en-sv" ? current.en : current.headword);
  const answerHead = current && (direction === "en-sv" ? current.headword : current.en);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <BackButton onClick={() => navigate("/words")} label="Words" />
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: FONT, fontSize: 13, color: TEXT_MUTED }}>
          {Math.min(known + 1, total)} / {total}
        </span>
      </div>

      <div>
        <h1 style={{ margin: 0, fontFamily: FONT, fontSize: 20, fontWeight: 700, color: TEXT }}>
          {group.label} · Group {group.number}
        </h1>
        {/* progress */}
        <div style={{ height: 6, borderRadius: 3, background: "rgba(0,0,0,0.06)", overflow: "hidden", marginTop: 10 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: PRIMARY, transition: "width 0.2s" }} />
        </div>
      </div>

      {/* direction toggle */}
      <div style={{ display: "flex", border: `1px solid ${CARD_BORDER}`, borderRadius: 10, padding: 2, gap: 2, background: CARD_BG }}>
        {[
          { key: "en-sv", label: "English → Svenska" },
          { key: "sv-en", label: "Svenska → English" },
        ].map((opt) => {
          const active = direction === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => { setDirection(opt.key); setRevealed(false); }}
              style={{
                flex: 1, height: 32, border: "none", borderRadius: 8,
                background: active ? PRIMARY : "transparent",
                color: active ? "#fff" : TEXT,
                fontFamily: FONT, fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {done ? (
        <CompleteCard known={known} total={total} onAgain={reset} onExit={() => navigate("/words")} />
      ) : (
        <>
          {/* flashcard */}
          <div
            onClick={() => !revealed && setRevealed(true)}
            style={{
              background: CARD_BG,
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: CARD_RADIUS,
              padding: 24,
              minHeight: 220,
              display: "flex", flexDirection: "column",
              cursor: revealed ? "default" : "pointer",
            }}
          >
            <span style={{
              alignSelf: "flex-start",
              fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: 1,
              textTransform: "uppercase", color: PRIMARY,
              background: PRIMARY_LIGHT, borderRadius: 6, padding: "3px 8px",
            }}>
              {TYPE_LABEL[current.type]}
            </span>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 6, padding: "12px 0" }}>
              <span style={{ fontFamily: FONT, fontSize: 26, fontWeight: 700, color: TEXT, textAlign: "center" }}>
                {promptText}
              </span>
              {!revealed && (
                <span style={{ fontFamily: FONT, fontSize: 13, color: TEXT_MUTED }}>
                  Tap to reveal
                </span>
              )}
            </div>

            {revealed && (
              <div style={{ borderTop: `1px solid ${CARD_BORDER}`, paddingTop: 14, display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: PRIMARY }}>
                  {answerHead}
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                  {wordForms(current).map(([label, value]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <span style={{ fontFamily: FONT, fontSize: 12, color: TEXT_MUTED }}>{label}</span>
                      <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 500, color: TEXT, textAlign: "right" }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* actions */}
          {revealed ? (
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={again} style={btn(false)}>
                <Icon name="replay" size={18} style={{ color: PRIMARY }} />
                Again
              </button>
              <button onClick={gotIt} style={btn(true)}>
                <Icon name="check" size={18} style={{ color: "#fff" }} />
                Got it
              </button>
            </div>
          ) : (
            <button onClick={() => setRevealed(true)} style={btn(true)}>
              Show answer
            </button>
          )}
        </>
      )}
    </div>
  );
}

function btn(primary) {
  return {
    flex: 1, height: 48, borderRadius: 12,
    border: primary ? "none" : `1px solid ${CARD_BORDER}`,
    background: primary ? PRIMARY : CARD_BG,
    color: primary ? "#fff" : PRIMARY,
    fontFamily: FONT, fontSize: 15, fontWeight: 600, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    width: "100%",
  };
}

function BackButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        background: "transparent", border: "none", cursor: "pointer",
        fontFamily: FONT, fontSize: 14, fontWeight: 500, color: PRIMARY, padding: "4px 0",
      }}
    >
      <Icon name="arrow_back" size={18} style={{ color: PRIMARY }} />
      {label}
    </button>
  );
}

function CompleteCard({ known, total, onAgain, onExit }) {
  return (
    <div style={{
      background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: CARD_RADIUS,
      padding: 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center",
    }}>
      <Icon name="celebration" size={40} style={{ color: PRIMARY }} />
      <span style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: TEXT }}>Nice work!</span>
      <span style={{ fontFamily: FONT, fontSize: 14, color: TEXT_MUTED }}>
        You reviewed all {total} words in this set.
      </span>
      <div style={{ display: "flex", gap: 12, width: "100%", marginTop: 8 }}>
        <button onClick={onExit} style={btn(false)}>Back to words</button>
        <button onClick={onAgain} style={btn(true)}>Practise again</button>
      </div>
    </div>
  );
}
