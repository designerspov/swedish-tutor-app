import { createBrowserRouter, useNavigate } from "react-router-dom";
import SwedishTutor from "./SwedishTutor.jsx";
import AppShell from "./components/layout/AppShell.jsx";
import HomePage from "./components/home/HomePage.jsx";
import WordsHub from "./components/words/WordsHub.jsx";
import WordsSession from "./components/words/WordsSession.jsx";
import SituationsPage from "./components/situations/SituationsPage.jsx";

// The existing interface, full-screen. `initialTab` decides which view it opens
// on, so Chat → chat and Lessons → lessons. `onHome` wires the left-side back
// arrow (rendered inside SwedishTutor's header) back to the dashboard.
function TutorRoute({ initialTab }) {
  const navigate = useNavigate();
  return <SwedishTutor initialTab={initialTab} showTabs={false} onHome={() => navigate("/")} />;
}

export const router = createBrowserRouter([
  // New shell pages (persistent bottom nav).
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/words", element: <WordsHub /> },
      { path: "/words/:group", element: <WordsSession /> },
      { path: "/situations", element: <SituationsPage /> },
    ],
  },

  // Existing interfaces, mounted full-screen (no shell), each on its own view.
  { path: "/lessons", element: <TutorRoute initialTab="lessons" /> },
  { path: "/lessons/:id", element: <TutorRoute initialTab="lessons" /> },
  { path: "/chat", element: <TutorRoute initialTab="chats" /> },
]);
