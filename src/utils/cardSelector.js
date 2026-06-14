// Picks which card to show for a word, based on its position on the difficulty
// ladder (progress.level). The ladder climbs only on correct answers, so a word
// is never promoted past a stage it hasn't demonstrated. Returns { card, form? }.

export const CARD = {
  TRANSLATE: "translate",
  FORM: "form",         // single conjugated form
  CONTEXT: "context",
  VERBFORMS: "verbforms",
  IDENTIFY: "identify",
};

// One rung per level. Single-form rungs name which form to drill.
const LADDER = [
  { card: CARD.TRANSLATE },                  // 0: recall the root word
  { card: CARD.FORM, form: "present" },       // 1
  { card: CARD.FORM, form: "past" },          // 2
  { card: CARD.FORM, form: "supine" },        // 3
  { card: CARD.CONTEXT },                     // 4: use a form in a sentence
  { card: CARD.VERBFORMS },                   // 5: capstone — all five at once
];

// `variety` (e.g. queue index) varies the maintenance mix without randomness.
export function selectCard(verb, progress, variety = 0) {
  const level = progress?.level || 0;

  if (level < LADDER.length) {
    const step = LADDER[level];
    // Skip a single-form rung if the verb lacks that form (rare; e.g. "—").
    if (step.card === CARD.FORM && (!verb.swedish[step.form] || verb.swedish[step.form] === "—")) {
      return { card: CARD.CONTEXT };
    }
    return { ...step };
  }

  // Maintenance (level >= ladder length): keep it fresh.
  const rot = variety % 3;
  if (rot === 0) return { card: CARD.IDENTIFY };
  if (rot === 1) return { card: CARD.CONTEXT };
  return { card: CARD.VERBFORMS };
}
