import { useState } from "react";
import { CardPanel, CardLabel, Prompt, BigWord, Hint, TextField, PrimaryButton, GhostButton, HintButton, HintLine } from "./cardKit.jsx";
import FeedbackStrip from "./FeedbackStrip.jsx";
import { matchAnswer } from "../../../utils/answerMatcher.js";

// Card 1: translate the English verb into the Swedish infinitive.
export default function TranslateCard({ verb, onResult }) {
  const [val, setVal] = useState("");
  const [checked, setChecked] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const correct = !gaveUp && matchAnswer(val, verb.swedish.infinitive);
  const inf = verb.swedish.infinitive;

  const check = () => { if (val.trim()) setChecked(true); };
  const giveUp = () => { setGaveUp(true); setChecked(true); };

  return (
    <CardPanel>
      <CardLabel>Translate</CardLabel>
      <Prompt>What is the Swedish word for…</Prompt>
      <BigWord>{verb.english}</BigWord>
      <Hint>verb · infinitive</Hint>

      <TextField
        value={val} onChange={setVal} onEnter={check}
        placeholder="Type in Swedish..." disabled={checked}
        status={gaveUp ? null : checked ? (correct ? "correct" : "wrong") : null}
        autoFocus
      />

      {!checked && showHint && (
        <HintLine>Starts with “{inf[0]}” · {inf.length} letters</HintLine>
      )}

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
              <>The word is <strong>{verb.swedish.infinitive}</strong> ({verb.english}) — Group {verb.verbGroup} verb.</>
            ) : correct ? (
              <>“{verb.swedish.infinitive}” — Group {verb.verbGroup} verb.</>
            ) : (
              <>You wrote “{val.trim()}” → <strong>{verb.swedish.infinitive}</strong>. Group {verb.verbGroup} verb.</>
            )}
          </FeedbackStrip>
          <PrimaryButton onClick={() => onResult(correct)}>Next word →</PrimaryButton>
        </>
      )}
    </CardPanel>
  );
}
