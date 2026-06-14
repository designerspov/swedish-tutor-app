import BrandHeader from "./BrandHeader.jsx";
import GoalsCard from "./GoalsCard.jsx";
import NudgeBanner from "./NudgeBanner.jsx";
import ActionsCard from "./ActionsCard.jsx";
import { USER_PROGRESS, activeSituation } from "../../data/userProgress.js";

// Home dashboard: goals at the top, actions at the bottom.
export default function HomePage() {
  const p = USER_PROGRESS;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <BrandHeader />
      <GoalsCard level={p.currentLevel} situations={p.situations} />
      <NudgeBanner situation={activeSituation(p)} />
      <ActionsCard currentLesson={p.currentLesson} currentWordGroup={p.currentWordGroup} />
    </div>
  );
}
