import { PRIMARY } from "../../../theme.js";

const COLORS = {
  correct: "#22A06B",
  wrong: "#C0524F",
  current: PRIMARY,
  upcoming: "rgba(0,0,0,0.12)",
};

// Row of dots, one per session word. Current is an elongated pill.
export default function ProgressDots({ dots }) {
  return (
    <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "2px 0", alignItems: "center" }}>
      {dots.map((d, i) => (
        <span
          key={d.id + i}
          style={{
            flexShrink: 0,
            width: d.state === "current" ? 22 : 8,
            height: 8,
            borderRadius: 4,
            background: COLORS[d.state] || COLORS.upcoming,
            transition: "width 0.15s",
          }}
        />
      ))}
    </div>
  );
}
