// Situation definitions — real-world scenarios the learner works toward.
// Static seed data for now; structured so it can be swapped for an API later.
//
// Situation shape:
//   id            string   stable identifier
//   name          string   display name ("At the shops")
//   status        "done" | "active" | "locked"
//   wordsRequired number   words needed to master the situation
//   wordsMastered number   words mastered so far
//   prerequisite? string   id of a situation that must be done first
//   topic?        string   short noun used in the nudge ("shop" -> "shop words")

export const SITUATIONS = [
  {
    id: "cafe-order",
    name: "Café order",
    status: "done",
    wordsRequired: 24,
    wordsMastered: 24,
    topic: "café",
  },
  {
    id: "introductions",
    name: "Introductions",
    status: "done",
    wordsRequired: 18,
    wordsMastered: 18,
    topic: "intro",
  },
  {
    id: "at-the-shops",
    name: "At the shops",
    status: "active",
    wordsRequired: 30,
    wordsMastered: 14,
    topic: "shop",
  },
  {
    id: "doctor-visit",
    name: "Doctor visit",
    status: "locked",
    wordsRequired: 28,
    wordsMastered: 0,
    prerequisite: "at-the-shops",
    topic: "doctor",
  },
];

// Meta line shown under each situation tile.
export function situationMeta(s, situations = SITUATIONS) {
  if (s.status === "done") return "All words mastered";
  if (s.status === "active") return `${s.wordsMastered} of ${s.wordsRequired} words`;
  // locked: point at the prerequisite that gates it ("Finish shops first").
  const prereq = situations.find((x) => x.id === s.prerequisite);
  if (!prereq) return "Locked";
  const label = prereq.topic ? `${prereq.topic}s` : prereq.name.toLowerCase();
  return `Finish ${label} first`;
}

export const remainingWords = (s) => Math.max(0, s.wordsRequired - s.wordsMastered);
