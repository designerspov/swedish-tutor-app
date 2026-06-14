import { useState, useMemo } from "react";
import { CardPanel, CardLabel, Prompt, Hint, TextField, PrimaryButton, GhostButton, HintButton, HintLine } from "./cardKit.jsx";
import FeedbackStrip from "./FeedbackStrip.jsx";
import { FONT, TEXT, PRIMARY } from "../../../theme.js";
import { matchAnswer } from "../../../utils/answerMatcher.js";

// Renders a sentence with its "___" blank styled.
function SentenceWithBlank({ sentence }) {
  const parts = sentence.split("___");
  return (
    <div style={{ fontFamily: FONT, fontSize: 18, color: TEXT, lineHeight: 1.6 }}>
      {parts[0]}
      <span style={{
        display: "inline-block", minWidth: 56, borderBottom: `2px dashed ${PRIMARY}`,
        margin: "0 4px", verticalAlign: "middle", height: 18,
      }} />
      {parts[1]}
    </div>
  );
}

// Card 3: fill in the blank with the correct form in a real sentence.
export default function ContextCard({ verb, onResult }) {
  const sentence = useMemo(() => {
    const list = verb.contextSentences || [];
    if (!list.length) return null;
    return list[Math.floor(Math.random() * list.length)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verb.id]);

  const [val, setVal] = useState("");
  const [checked, setChecked] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Defensive: if a verb somehow has no sentences, fall back to a pass.
  if (!sentence) {
    return (
      <CardPanel>
        <CardLabel>Fill in the blank</CardLabel>
        <Prompt>No sentence available for {verb.swedish.infinitive}.</Prompt>
        <PrimaryButton onClick={() => onResult(true)}>Next word →</PrimaryButton>
      </CardPanel>
    );
  }

  const correct = !gaveUp && matchAnswer(val, sentence.answer);
  const check = () => { if (val.trim()) setChecked(true); };
  const giveUp = () => { setGaveUp(true); setChecked(true); };

  return (
    <CardPanel>
      <CardLabel>Fill in the blank</CardLabel>
      <Prompt>
        Complete the sentence with the correct form of <strong>{verb.swedish.infinitive}</strong>
      </Prompt>
      <SentenceWithBlank sentence={sentence.sentence} />
      <Hint>{sentence.hint}</Hint>

      <TextField
        value={val} onChange={setVal} onEnter={check}
        placeholder="Type the form..." disabled={checked}
        status={checked ? (correct ? "correct" : "wrong") : null}
        autoFocus
      />

      {!checked && showHint && (
        <HintLine>Starts with “{sentence.answer[0]}” · {sentence.answer.length} letters</HintLine>
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
              <>The answer is <strong>{sentence.answer}</strong> — the {sentence.form} of {verb.swedish.infinitive}.</>
            ) : correct ? (
              <>Correct — <strong>{sentence.answer}</strong> ({sentence.form}).</>
            ) : (
              <>You wrote “{val.trim()}” → <strong>{sentence.answer}</strong> ({sentence.form}).</>
            )}
          </FeedbackStrip>
          <PrimaryButton onClick={() => onResult(correct, correct ? [] : [sentence.form])}>
            Next word →
          </PrimaryButton>
        </>
      )}
    </CardPanel>
  );
}
