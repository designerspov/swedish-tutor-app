// Group metadata for the verb-learning path. 40 groups × 25 verbs = 1,000 verbs.
// Groups 1–3 are seeded with real verb data; 4–40 are placeholders that unlock as
// content is added. The model is category-aware so nouns/adjectives can slot in later.

export const VERBS_PER_GROUP = 25;
export const TOTAL_VERB_TARGET = 1000;
export const MASTERY_THRESHOLD = 80; // % accuracy to "complete" a group / master a word

// Thematic names. The first ten follow the spec; later groups get placeholder names
// until their verbs are curated.
const GROUP_NAMES = [
  "Everyday basics",      // G1
  "Movement",             // G2
  "Communication",        // G3
  "Thinking and feeling", // G4
  "Daily routines",       // G5
  "Work and study",       // G6
  "Home and cooking",     // G7
  "Shopping and money",   // G8
  "Social life",          // G9
  "Nature and weather",   // G10
];

// How many leading groups have real seed data in src/data/verbs/.
const SEEDED_GROUPS = 3;

// Build the verb-id list for a seeded group (v001..v025 for g1, etc.).
function seededIds(groupNumber) {
  const start = (groupNumber - 1) * VERBS_PER_GROUP + 1;
  return Array.from({ length: VERBS_PER_GROUP }, (_, i) =>
    `v${String(start + i).padStart(3, "0")}`
  );
}

export const WORD_GROUPS = Array.from({ length: 40 }, (_, i) => {
  const number = i + 1;
  const seeded = number <= SEEDED_GROUPS;
  return {
    id: `g${number}`,
    number,
    name: GROUP_NAMES[i] || `Verbs · set ${number}`,
    category: "verbs",
    words: seeded ? seededIds(number) : [],
    seeded,
    prerequisite: number === 1 ? null : `g${number - 1}`,
  };
});

export const getGroupDef = (id) => WORD_GROUPS.find((g) => g.id === id) || null;
