import BackLink from "./BackLink.jsx";
import { FONT, TEXT, TEXT_MUTED, CARD_BG, CARD_BORDER, CARD_RADIUS } from "../theme.js";

// Simple placeholder for pages we'll build out in follow-up specs: page name +
// the shared "← Home" return link. Lives inside the AppShell.
export default function PlaceholderPage({ title, note, backTo = "/", backLabel = "Home" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <BackLink to={backTo} label={backLabel} />

      <div style={{
        background: CARD_BG,
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: CARD_RADIUS,
        padding: 24,
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <h1 style={{ margin: 0, fontFamily: FONT, fontSize: 20, fontWeight: 700, color: TEXT }}>
          {title}
        </h1>
        <p style={{ margin: 0, fontFamily: FONT, fontSize: 14, color: TEXT_MUTED }}>
          {note || "Coming soon."}
        </p>
      </div>
    </div>
  );
}
