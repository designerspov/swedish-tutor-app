import { useState } from "react";
import {
  CardPanel, CardLabel, Prompt, BigWord, Hint, TextField,
  PrimaryButton, GhostButton, HintButton, HintLine, verbGroupHint,
} from "./cardKit.jsx";
import FeedbackStrip from "./FeedbackStrip.jsx";
import { matchAnswer } from "../../../utils/answerMatcher.js";

const PROMPT_LABEL = {
  present: "present tense",
  past: "past tense",
  supine: "supine",
  imperative: "imperative",
};

// Single-form drill: one conjugation at a time. The intermediate rung between
// recalling the root word and giving all five forms.
export default function SingleFormCard({ verb, form, onResult }) {
  const [val, setVal] = useState("");
  const [checked, setChecked] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const answer = verb.swedish[form];
  const correct = !gaveUp && matchAnswer(val, answer);

  const check = () => { if (val.trim()) setChecked(true); };
  const giveUp = () => { setGaveUp(true); setChecked(true); };

  return (
    <CardPanel>
      <CardLabel>Verb form</CardLabel>
      <Prompt>Give the <strong>{PROMPT_LABEL[form] || form}</strong> of…</Prompt>
      <BigWord>att {verb.swedish.infinitive}</BigWord>
      <Hint>{verb.english}</Hint>

      <TextField
        value={val} onChange={setVal} onEnter={check}
        placeholder={form === "supine" ? "form..." : "Type the form..."}
        prefix={form === "supine" ? "har" : null}
        disabled={checked}
        status={gaveUp ? null : checked ? (correct ? "correct" : "wrong") : null}
        autoFocus
      />

      {!checked && showHint && <HintLine>{verbGroupHint(verb.verbGroup)}</HintLine>}

      {!checked ? (
        <>
          <PrimaryButton onClick={check} disabled={!val.trim()}>Check</PrimaryButton>
          {!showHint && <HintButton onClick={() => setShowHint(true)} />}
          <GhostButton onClick={giveUp}>I don't know this one</GhostButton>
        </>
      ) : (
        <>
          <FeedbackStrip status={gaveUp ? "learn" : correct ? "correct" : "wrong"}>
            {gaveUp ? (
              <>The {PROMPT_LABEL[form] || form} of {verb.swedish.infinitive} is <strong>{answer}</strong>.</>
            ) : correct ? (
              <>Correct — <strong>{answer}</strong>.</>
            ) : (
              <>You wrote “{val.trim()}” → <strong>{answer}</strong>.</>
            )}
          </FeedbackStrip>
          <PrimaryButton onClick={() => onResult(correct, correct ? [] : [form])}>Next word →</PrimaryButton>
        </>
      )}
    </CardPanel>
  );
}
