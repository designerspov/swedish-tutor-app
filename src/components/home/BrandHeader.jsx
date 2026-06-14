import { FONT, TEXT, TEXT_MUTED } from "../../theme.js";

// Lightweight brand header — logo + name + tagline. No stats, no menu.
export default function BrandHeader() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 2px" }}>
      <img
        src="/speedy-goose.png"
        alt="Speedy Goose"
        style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
        <span style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: TEXT }}>
          Speedy Goose
        </span>
        <span style={{ fontFamily: FONT, fontSize: 13, fontStyle: "italic", color: TEXT_MUTED }}>
          Swedish is hard. So are you.
        </span>
      </div>
    </div>
  );
}
