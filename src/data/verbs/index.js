// The verb word bank. Seed groups 1–3 (75 verbs) are hand-curated JSON; later
// groups will be generated offline and dropped in as more groupNN.json files.
import group01 from "./group01.json";
import group02 from "./group02.json";
import group03 from "./group03.json";

/**
 * @typedef {"infinitive"|"present"|"past"|"supine"|"imperative"} VerbForm
 * @typedef {Object} ContextSentence
 * @property {string} sentence  - sentence with a "___" blank
 * @property {string} answer    - the form that fills the blank
 * @property {VerbForm} form
 * @property {string} hint
 * @typedef {Object} Verb
 * @property {string} id
 * @property {{infinitive,present,past,supine,imperative}} swedish
 * @property {string} english
 * @property {number} verbGroup
 * @property {ContextSentence[]} contextSentences
 */

// All seeded verbs, in id order.
export const ALL_VERBS = [...group01, ...group02, ...group03];

const BY_ID = new Map(ALL_VERBS.map((v) => [v.id, v]));

export const getVerb = (id) => BY_ID.get(id) || null;
export const getVerbs = (ids) => ids.map((id) => BY_ID.get(id)).filter(Boolean);

// Which verb ids actually have seed data (used to mark groups playable).
export const SEEDED_VERB_IDS = new Set(ALL_VERBS.map((v) => v.id));

// The five forms in canonical display order.
export const FORM_ORDER = ["infinitive", "present", "past", "supine", "imperative"];
export const FORM_LABELS = {
  infinitive: "Infinitive",
  present: "Present",
  past: "Past",
  supine: "Supine",
  imperative: "Imperative",
};
