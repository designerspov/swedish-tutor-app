import { Outlet } from "react-router-dom";
import { PAGE_BG, FONT, TEXT, CONTENT_MAX } from "../../theme.js";

// Shell for the new pages: a mobile-first, centred content column on the page
// background. Navigation is driven from the Home dashboard's action card — there
// is no bottom nav. Each destination provides its own return-to-home path.
export default function AppShell() {
  return (
    <div style={{
      minHeight: "100dvh",
      background: PAGE_BG,
      fontFamily: FONT,
      color: TEXT,
    }}>
      <div style={{
        width: "100%",
        maxWidth: CONTENT_MAX,
        margin: "0 auto",
        padding: 16,
        paddingTop: "max(16px, env(safe-area-inset-top))",
        paddingBottom: "max(24px, env(safe-area-inset-bottom))",
        boxSizing: "border-box",
      }}>
        <Outlet />
      </div>
    </div>
  );
}
