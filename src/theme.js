// Design tokens for the new home dashboard + shell pages.
// The existing chat/lesson interface keeps its own palette (see SwedishTutor.jsx);
// these are scoped to the new pages described in the home build spec.

export const PRIMARY = "#3C3489";        // deep purple
export const PRIMARY_LIGHT = "#EEEDFE";  // light purple fills
export const CARD_BORDER = "#E0DEFC";    // card + divider border
export const PAGE_BG = "#F0EFF8";        // light purple-grey page background
export const CARD_BG = "#ffffff";
export const CARD_RADIUS = 16;

export const TEXT = "#20202C";
export const TEXT_MUTED = "#6B6B7B";     // subtitles, meta
export const TEXT_LOCKED = "#A0A0B0";    // muted/greyed locked tiles

export const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// Words row accent (light green + dark green icon)
export const GREEN_LIGHT = "#E1F5EE";
export const GREEN_DARK = "#117A55";

// Feedback / status palette (from the word-practice spec).
// Each pairs a foreground (text/icon) with a tinted background.
export const CORRECT_FG = "#085041";
export const CORRECT_BG = "#E1F5EE";
export const WRONG_FG = "#791F1F";
export const WRONG_BG = "#FCEBEB";
export const NEW_FG = "#0C447C";   // "new"/active accent
export const NEW_BG = "#E6F1FB";

// Content column width — mobile-first. Fills small screens (16px padding),
// caps on larger viewports so it still reads as a phone-width app.
export const CONTENT_MAX = 440;

// Situation status → colour + display label.
export const STATUS = {
  done:   { color: "#16A34A", label: "Done" },
  active: { color: "#2563EB", label: "Active" },
  locked: { color: "#9CA3AF", label: "Locked" },
};
