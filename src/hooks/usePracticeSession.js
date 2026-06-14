import { useReducer, useMemo, useRef, useCallback } from "react";
import { getVerb, getVerbs } from "../data/verbs/index.js";
import { getGroupDef } from "../data/wordGroups.js";
import { selectCard } from "../utils/cardSelector.js";
import { scoreSession } from "../utils/sessionScorer.js";
import {
  loadWordProgress, getWordProgress, recordWordResult,
  recomputeGroupProgress, computeGroupStats,
} from "../utils/progressStore.js";

const NEW_PER_SESSION = 5;
const REVIEW_MAX = 25;
const RETRY_GAP = 3; // re-insert a wrong word this many slots later

// Build the initial ordered queue of distinct words for the session.
function buildQueue(groupDef, mode, wordProg) {
  const verbs = getVerbs(groupDef.words);
  let chosen;
  if (mode === "learn") {
    chosen = verbs.filter((v) => !wordProg[v.id]?.seen).slice(0, NEW_PER_SESSION);
  } else {
    const seen = verbs.filter((v) => wordProg[v.id]?.seen);
    // weakest (lowest accuracy) first, then sample the rest
    chosen = [...seen]
      .sort((a, b) => (wordProg[a.id]?.accuracy || 0) - (wordProg[b.id]?.accuracy || 0))
      .slice(0, REVIEW_MAX);
  }
  const queue = chosen.map((v, idx) => {
    const sel = selectCard(v, wordProg[v.id], idx);
    const weak = wordProg[v.id]?.weakForms || [];
    return {
      verbId: v.id,
      card: sel.card,
      form: sel.form || null,        // single-form card: which form to drill
      isRetry: false,
      // verb-forms grid: if the user has known weak forms, blank only those
      blankForms: sel.card === "verbforms" && weak.length ? weak : null,
    };
  });
  return { queue, sessionWordIds: chosen.map((v) => v.id) };
}

function reducer(state, action) {
  if (action.type === "SUBMIT") {
    const { correct, weakForms } = action;
    const item = state.queue[0];
    if (!item) return state;
    const firstTime = state.results[item.verbId] === undefined;
    const results = {
      ...state.results,
      [item.verbId]: {
        firstTryCorrect: firstTime ? correct : state.results[item.verbId].firstTryCorrect,
        weakForms: weakForms || state.results[item.verbId]?.weakForms || [],
      },
    };
    if (correct) {
      return {
        ...state,
        results,
        queue: state.queue.slice(1),
        done: state.done.includes(item.verbId) ? state.done : [...state.done, item.verbId],
      };
    }
    // wrong → re-queue a few slots later, same card, blank only the weak forms
    const rest = state.queue.slice(1);
    const retry = {
      ...item,
      isRetry: true,
      blankForms: weakForms && weakForms.length ? weakForms : item.blankForms,
    };
    const pos = Math.min(rest.length, RETRY_GAP);
    return {
      ...state,
      results,
      queue: [...rest.slice(0, pos), retry, ...rest.slice(pos)],
    };
  }
  return state;
}

// Session state machine. Read once at start from a localStorage snapshot.
export function usePracticeSession(groupId, mode) {
  const groupDef = getGroupDef(groupId);

  const init = useMemo(() => {
    const wordProg = loadWordProgress();
    const { queue, sessionWordIds } = groupDef
      ? buildQueue(groupDef, mode, wordProg)
      : { queue: [], sessionWordIds: [] };
    return { queue, sessionWordIds, results: {}, done: [] };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, mode]);

  const [state, dispatch] = useReducer(reducer, init);

  // Group accuracy before the session, for the summary delta.
  const beforeRef = useRef(groupDef ? computeGroupStats(groupId).overallAccuracy : 0);
  const finalizedRef = useRef(false);

  const current = state.queue[0] || null;
  const currentVerb = current ? getVerb(current.verbId) : null;
  const isComplete = state.sessionWordIds.length > 0 && state.queue.length === 0;
  const isEmpty = state.sessionWordIds.length === 0;

  const submit = useCallback((correct, weakForms) => {
    dispatch({ type: "SUBMIT", correct, weakForms });
  }, []);

  // Dots: one per distinct session word.
  const dots = state.sessionWordIds.map((id) => {
    if (current && id === current.verbId) return { id, state: "current" };
    const r = state.results[id];
    if (!r) return { id, state: "upcoming" };
    return { id, state: r.firstTryCorrect ? "correct" : "wrong" };
  });

  const progress = {
    current: Math.min(state.done.length + 1, state.sessionWordIds.length),
    total: state.sessionWordIds.length,
  };

  // Persist results + group progress, build the summary payload. Idempotent.
  const finalize = useCallback(() => {
    if (finalizedRef.current) return null;
    finalizedRef.current = true;
    const nowISO = new Date().toISOString();
    const wordProgBefore = loadWordProgress();
    const answeredIds = Object.keys(state.results);
    const newlyLearned = answeredIds.filter((id) => !wordProgBefore[id]?.seen).length;

    // Persist only words actually answered (so early exits don't penalise the rest).
    answeredIds.forEach((id) => {
      const r = state.results[id];
      recordWordResult(id, r.firstTryCorrect, r.weakForms, nowISO);
    });
    const after = recomputeGroupProgress(groupId, nowISO);

    const results = state.sessionWordIds.map((id) => ({
      verbId: id,
      verb: getVerb(id),
      firstTryCorrect: state.results[id]?.firstTryCorrect ?? false,
    }));
    const score = scoreSession(results);

    return {
      groupId,
      groupName: groupDef?.name || "",
      mode,
      score: { total: score.total, firstTry: score.firstTry, accuracy: score.accuracy },
      wrongWords: score.wrong.map((r) => r.verb?.swedish?.infinitive).filter(Boolean),
      beforePct: beforeRef.current,
      afterPct: after.overallAccuracy,
      newlyLearned: mode === "learn" ? newlyLearned : 0,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, mode, state.sessionWordIds, state.results]);

  return { groupDef, current, currentVerb, dots, progress, isComplete, isEmpty, submit, finalize };
}
