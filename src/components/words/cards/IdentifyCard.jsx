import { useState, useMemo } from "react";
import { CardPanel, CardLabel, Prompt, BigWord, TextField, PrimaryButton, GhostButton, HintButton, HintLine } from "./cardKit.jsx";
import FeedbackStrip from "./FeedbackStrip.jsx";
import FormsBreakdown from "./FormsBreakdown.jsx";
import { FONT, TEXT_MUTED } from "../../../theme.js";
import { matchAnswer, matchForm } from "../../../utils/answerMatcher.js";

const CANDIDATE_FORMS = ["present", "past", "supine", "imperative"];

// Card 4: shown a conjugated form, identify the infinitive + the form name.
export default function IdentifyCard({ verb, onResult }) {
  const shownForm = useMemo(() => {
    const opts = CANDIDATE_FORMS.filter((f) => verb.swedish[f] && verb.swedish[f] !== "—");
    return opts[Math.floor(Math.random() * opts.length)] || "present";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verb.id]);

  const shownWord = verb.swedish[shownForm];
  const [verbVal, setVerbVal] = useState("");
  const [formVal, setFormVal] = useState("");
  const [checked, setChecked] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const verbOk = matchAnswer(verbVal, verb.swedish.infinitive);
  const formOk = matchForm(formVal, shownForm);
  const correct = !gaveUp && verbOk && formOk;

  const check = () => { if (verbVal.trim() && formVal.trim()) setChecked(true); };
  const giveUp = () => { setGaveUp(true); setChecked(true); };

  return (
    <CardPanel>
      <CardLabel>Identify the form</CardLabel>
      <Prompt>What verb is this, and what form?</Prompt>
      <BigWord>{shownWord}</BigWord>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 56, flexShrink: 0, fontFamily: FONT, fontSize: 13, color: TEXT_MUTED }}>Verb</span>
          <div style={{ flex: 1 }}>
            <TextField value={verbVal} onChange={setVerbVal} placeholder="infinitive..."
              disabled={checked} status={gaveUp ? null : checked ? (verbOk ? "correct" : "wrong") : null} autoFocus />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 56, flexShrink: 0, fontFamily: FONT, fontSize: 13, color: TEXT_MUTED }}>Form</span>
          <div style={{ flex: 1 }}>
            <TextField value={formVal} onChange={setFormVal} onEnter={check} placeholder="present / past / …"
              disabled={checked} status={gaveUp ? null : checked ? (formOk ? "correct" : "wrong") : null} />
          </div>
        </div>
      </div>

      {!checked && showHint && (
        <HintLine>Group {verb.verbGroup} verb · infinitive starts with “{verb.swedish.infinitive[0]}”</HintLine>
      )}

      {!checked ? (
        <>
          <PrimaryButton onClick={check} disabled={!verbVal.trim() || !formVal.trim()}>Check</PrimaryButton>
          {!showHint && <HintButton onClick={() => setShowHint(true)} />}
          <GhostButton onClick={giveUp}>I don't know this one</GhostButton>
        </>
      ) : (
        <>
          <FeedbackStrip status={gaveUp ? "learn" : correct ? "correct" : "wrong"}>
            {correct ? (
              <>Correct — <strong>{shownWord}</strong> is the {shownForm} of <strong>{verb.swedish.infinitive}</strong>.</>
            ) : (
              <><strong>{shownWord}</strong> is the {shownForm} of <strong>{verb.swedish.infinitive}</strong>.</>
            )}
          </FeedbackStrip>
          {!correct && <FormsBreakdown verb={verb} answerForm={shownForm} userInput={verbVal} />}
          <PrimaryButton onClick={() => onResult(correct, correct ? [] : [shownForm])}>Next word →</PrimaryButton>
        </>
      )}
    </CardPanel>
  );
}
