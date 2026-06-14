// User progress for the home dashboard. Static seed for now — shaped so it can
// be replaced by an API response later without changing the consuming components.
//
// UserProgress shape:
//   currentLevel     "A1" | "A2" | "B1" | "B2"
//   situations       Situation[]
//   currentLesson    { id, name, level }
//   currentWordGroup { category, groupNumber }

import { SITUATIONS } from "./situations.js";

export const USER_PROGRESS = {
  currentLevel: "A2",
  situations: SITUATIONS,
  currentLesson: {
    id: "pa-restaurangen",
    name: "På restaurangen",
    level: "A2",
  },
  currentWordGroup: {
    category: "Nouns",
    groupNumber: 1,
  },
};

// The active situation drives the nudge banner and the lesson-path header.
export const activeSituation = (p = USER_PROGRESS) =>
  p.situations.find((s) => s.status === "active") || null;
