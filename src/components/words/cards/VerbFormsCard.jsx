import { useState } from "react";
import { CardPanel, CardLabel, Prompt, BigWord, TextField, PrimaryButton, GhostButton, HintButton, HintLine, verbGroupHint } from "./cardKit.jsx";
import FeedbackStrip from "./FeedbackStrip.jsx";
import { FONT, TEXT_MUTED, PRIMARY, PRIMARY_LIGHT } from "../../../theme.js";
import { matchAnswer } from "../../../utils/answerMatcher.js";
import { FORM_ORDER, FORM_LABELS } from "../../../data/verbs/index.js";

// Card 2: fill in all five forms. The word counts as correct only if every
// requested form is right; wrong forms become `weakForms`. On retry, only the
// previously-wrong forms are blank (the rest are pre-filled and locked).
export default function VerbFormsCard({ verb, onResult, blankForms }) {
  // Forms the verb actually has (skip "—" placeholders like modal imperatives).
  const available = FORM_ORDER.filter((f) => verb.swedish[f] && verb.swedish[f] !== "—");
  // Which forms the user must fill this round.
  const toFill = blankForms && blankForms.length
    ? available.filter((f) => blankForms.includes(f))
    : available;

  const [values, setValues] = useState(() =>
    Object.fromEntries(available.map((f) => [f, toFill.includes(f) ? "" : verb.swedish[f]]))
  );
  const [checked, setChecked] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const isCorrect = (f) => matchAnswer(values[f], verb.swedish[f]);
  const allCorrect = !gaveUp && available.every(isCorrect);
  const weakForms = gaveUp ? available : available.filter((f) => !isCorrect(f));

  const set = (f, v) => setValues((prev) => ({ ...prev, [f]: v }));
  const check = () => setChecked(true);
  const giveUp = () => { setGaveUp(true); setChecked(true); };
  const filledAll = toFill.every((f) => values[f].trim());

  return (
    <CardPanel>
      <CardLabel>Verb forms</CardLabel>
      <Prompt>Give all forms of…</Prompt>
      <BigWord>{verb.english}</BigWord>
      <span style={{
        alignSelf: "flex-start", fontFamily: FONT, fontSize: 12, fontWeight: 600,
        color: PRIMARY, background: PRIMARY_LIGHT, borderRadius: 6, padding: "3px 8px",
      }}>
        Group {verb.verbGroup} verb
      </span>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {available.map((f) => {
          const locked = !toFill.includes(f);
          return (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 92, flexShrink: 0, fontFamily: FONT, fontSize: 13, color: TEXT_MUTED }}>
                {FORM_LABELS[f]}
              </span>
              <div style={{ flex: 1 }}>
                <TextField
                  value={values[f]}
                  onChange={(v) => set(f, v)}
                  placeholder={f === "infinitive" ? "______" : "______"}
                  prefix={f === "infinitive" ? "att" : null}
                  disabled={checked || locked}
                  status={gaveUp ? null : checked ? (isCorrect(f) ? "correct" : "wrong") : (locked ? "correct" : null)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {!checked && showHint && <HintLine>{verbGroupHint(verb.verbGroup)}</HintLine>}

      {!checked ? (
        <>
          <PrimaryButton onClick={check} disabled={!filledAll}>Check all</PrimaryButton>
          {!showHint && <HintButton onClick={() => setShowHint(true)} />}
          <GhostButton onClick={giveUp}>I don't know this one</GhostButton>
        </>
      ) : (
        <>
          <FeedbackStrip status={gaveUp ? "learn" : allCorrect ? "correct" : "wrong"}>
            {gaveUp ? (
              <>
                The forms of <strong>{verb.swedish.infinitive}</strong> are:{" "}
                <strong>{available.map((f) => verb.swedish[f]).join(" · ")}</strong>.
                {verb.verbGroup === 4 ? " A strong/irregular verb — worth memorising." : ` Group ${verb.verbGroup} pattern.`}
              </>
            ) : allCorrect ? (
              <>All five correct — {verb.swedish.infinitive} is a Group {verb.verbGroup} verb.</>
            ) : (
              <>
                Not quite. The forms are:{" "}
                <strong>{available.map((f) => verb.swedish[f]).join(" · ")}</strong>.
                {verb.verbGroup === 4 ? " This is a strong/irregular verb — worth memorising." : ` Group ${verb.verbGroup} pattern.`}
              </>
            )}
          </FeedbackStrip>
          <PrimaryButton onClick={() => onResult(allCorrect, weakForms)}>Next word →</PrimaryButton>
        </>
      )}
    </CardPanel>
  );
}
