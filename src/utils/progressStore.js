// Per-word and per-group progress, persisted to localStorage. Static word-bank
// data (verbs, group defs) lives in src/data; only user progress is stored here.
// Structured so it can move to a backend later (plain JSON, no DOM coupling).

import { WORD_GROUPS, getGroupDef, MASTERY_THRESHOLD, TOTAL_VERB_TARGET } from "../data/wordGroups.js";

const WORD_KEY = "sg_word_progress";
const GROUP_KEY = "sg_group_progress";
const HISTORY_LEN = 5;

// Per-word difficulty ladder: 0 translate → 1-3 single forms → 4 context →
// 5 all-forms grid → 6 maintenance. Climbs on a correct answer, drops on wrong.
export const MAX_LEVEL = 6;

function load(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function save(key, obj) {
  try { localStorage.setItem(key, JSON.stringify(obj)); } catch {}
}

export function defaultWordProgress(wordId) {
  return {
    wordId,
    seen: false,
    level: 0,           // position on the difficulty ladder (see MAX_LEVEL)
    attempts: 0,
    correctCount: 0,
    accuracy: 0,
    history: [],        // last N first-try results (1 correct / 0 wrong)
    weakForms: [],
    mastered: false,
    lastPracticed: null,
  };
}

export const loadWordProgress = () => load(WORD_KEY);
export const getWordProgress = (id, all = loadWordProgress()) =>
  all[id] || defaultWordProgress(id);

function accuracyOf(history) {
  if (!history.length) return 0;
  const sum = history.reduce((a, b) => a + b, 0);
  return Math.round((sum / history.length) * 100);
}

// Record one word result (one encounter in a session). `firstTryCorrect` feeds the
// rolling accuracy; `weakForms` are the forms still wrong (verb-forms card).
export function recordWordResult(id, firstTryCorrect, weakForms, nowISO) {
  const all = loadWordProgress();
  const p = all[id] || defaultWordProgress(id);
  const history = [...p.history, firstTryCorrect ? 1 : 0].slice(-HISTORY_LEN);
  const accuracy = accuracyOf(history);
  // Climb the ladder on success, step back on failure (never below 0).
  const prevLevel = p.level || 0;
  const level = firstTryCorrect
    ? Math.min(prevLevel + 1, MAX_LEVEL)
    : Math.max(0, prevLevel - 1);
  all[id] = {
    ...p,
    seen: true,
    level,
    attempts: p.attempts + 1,
    correctCount: p.correctCount + (firstTryCorrect ? 1 : 0),
    history,
    accuracy,
    weakForms: weakForms || [],
    mastered: history.length >= 3 && accuracy >= MASTERY_THRESHOLD,
    lastPracticed: nowISO || null,
  };
  save(WORD_KEY, all);
  return all[id];
}

// ── Group progress (derived from the words it contains) ──────────────────────

export const loadGroupProgress = () => load(GROUP_KEY);

export function computeGroupStats(groupId, wordProg = loadWordProgress()) {
  const def = getGroupDef(groupId);
  const ids = def ? def.words : [];
  const seen = ids.filter((id) => wordProg[id]?.seen);
  const mastered = ids.filter((id) => wordProg[id]?.mastered);
  const overallAccuracy = seen.length
    ? Math.round(seen.reduce((a, id) => a + (wordProg[id]?.accuracy || 0), 0) / seen.length)
    : 0;
  return {
    groupId,
    total: ids.length,
    wordsSeenCount: seen.length,
    wordsMasteredCount: mastered.length,
    overallAccuracy,
    started: seen.length > 0,
    completed: seen.length > 0 && overallAccuracy >= MASTERY_THRESHOLD,
  };
}

// Persist the derived group stats (called after a session) and return them.
export function recomputeGroupProgress(groupId, nowISO) {
  const stats = computeGroupStats(groupId);
  const all = loadGroupProgress();
  all[groupId] = { ...stats, lastPracticed: nowISO || all[groupId]?.lastPracticed || null };
  save(GROUP_KEY, all);
  return all[groupId];
}

// A group is unlocked if it's the first, or its prerequisite is completed.
export function isGroupUnlocked(groupId, wordProg = loadWordProgress()) {
  const def = getGroupDef(groupId);
  if (!def) return false;
  if (!def.prerequisite) return true;
  return computeGroupStats(def.prerequisite, wordProg).completed;
}

// Whole-path numbers for the hub header / home dashboard.
export function getOverallStats(wordProg = loadWordProgress()) {
  const values = Object.values(wordProg);
  const learned = values.filter((p) => p.seen).length;
  const mastered = values.filter((p) => p.mastered).length;
  return {
    learned,
    mastered,
    total: TOTAL_VERB_TARGET,
    pct: Math.round((learned / TOTAL_VERB_TARGET) * 100),
  };
}

// Convenience: a snapshot of every group's display state for the hub.
export function getGroupsView() {
  const wordProg = loadWordProgress();
  return WORD_GROUPS.map((def) => {
    const stats = computeGroupStats(def.id, wordProg);
    const unlocked = def.seeded && isGroupUnlocked(def.id, wordProg);
    let state = "locked";
    if (unlocked) {
      if (stats.completed) state = "mastered";
      else if (stats.started) state = "in_progress";
      else state = "unlocked";
    }
    return { ...def, stats, unlocked, state };
  });
}
