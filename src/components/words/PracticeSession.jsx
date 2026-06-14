import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import Icon from "../../Icon.jsx";
import { FONT, TEXT, TEXT_MUTED, PRIMARY } from "../../theme.js";
import { usePracticeSession } from "../../hooks/usePracticeSession.js";
import { setLastSession } from "../../utils/sessionHandoff.js";
import ProgressDots from "./cards/ProgressDots.jsx";
import TranslateCard from "./cards/TranslateCard.jsx";
import SingleFormCard from "./cards/SingleFormCard.jsx";
import VerbFormsCard from "./cards/VerbFormsCard.jsx";
import ContextCard from "./cards/ContextCard.jsx";
import IdentifyCard from "./cards/IdentifyCard.jsx";

export default function PracticeSession() {
  const { groupId } = useParams();
  const [params] = useSearchParams();
  const mode = params.get("mode") === "review" ? "review" : "learn";
  const navigate = useNavigate();

  const { groupDef, current, currentVerb, dots, progress, isComplete, isEmpty, submit, finalize } =
    usePracticeSession(groupId, mode);

  const [answered, setAnswered] = useState(0);
  const navigatedRef = useRef(false);

  // On completion, persist + hand off to the summary screen.
  useEffect(() => {
    if (isComplete && !navigatedRef.current) {
      navigatedRef.current = true;
      const payload = finalize();
      if (payload) setLastSession(payload);
      navigate(`/words/${groupId}/summary`, { replace: true });
    }
  }, [isComplete, finalize, groupId, navigate]);

  if (isEmpty) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <p style={{ fontFamily: FONT, color: TEXT_MUTED }}>
          Nothing to practise here right now.
        </p>
        <button onClick={() => navigate(`/words/${groupId}`)} style={linkBtn}>← Back to group</button>
      </div>
    );
  }

  if (!current) return null; // completing → effect navigates away

  const handleResult = (correct, weakForms) => {
    submit(correct, weakForms);
    setAnswered((a) => a + 1);
  };

  const exit = () => {
    if (window.confirm("Exit session? Your progress is saved.")) {
      finalize();
      navigate(`/words/${groupId}`);
    }
  };

  const cardKey = `${current.verbId}-${answered}`;
  const cardProps = { verb: currentVerb, onResult: handleResult };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={exit} aria-label="Exit session" style={{
          background: "transparent", border: "none", cursor: "pointer", padding: 4, marginLeft: -4,
          display: "flex", alignItems: "center",
        }}>
          <Icon name="close" size={24} style={{ color: TEXT }} />
        </button>
        <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: TEXT }}>
          {groupDef?.name} · {progress.current} of {progress.total}
        </span>
      </div>

      <ProgressDots dots={dots} />

      {current.card === "translate" && <TranslateCard key={cardKey} {...cardProps} />}
      {current.card === "form" && <SingleFormCard key={cardKey} {...cardProps} form={current.form} />}
      {current.card === "verbforms" && <VerbFormsCard key={cardKey} {...cardProps} blankForms={current.blankForms} />}
      {current.card === "context" && <ContextCard key={cardKey} {...cardProps} />}
      {current.card === "identify" && <IdentifyCard key={cardKey} {...cardProps} />}
    </div>
  );
}

const linkBtn = {
  background: "transparent", border: "none", cursor: "pointer",
  fontFamily: FONT, fontSize: 14, fontWeight: 500, color: PRIMARY,
  alignSelf: "flex-start", padding: "4px 0",
};
