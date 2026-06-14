import { createBrowserRouter, useNavigate, useParams } from "react-router-dom";
import SwedishTutor from "./SwedishTutor.jsx";
import AppShell from "./components/layout/AppShell.jsx";
import HomePage from "./components/home/HomePage.jsx";
import LessonsBrowser from "./components/lessons/LessonsBrowser.jsx";
import WordsHub from "./components/words/WordsHub.jsx";
import WordsGroupDetail from "./components/words/WordsGroupDetail.jsx";
import PracticeSession from "./components/words/PracticeSession.jsx";
import SessionSummary from "./components/words/SessionSummary.jsx";
import SituationsPage from "./components/situations/SituationsPage.jsx";

// Free chat — returns to Home.
function ChatRoute() {
  const navigate = useNavigate();
  return (
    <SwedishTutor
      initialTab="chats"
      showTabs={false}
      onBack={() => navigate("/")}
      backLabel="Home"
    />
  );
}

// A specific lesson started in chat — returns to the lesson list.
function LessonChatRoute() {
  const navigate = useNavigate();
  const { id } = useParams();
  return (
    <SwedishTutor
      initialTab="lessons"
      showTabs={false}
      showSidebar={false}
      startLessonId={id}
      onBack={() => navigate("/lessons")}
      backLabel="Lessons"
    />
  );
}

export const router = createBrowserRouter([
  // New shell pages (mobile-first; navigation hub is the Home action card).
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/lessons", element: <LessonsBrowser /> },
      { path: "/words", element: <WordsHub /> },
      { path: "/words/:groupId", element: <WordsGroupDetail /> },
      { path: "/words/:groupId/session", element: <PracticeSession /> },
      { path: "/words/:groupId/summary", element: <SessionSummary /> },
      { path: "/situations", element: <SituationsPage /> },
    ],
  },

  // Existing chat interface, full-screen, one focused conversation per route.
  { path: "/lessons/:id", element: <LessonChatRoute /> },
  { path: "/chat", element: <ChatRoute /> },
]);
