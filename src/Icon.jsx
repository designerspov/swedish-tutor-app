// Shared Material Icons (outlined) wrapper, matching the existing app convention.
// The font is loaded globally in index.html.
export default function Icon({ name, size = 20, style }) {
  return (
    <span
      className="material-icons-outlined"
      style={{ fontSize: size, lineHeight: 1, userSelect: "none", ...style }}
    >
      {name}
    </span>
  );
}
