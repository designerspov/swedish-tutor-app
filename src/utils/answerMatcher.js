// Forgiving answer matching for the practice cards.

// Lowercase, trim, collapse inner whitespace, drop a leading "att " (infinitives).
export function normalize(s) {
  return (s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/^att\s+/, "");
}

// A typed Swedish form vs. the expected form string.
export function matchAnswer(input, correct) {
  return normalize(input) === normalize(correct);
}

// Accepted synonyms for each grammatical form name (Identify-the-form card).
const FORM_SYNONYMS = {
  infinitive: ["infinitive", "infinitiv"],
  present: ["present", "presens", "present tense"],
  past: ["past", "preterite", "preteritum", "past tense"],
  supine: ["supine", "supinum", "perfekt", "perfect"],
  imperative: ["imperative", "imperativ", "command"],
};

export function matchForm(input, form) {
  const n = normalize(input);
  return (FORM_SYNONYMS[form] || [form]).includes(n);
}
