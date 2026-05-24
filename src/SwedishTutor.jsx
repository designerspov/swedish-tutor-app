import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { CURRICULUM, lessonContext } from "./curriculum.js";

const SYSTEM_PROMPT_BASE = `You are Anna, a friendly Swedish language tutor from Göteborg helping the user practise Swedish through conversation.

Your job has two parts that happen in every turn:
1. Give feedback on what the learner wrote — what worked, what needs improvement.
2. Keep the conversation going with a natural, in-character follow-up question.

OUTPUT FORMAT
Respond with a single valid JSON object and nothing else. No markdown code fences, no prose before or after. The schema is:
{
  "what_was_good": [
    {
      "highlight": "the Swedish word, phrase, or structure the learner got right",
      "note": "short, specific reason this was good — English, Swedish, or a mix"
    }
  ],
  "what_needs_work": [
    {
      "category": "2–4 word grammar or usage label",
      "original": "exact phrase from the learner's message, with the error",
      "corrected": "the corrected Swedish phrase",
      "explanation": "plain-English explanation of the rule (not a translation)"
    }
  ],
  "next_question": "your in-character Swedish response and follow-up question, as continuous prose"
}
Empty sections get []. Never pad a section with weak content — a missing section is better than a fake one.

Rules for what_was_good
- Celebrate specific wins. Generic praise teaches nothing.
- Cap at 3 items. Two is usually plenty.
- highlight names the exact thing — a word, a pattern, a structural choice. Not "Whole sentence" or "Spelling."
- note says why it was good in 8–15 words. Be concrete.
- Praise at-level. Don't celebrate basic A1 vocabulary unless it's a step up.
- If nothing is genuinely worth highlighting, return [].

Rules for what_needs_work
- Cap at 2–3 items. Grammar > word choice > style/idiom. If they made six errors, pick the three most impactful.
- category is a specific recognisable label like "Past tense (perfekt)", "tycker vs. tänker", "en/ett noun", "Word order in bisats". Not "Grammar" or "Word choice".
- original is copy-pasted from the learner — don't paraphrase. Include 3–6 words of context.
- corrected is the minimal fix. Don't rewrite their whole sentence unless structure is broken.
- explanation teaches the rule, not the translation. Under 25 words.
- Merge duplicate categories. If Swedish is fully correct, return [].

Rules for next_question
- Stay in character as Anna. Match the learner's level.
- React naturally first, then pivot. ("Jag förstår helt!", "Åh, intressant!"). A bare question feels robotic.
- One question per turn. Open-ended beats yes/no.
- Light stage directions in quotes are fine: Anna nickar: "...". Keep them brief.
- Do NOT correct errors here. All feedback lives in what_needs_work. The conversation flows uninterrupted.
- Use no emoji.

Tone
- Warm, not sycophantic. Avoid "Amazing!", "Fantastic!", "Wow!"
- Talk to the learner like a patient colleague, not a cheerleader.
- Match their energy.

Edge cases
- Learner writes in English: respond in simple Swedish anyway, and add one what_needs_work item with category "Try in Swedish".
- One-word answers: respond in character, make next_question open-ended.
- Meta question (e.g. "what does X mean?"): break character briefly. Put the explanation in next_question as prose, leave both arrays [].
- Learner is stuck or frustrated: ease off corrections. Cap what_needs_work at 1 item or skip it. Lead with encouragement.

Examples

Learner: "Jag studerar svenska on and off sedan jag kommer till Sverige. Jag tänker det är jättesvårt, och många svenska människor då pratar jättebra engelska, så jag inte praktiserar så mycket, men det är mitt problem."
Output:
{"what_was_good":[{"highlight":"praktiserar","note":"Perfect word choice for 'practise'."},{"highlight":"Linking with så","note":"Natural way to connect cause and effect."}],"what_needs_work":[{"category":"Past tense (perfekt)","original":"Jag studerar svenska sedan jag kommer","corrected":"Jag har studerat svenska sedan jag kom","explanation":"For something that started in the past and still happens now, Swedish uses 'har' + verb. And 'kom' is past tense of 'kommer'."},{"category":"tycker vs. tänker","original":"Jag tänker det är jättesvårt","corrected":"Jag tycker att det är jättesvårt","explanation":"Tycker = opinions and feelings. Tänker = thinking about, planning."}],"next_question":"Anna nickar: 'Jag förstår helt! Men det är jättebra att du övar nu. Säg mig — vilket land tycker du är lättast att lära sig språket i, Australien eller Sverige?'"}

Learner: "Jag bor i Stockholm. Jag kommer från Australien."
Output:
{"what_was_good":[{"highlight":"Jag bor i Stockholm","note":"Correct preposition — Swedish uses 'i' for cities."}],"what_needs_work":[],"next_question":"Anna ler: 'Australien! Det är väldigt långt borta. Hur länge har du bott i Stockholm?'"}

Learner: "Sorry I don't know how to say this in Swedish but I work as a designer."
Output:
{"what_was_good":[],"what_needs_work":[{"category":"Try in Swedish","original":"Sorry I don't know how to say this","corrected":"Jag vet inte hur man säger detta på svenska","explanation":"Always try in Swedish first, even if it's broken — that's how the practice works. Mix in English words if you must."}],"next_question":"Anna ler: 'Designer — ett bra jobb! Vad designar du? Hemsidor, appar, eller något annat?'"}

REMINDERS
- Output only the JSON object. No code fences, no preamble.
- Empty arrays are allowed and often correct.
- what_needs_work is capped at 3 items max.
- explanation teaches the rule, not the translation.
- next_question is conversation, not correction.`;

const FREE_CHAT_SUFFIX = `\n\nMODE: Free conversation. No specific lesson — practise general Swedish.`;

const PURPLE = "#291a74";
const BORDER = "#dadada";
const PAGE_BG = "#f9f9f9";
const CARD_BG = "rgba(255,255,255,0.95)";
const TEXT = "#20202C";
const TEXT_MUTED = "#666";
const TEXT_PLACEHOLDER = "#848e99";
const USER_BUBBLE = "#dedede";
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const SIDEBAR_WIDTH = 299;
const SIDEBAR_MARGIN = 16;
const COMPOSER_WIDTH = 717;

const PLACEHOLDER_BY_LANG = {
  "sv-SE": "Starta en konversation...",
  "en-US": "Start a conversation...",
};

const VOICE_RATES = [
  { value: 0.7, label: "0.7x" },
  { value: 1.0, label: "1.0x" },
  { value: 1.2, label: "1.2x" },
];
const DEFAULT_VOICE_RATE = 1.0;
const VOICE_RATE_LS_KEY = "swedish-tutor-voice-rate";

const LS_KEY = "swedish-tutor-conversations-v1";

const newId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const loadConvos = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const Icon = ({ name, size = 20, style }) => (
  <span
    className="material-icons-outlined"
    style={{ fontSize: size, lineHeight: 1, userSelect: "none", ...style }}
  >
    {name}
  </span>
);

// Pull a JSON object out of Claude's reply. Tolerates code fences and stray prose.
function parseAssistantResponse(raw) {
  if (!raw) return { text: "Förlåt, något gick fel.", feedback: null };
  let s = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try {
      const parsed = JSON.parse(s.slice(start, end + 1));
      if (parsed && typeof parsed.next_question === "string") {
        return {
          text: parsed.next_question,
          feedback: {
            what_was_good: Array.isArray(parsed.what_was_good) ? parsed.what_was_good : [],
            what_needs_work: Array.isArray(parsed.what_needs_work) ? parsed.what_needs_work : [],
          },
        };
      }
    } catch {}
  }
  return { text: raw, feedback: null };
}

// Render **bold** and *italic* inline. Plain text otherwise.
function renderInline(text) {
  const parts = [];
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  let lastIndex = 0;
  let m;
  let key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIndex) parts.push(text.slice(lastIndex, m.index));
    if (m[2] !== undefined) {
      parts.push(<strong key={key++} style={{ fontWeight: 600 }}>{m[2]}</strong>);
    } else if (m[3] !== undefined) {
      parts.push(<em key={key++}>{m[3]}</em>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

export default function SwedishTutor() {
  const [conversations, setConversations] = useState(loadConvos);
  const [activeId, setActiveId] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [sidebarTab, setSidebarTab] = useState("lessons");
  const [showVocab, setShowVocab] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [textInput, setTextInput] = useState("");
  const [error, setError] = useState("");
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [inputLang, setInputLang] = useState("sv-SE");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [audioMode, setAudioMode] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [voiceRate, setVoiceRate] = useState(() => {
    const saved = parseFloat(localStorage.getItem(VOICE_RATE_LS_KEY));
    return VOICE_RATES.some(r => r.value === saved) ? saved : DEFAULT_VOICE_RATE;
  });
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const speedMenuRef = useRef(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef(null);

  useEffect(() => {
    if (!moreMenuOpen) return;
    const onClick = (e) => {
      if (!moreMenuRef.current?.contains(e.target)) setMoreMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("touchstart", onClick);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("touchstart", onClick);
    };
  }, [moreMenuOpen]);

  useEffect(() => {
    if (!speedMenuOpen) return;
    const onClick = (e) => {
      if (!speedMenuRef.current?.contains(e.target)) setSpeedMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [speedMenuOpen]);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const messagesEndRef = useRef(null);
  const listenStartRef = useRef(0);
  const titleInputRef = useRef(null);
  const audioModeRef = useRef(audioMode);
  useEffect(() => { audioModeRef.current = audioMode; }, [audioMode]);
  const voiceRateRef = useRef(voiceRate);
  useEffect(() => {
    voiceRateRef.current = voiceRate;
    try { localStorage.setItem(VOICE_RATE_LS_KEY, String(voiceRate)); } catch {}
  }, [voiceRate]);
  const transcriptRef = useRef("");
  const keepOnEndRef = useRef(false);

  const active = conversations.find(c => c.id === activeId) || null;
  const messages = active?.messages || [];

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(conversations)); } catch {}
  }, [conversations]);

  useEffect(() => {
    const loadVoices = () => {
      const available = synthRef.current.getVoices();
      setVoices(available);
      const sv = available.find(v => v.lang.startsWith("sv")) ||
                 available.find(v => v.lang.startsWith("en-GB")) ||
                 available[0];
      setSelectedVoice(sv);
    };
    loadVoices();
    synthRef.current.onvoiceschanged = loadVoices;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isThinking]);

  useEffect(() => {
    if (!isListening) return;
    listenStartRef.current = Date.now();
    setElapsedMs(0);
    const id = setInterval(() => setElapsedMs(Date.now() - listenStartRef.current), 100);
    return () => clearInterval(id);
  }, [isListening]);

  useEffect(() => {
    if (editingTitle) titleInputRef.current?.focus();
  }, [editingTitle]);

  const speak = useCallback((text, lang = "sv-SE") => {
    if (!audioModeRef.current) return;
    const synth = synthRef.current;
    if (synth.speaking || synth.pending) synth.cancel();

    const clean = text
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/\p{Extended_Pictographic}/gu, "");
    const utter = new SpeechSynthesisUtterance(clean);
    const allVoices = synth.getVoices();
    const swedish = allVoices.filter(v => v.lang.startsWith("sv"));
    const rank = (v) => {
      const n = v.name.toLowerCase();
      if (n.includes("premium")) return 3;
      if (n.includes("enhanced")) return 2;
      if (v.lang === "sv-SE") return 1;
      return 0;
    };
    const sv = swedish.sort((a, b) => rank(b) - rank(a))[0] || selectedVoice;
    if (sv) {
      utter.voice = sv;
      utter.lang = sv.lang;
    } else {
      utter.lang = lang;
    }
    utter.rate = voiceRateRef.current;
    utter.pitch = 1.05;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    synth.speak(utter);
    // Chrome bug: speak() can stay stuck "pending" — kick with pause/resume.
    setTimeout(() => {
      if (!synth.speaking) {
        synth.pause();
        synth.resume();
      }
    }, 200);
  }, [selectedVoice]);

  const updateConvo = useCallback((id, updater) => {
    setConversations(prev => prev.map(c => c.id === id ? updater(c) : c));
  }, []);

  const generateTitle = useCallback(async (id, userMsg, assistantMsg) => {
    try {
      const resp = await fetch("/api/anthropic/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5",
          max_tokens: 30,
          system: "Generate a 3-5 word title that captures the theme of this conversation. Reply with ONLY the title — no quotes, no punctuation, no prefix. Use the same language the user used.",
          messages: [{ role: "user", content: `USER: ${userMsg}\n\nASSISTANT: ${assistantMsg}` }],
        }),
      });
      const data = await resp.json();
      const title = data.content?.[0]?.text?.trim().replace(/^["']|["']$/g, "");
      if (title) updateConvo(id, c => ({ ...c, title, titleAuto: true }));
    } catch {}
  }, [updateConvo]);

  const callClaude = useCallback(async (userMessage, convoOverride) => {
    setIsThinking(true);

    let convoId = convoOverride?.id ?? activeId;
    let prevMessages = convoOverride?.messages ?? messages;
    let activeConvo = convoOverride ?? active;

    if (!convoId) {
      convoId = newId();
      prevMessages = [];
      const newConvo = {
        id: convoId,
        title: "New conversation",
        titleAuto: false,
        messages: [{ role: "user", text: userMessage }],
        createdAt: Date.now(),
        lessonId: null,
      };
      setConversations(prev => [newConvo, ...prev]);
      setActiveId(convoId);
      activeConvo = newConvo;
    } else if (!convoOverride) {
      updateConvo(convoId, c => ({ ...c, messages: [...c.messages, { role: "user", text: userMessage }] }));
    } else {
      updateConvo(convoId, c => ({ ...c, messages: [...c.messages, { role: "user", text: userMessage }] }));
    }

    const history = [...prevMessages, { role: "user", text: userMessage }]
      .map(m => ({ role: m.role, content: m.text }));

    const lesson = activeConvo?.lessonId
      ? CURRICULUM.find(l => l.id === activeConvo.lessonId)
      : null;
    const suffix = lesson ? lessonContext(lesson) : FREE_CHAT_SUFFIX;

    try {
      const response = await fetch("/api/anthropic/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5",
          max_tokens: 1000,
          system: [
            { type: "text", text: SYSTEM_PROMPT_BASE, cache_control: { type: "ephemeral" } },
            { type: "text", text: suffix },
          ],
          messages: history,
        }),
      });
      const data = await response.json();
      if (data.type === "error") {
        setIsThinking(false);
        setError(`${data.error?.type || "API error"}: ${data.error?.message || "Unknown"}`);
        return;
      }
      const raw = data.content?.[0]?.text || "";
      const { text: reply, feedback } = parseAssistantResponse(raw);

      updateConvo(convoId, c => ({ ...c, messages: [...c.messages, { role: "assistant", text: reply, feedback }] }));
      setIsThinking(false);
      speak(reply);

      const convoAfter = (prevMessages.length === 0);
      if (convoAfter) generateTitle(convoId, userMessage, reply);
    } catch (err) {
      setIsThinking(false);
      setError("Network error: " + (err.message || "unknown"));
    }
  }, [activeId, messages, active, updateConvo, speak, generateTitle]);

  const sendText = useCallback(() => {
    const t = textInput.trim();
    if (!t) return;
    setTextInput("");
    callClaude(t);
  }, [textInput, callClaude]);

  const punctuate = useCallback(async (text, lang) => {
    if (!text.trim()) return text;
    const system = lang === "en-US"
      ? "You are given a speech-to-text transcript without punctuation. Add appropriate punctuation (periods, commas, question marks, exclamation marks) and capitalize the start of each sentence. Do NOT add or change any words. Reply with only the corrected text — no quotes, no prefix, no explanation."
      : "Du får en tal-till-text-transkription utan skiljetecken. Lägg till lämpliga svenska skiljetecken (punkt, komma, frågetecken, utropstecken) och stor bokstav i början av varje mening. Lägg INTE till eller ändra några ord. Svara endast med den korrigerade texten — inga citattecken, ingen prefix, ingen förklaring.";
    try {
      const resp = await fetch("/api/anthropic/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5",
          max_tokens: 500,
          system,
          messages: [{ role: "user", content: text }],
        }),
      });
      const data = await resp.json();
      if (data.type === "error") return text;
      return data.content?.[0]?.text?.trim() || text;
    } catch {
      return text;
    }
  }, []);

  const startListening = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setError("Din webbläsare stöder inte taligenkänning. Prova Chrome.");
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    try { recognition.lang = inputLang; } catch {}
    try { recognition.interimResults = true; } catch {}
    // iOS Safari throws on continuous=true; let it auto-stop instead and treat each utterance
    // as a fresh recording the user can append to.
    try { recognition.continuous = !isIOS; } catch {}

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
      transcriptRef.current = "";
      setError("");
      synthRef.current.cancel();
      // On iOS the mic auto-stops on silence — treat natural end as a "pause" so the
      // transcript is committed back into the textbox.
      if (!recognition.continuous) keepOnEndRef.current = true;
    };
    recognition.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join("");
      transcriptRef.current = t;
      setTranscript(t);
    };
    recognition.onend = () => {
      setIsListening(false);
      const t = transcriptRef.current.trim();
      transcriptRef.current = "";
      setTranscript("");
      if (keepOnEndRef.current) {
        keepOnEndRef.current = false;
        if (t) setTextInput(prev => (prev ? `${prev} ${t}` : t));
      }
    };
    recognition.onerror = (e) => {
      setIsListening(false);
      if (e.error !== "no-speech") setError("Mikrofonfel: " + e.error);
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      setIsListening(false);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      setError(
        isIOS
          ? "Voice input isn't supported in this browser. Tip: tap into the text box and use the iPhone keyboard's mic (the icon next to the spacebar) to dictate instead."
          : `Could not start microphone: ${err.message || err.name || "unknown"}`
      );
    }
  }, [inputLang]);

  const submitListening = useCallback(async () => {
    keepOnEndRef.current = false;
    const t = transcriptRef.current.trim();
    transcriptRef.current = "";
    setTranscript("");
    recognitionRef.current?.stop?.();
    const combined = [textInput.trim(), t].filter(Boolean).join(" ");
    if (!combined) return;
    setTextInput("");
    setIsThinking(true);
    const punctuated = await punctuate(combined, inputLang);
    callClaude(punctuated);
  }, [callClaude, textInput, inputLang, punctuate]);

  const cancelListening = useCallback(() => {
    keepOnEndRef.current = false;
    transcriptRef.current = "";
    setTranscript("");
    recognitionRef.current?.abort?.();
    setIsListening(false);
  }, []);

  const pauseListening = useCallback(() => {
    keepOnEndRef.current = true;
    recognitionRef.current?.stop?.();
  }, []);

  const newConversation = () => {
    setActiveId(null);
    setTranscript("");
    setTextInput("");
    setError("");
    synthRef.current.cancel();
    setSidebarOpen(false);
  };

  const startLesson = useCallback((lesson) => {
    const id = newId();
    const newConvo = {
      id,
      title: `${lesson.level}: ${lesson.title}`,
      titleAuto: false,
      messages: [],
      createdAt: Date.now(),
      lessonId: lesson.id,
    };
    setConversations(prev => [newConvo, ...prev]);
    setActiveId(id);
    setTranscript("");
    setTextInput("");
    setError("");
    synthRef.current.cancel();
    setSidebarOpen(false);
    // Kick off the lesson — Claude introduces the scenario in Swedish.
  }, []);

  const beginLesson = useCallback(() => {
    if (!active?.lessonId) return;
    callClaude("Börja lektionen.", active);
  }, [active, callClaude]);

  const activeLesson = active?.lessonId
    ? CURRICULUM.find(l => l.id === active.lessonId)
    : null;

  const selectConversation = (id) => {
    setActiveId(id);
    setTranscript("");
    setTextInput("");
    setError("");
    synthRef.current.cancel();
    setSidebarOpen(false);
  };

  const commitTitle = () => {
    const t = titleDraft.trim();
    if (active && t) {
      updateConvo(active.id, c => ({ ...c, title: t, titleAuto: false }));
    }
    setEditingTitle(false);
  };

  const filteredConvos = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(c => {
      if (c.title.toLowerCase().includes(q)) return true;
      return c.messages.some(m => m.text.toLowerCase().includes(q));
    });
  }, [conversations, searchQ]);

  const elapsedSec = Math.floor(elapsedMs / 1000);
  const elapsedLabel = `${Math.floor(elapsedSec / 60)}:${String(elapsedSec % 60).padStart(2, "0")}`;
  const headerTitle = active?.title || "New conversation";

  return (
    <div style={{
      display: "flex",
      height: "100dvh",
      overflow: "hidden",
      background: PAGE_BG,
      fontFamily: FONT,
      color: TEXT,
    }}>
      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            zIndex: 90,
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={isMobile ? {
        position: "fixed",
        top: 0, left: 0, bottom: 0,
        width: Math.min(SIDEBAR_WIDTH, 280),
        background: "white",
        borderRight: `1px solid ${BORDER}`,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        boxSizing: "border-box",
        transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.25s ease-out",
        zIndex: 100,
        boxShadow: sidebarOpen ? "4px 0 24px rgba(0,0,0,0.1)" : "none",
      } : {
        flexShrink: 0,
        width: SIDEBAR_WIDTH,
        margin: SIDEBAR_MARGIN,
        marginRight: 8,
        background: CARD_BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 24,
        height: `calc(100vh - ${SIDEBAR_MARGIN * 2}px)`,
        boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, width: "100%" }}>
          <img
            src="/speedy-goose.png"
            alt="Speedy Goose"
            style={{
              width: 52, height: 52, borderRadius: "50%",
              objectFit: "cover", flexShrink: 0,
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", whiteSpace: "nowrap" }}>
            <span style={{
              fontFamily: FONT, fontWeight: 500, fontSize: 14,
              color: TEXT_MUTED, letterSpacing: "0.4px", lineHeight: 1.5,
            }}>
              Languages with
            </span>
            <span style={{
              fontFamily: "'Jolly Lodger', cursive",
              fontWeight: 400, fontSize: 28,
              color: TEXT, letterSpacing: "3.64px", lineHeight: 1.5,
            }}>
              Speedy Goose
            </span>
          </div>
        </div>

        <div style={{
          display: "flex", border: `1px solid ${BORDER}`, borderRadius: 8,
          padding: 2, gap: 2, flexShrink: 0,
        }}>
          {[
            { key: "lessons", label: "Lessons" },
            { key: "chats", label: "Chats" },
          ].map(t => {
            const isActive = sidebarTab === t.key;
            return (
              <button key={t.key} onClick={() => setSidebarTab(t.key)} style={{
                flex: 1, height: 30, border: "none", borderRadius: 6,
                background: isActive ? PURPLE : "transparent",
                color: isActive ? "#faf8ff" : TEXT,
                fontSize: 12, fontFamily: FONT, fontWeight: 500,
                cursor: "pointer",
              }}>
                {t.label}
              </button>
            );
          })}
        </div>

        {sidebarTab === "chats" && (
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            background: CARD_BG, border: `1px solid ${BORDER}`,
            borderRadius: 8, padding: "0 8px", height: 36, flexShrink: 0,
          }}>
            <Icon name="search" size={20} style={{ color: TEXT_PLACEHOLDER }} />
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search conversation"
              style={{
                flex: 1, border: "none", outline: "none",
                background: "transparent", fontSize: 12, fontFamily: FONT,
                color: TEXT, padding: "8px 0",
              }}
            />
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, minHeight: 0 }}>
          {sidebarTab === "lessons" ? (
            <LessonsList
              activeLessonId={activeLesson?.id}
              onStart={startLesson}
            />
          ) : (
            <>
              <div style={{ fontSize: 14, fontWeight: 500, color: TEXT_MUTED }}>
                Recent Conversations
              </div>
              {filteredConvos.length === 0 && (
                <div style={{ fontSize: 12, color: TEXT_PLACEHOLDER, fontStyle: "italic", paddingTop: 4 }}>
                  {searchQ ? "No matches" : "No conversations yet"}
                </div>
              )}
              {filteredConvos.map(c => {
                const isActive = c.id === activeId;
                return (
                  <div
                    key={c.id}
                    onClick={() => selectConversation(c.id)}
                    style={{
                      fontSize: 13,
                      fontWeight: 400,
                      color: isActive ? PURPLE : TEXT,
                      lineHeight: "22px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      background: isActive ? "rgba(41,26,116,0.06)" : "transparent",
                      borderRadius: 6,
                      padding: isActive ? "2px 6px" : "2px 0",
                      margin: isActive ? "0 -6px" : 0,
                    }}
                    title={c.title}
                  >
                    {c.title}
                  </div>
                );
              })}
            </>
          )}
        </div>

        <button onClick={newConversation} style={{
          background: PURPLE, border: "none", borderRadius: 8,
          height: 44, padding: "0 12px", color: "#faf8ff",
          fontSize: 14, fontWeight: 500, fontFamily: FONT, letterSpacing: 0.3,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0,
        }}>
          New Chat
        </button>
      </aside>

      {/* Main */}
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        minWidth: 0,
      }}>
        {/* Header */}
        <header style={{
          flexShrink: 0,
          padding: isMobile ? "16px 16px 12px" : "28px 32px 20px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: PAGE_BG,
          borderBottom: `1px solid rgba(218,218,218,0.5)`,
        }}>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              style={{
                background: "transparent", border: "none",
                width: 36, height: 36, marginRight: 4,
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
              <Icon name="menu" size={24} style={{ color: TEXT }} />
            </button>
          )}
          {editingTitle ? (
            <input
              ref={titleInputRef}
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitTitle();
                else if (e.key === "Escape") setEditingTitle(false);
              }}
              style={{
                fontSize: 18, fontWeight: 600, color: TEXT,
                fontFamily: FONT, border: `1px solid ${BORDER}`,
                borderRadius: 6, padding: "4px 8px", outline: "none",
                background: "white", minWidth: 240,
              }}
            />
          ) : (
            <h1
              onClick={() => {
                if (!active) return;
                setTitleDraft(active.title);
                setEditingTitle(true);
              }}
              style={{
                margin: 0, fontSize: 18, fontWeight: 600, color: TEXT,
                cursor: active ? "text" : "default",
                display: "flex", alignItems: "center", gap: 6,
              }}
              title={active ? "Click to rename" : ""}
            >
              {headerTitle}
              {active && <Icon name="edit" size={16} style={{ color: TEXT_PLACEHOLDER }} />}
            </h1>
          )}
        </header>

        {/* Lesson banner */}
        {activeLesson && (
          <div style={{
            flexShrink: 0, padding: "12px 32px",
            background: "rgba(41,26,116,0.04)",
            borderBottom: `1px solid rgba(218,218,218,0.5)`,
          }}>
            <div style={{
              maxWidth: 713, margin: "0 auto",
              display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
            }}>
              <span style={{
                fontSize: 10, fontWeight: 600, color: "#faf8ff",
                background: PURPLE, padding: "2px 8px", borderRadius: 4,
                letterSpacing: 1,
              }}>
                {activeLesson.level}
              </span>
              <span style={{ fontSize: 13, fontWeight: 500, color: TEXT }}>
                {activeLesson.title}
              </span>
              <span style={{ fontSize: 12, color: TEXT_MUTED }}>
                · {activeLesson.grammarFocus}
              </span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                {messages.length === 0 && (
                  <button
                    onClick={beginLesson}
                    disabled={isThinking}
                    style={{
                      background: PURPLE, border: "none", borderRadius: 6,
                      padding: "6px 14px", fontSize: 12, fontFamily: FONT, fontWeight: 500,
                      color: "#faf8ff", cursor: isThinking ? "not-allowed" : "pointer",
                      opacity: isThinking ? 0.5 : 1,
                      display: "flex", alignItems: "center", gap: 4,
                    }}>
                    <Icon name="play_arrow" size={14} style={{ color: "#faf8ff" }} />
                    Start lesson
                  </button>
                )}
                <button
                  onClick={() => setShowVocab(v => !v)}
                  style={{
                    background: "transparent",
                    border: `1px solid ${BORDER}`, borderRadius: 6,
                    padding: "4px 10px", fontSize: 11, fontFamily: FONT,
                    color: TEXT_MUTED, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                  <Icon name={showVocab ? "expand_less" : "expand_more"} size={14} />
                  {showVocab ? "Hide" : "Show"} vocab
                </button>
              </div>
            </div>
            {showVocab && (
              <div style={{
                maxWidth: 713, margin: "12px auto 0",
                display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "6px 16px",
              }}>
                {activeLesson.vocabulary.map(v => (
                  <div key={v.sv} style={{ fontSize: 12, color: TEXT, lineHeight: "18px" }}>
                    <span style={{ fontWeight: 500 }}>{v.sv}</span>
                    <span style={{ color: TEXT_MUTED }}> — {v.en}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: "auto", minHeight: 0,
          padding: isMobile ? "12px 16px 16px" : "24px 32px 220px",
          display: "flex", flexDirection: "column", gap: isMobile ? 28 : 44,
          width: "100%", boxSizing: "border-box",
        }}>
          <div style={{ maxWidth: 713, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 44 }}>
            {messages.length === 0 && !isThinking && (
              <div style={{ color: TEXT_MUTED, fontSize: 14, marginTop: 40, textAlign: "center" }}>
                Säg hej eller skriv ett meddelande för att börja.
              </div>
            )}
            {messages.map((m, i) => m.role === "user" ? (
              <div key={i} style={{ display: "flex", justifyContent: "flex-end", paddingLeft: 48 }}>
                <div style={{
                  background: USER_BUBBLE, borderRadius: 8, padding: 12,
                  fontSize: 16, fontWeight: 400, lineHeight: "27px", color: TEXT,
                  maxWidth: "100%", whiteSpace: "pre-wrap",
                }}>
                  {renderInline(m.text)}
                </div>
              </div>
            ) : (
              <div key={i} style={{ display: "flex", flexDirection: "column", paddingRight: 48 }}>
                <div style={{
                  fontSize: 16, fontWeight: 400, lineHeight: "27px", color: TEXT,
                  whiteSpace: "pre-wrap",
                }}>
                  {renderInline(m.text)}
                </div>
                <FeedbackCard feedback={m.feedback} />
              </div>
            ))}
            {isThinking && (
              <div style={{ display: "flex", paddingRight: 48, color: TEXT_MUTED, fontSize: 20, letterSpacing: 4 }}>
                <span style={{ animation: "pulse 1s infinite" }}>•••</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Composer */}
        <div style={isMobile ? {
          flexShrink: 0,
          margin: 8,
          marginBottom: `max(8px, env(safe-area-inset-bottom))`,
          boxSizing: "border-box",
          background: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
        } : {
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          width: COMPOSER_WIDTH,
          maxWidth: "calc(100% - 64px)",
          boxSizing: "border-box",
          background: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
        }}>
          {error && (
            <div style={{ color: "#cc2200", fontSize: 12 }}>⚠️ {error}</div>
          )}

          {isListening ? (
            <div style={{ color: TEXT, fontSize: 16, fontWeight: 400, lineHeight: "27px", padding: "4px 0", minHeight: 44 }}>
              {transcript || <span style={{ color: TEXT_PLACEHOLDER }}>
                {inputLang === "sv-SE" ? "Lyssnar..." : "Listening..."}
              </span>}
            </div>
          ) : (
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendText(); }
              }}
              placeholder={PLACEHOLDER_BY_LANG[inputLang]}
              rows={2}
              style={{
                border: "none", outline: "none", resize: "none",
                background: "transparent", fontFamily: FONT,
                fontSize: 16, fontWeight: 400, color: TEXT,
                lineHeight: "27px", padding: 0, width: "100%",
              }}
            />
          )}

          {isMobile && !isListening && (
            <button
              onClick={() => {
                const wasOn = audioModeRef.current;
                setAudioMode(!wasOn);
                if (wasOn) {
                  synthRef.current.cancel();
                  setIsSpeaking(false);
                }
              }}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "rgba(0,0,0,0.02)", border: `1px solid ${BORDER}`,
                borderRadius: 10, padding: "10px 14px", width: "100%",
                cursor: "pointer", fontFamily: FONT,
              }}
            >
              <Icon
                name={audioMode ? "volume_up" : "volume_off"}
                size={20}
                style={{ color: audioMode ? PURPLE : TEXT_PLACEHOLDER }}
              />
              <span style={{ fontSize: 14, color: TEXT, fontWeight: 500, flex: 1, textAlign: "left" }}>
                Speaking mode
              </span>
              <span style={{
                width: 48, height: 28, borderRadius: 14,
                background: audioMode ? PURPLE : BORDER,
                padding: 2, boxSizing: "border-box",
                display: "flex", transition: "background 0.2s",
                flexShrink: 0,
              }}>
                <span style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: "white",
                  transform: audioMode ? "translateX(20px)" : "translateX(0)",
                  transition: "transform 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                }} />
              </span>
            </button>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                display: "flex", border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden",
              }}>
                {[
                  { code: "sv-SE", flag: "🇸🇪", label: "SWE" },
                  { code: "en-US", flag: "🇬🇧", label: "ENG" },
                ].map(opt => {
                  const isActive = inputLang === opt.code;
                  return (
                    <button
                      key={opt.code}
                      onClick={() => setInputLang(opt.code)}
                      disabled={isListening}
                      style={{
                        background: isActive ? PURPLE : "transparent",
                        color: isActive ? "#e9e5ff" : "#20202c",
                        border: "none", padding: "0 12px", height: 36,
                        fontSize: 12, fontWeight: isActive ? 500 : 400,
                        fontFamily: FONT, letterSpacing: 0.2,
                        cursor: isListening ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", gap: 4,
                      }}>
                      <span>{opt.flag}</span>
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  const wasOn = audioModeRef.current;
                  setAudioMode(!wasOn);
                  if (wasOn) {
                    synthRef.current.cancel();
                    setIsSpeaking(false);
                  }
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "transparent", border: "none", padding: 0,
                  cursor: "pointer", height: 36,
                  fontFamily: FONT,
                }}
              >
                <span style={{ fontSize: 12, color: TEXT, fontWeight: 500 }}>
                  Speaking mode
                </span>
                <span style={{
                  width: 36, height: 20, borderRadius: 10,
                  background: audioMode ? PURPLE : BORDER,
                  padding: 2, boxSizing: "border-box",
                  display: "flex", transition: "background 0.2s",
                }}>
                  <span style={{
                    width: 16, height: 16, borderRadius: "50%",
                    background: "white",
                    transform: audioMode ? "translateX(16px)" : "translateX(0)",
                    transition: "transform 0.2s",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                  }} />
                </span>
              </button>

              {audioMode && (
                <div style={{ position: "relative" }} ref={speedMenuRef}>
                  <button
                    onClick={() => setSpeedMenuOpen(o => !o)}
                    title="Voice speed"
                    style={{
                      display: "flex", alignItems: "center", gap: 4,
                      height: 36, padding: "0 10px",
                      border: `1px solid ${BORDER}`, borderRadius: 12,
                      background: speedMenuOpen ? "rgba(41,26,116,0.04)" : "transparent",
                      color: TEXT, fontFamily: FONT,
                      fontSize: 12, fontWeight: 500,
                      cursor: "pointer",
                    }}>
                    {VOICE_RATES.find(r => r.value === voiceRate)?.label || "1.0x"}
                  </button>
                  {speedMenuOpen && (
                    <div style={{
                      position: "absolute",
                      bottom: "calc(100% + 6px)",
                      left: 0,
                      minWidth: 160,
                      background: "white",
                      border: `1px solid ${BORDER}`,
                      borderRadius: 8,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      padding: 4,
                      display: "flex", flexDirection: "column",
                      zIndex: 50,
                    }}>
                      <div style={{
                        padding: "6px 10px 4px", fontSize: 10,
                        color: TEXT_MUTED, fontWeight: 600, letterSpacing: 1,
                        textTransform: "uppercase",
                      }}>
                        Playback speed
                      </div>
                      {VOICE_RATES.map(opt => {
                        const isActive = voiceRate === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => { setVoiceRate(opt.value); setSpeedMenuOpen(false); }}
                            style={{
                              display: "flex", alignItems: "center", gap: 8,
                              padding: "8px 10px", border: "none",
                              background: isActive ? "rgba(41,26,116,0.08)" : "transparent",
                              color: isActive ? PURPLE : TEXT,
                              fontFamily: FONT, fontSize: 13, fontWeight: isActive ? 500 : 400,
                              borderRadius: 6, cursor: "pointer", textAlign: "left",
                            }}>
                            <Icon
                              name="check"
                              size={16}
                              style={{ color: isActive ? PURPLE : "transparent" }}
                            />
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
            )}

            {isMobile && !isListening && (
              <div style={{ position: "relative" }} ref={moreMenuRef}>
                <button
                  onClick={() => setMoreMenuOpen(o => !o)}
                  aria-label="More options"
                  style={{
                    width: 44, height: 44, borderRadius: 10,
                    border: `1px solid ${BORDER}`,
                    background: moreMenuOpen ? "rgba(41,26,116,0.04)" : "transparent",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                  <Icon name="more_horiz" size={22} style={{ color: TEXT }} />
                </button>
                {moreMenuOpen && (
                  <div style={{
                    position: "absolute",
                    bottom: "calc(100% + 8px)",
                    left: 0,
                    minWidth: 240,
                    background: "white",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 10,
                    boxShadow: "0 8px 28px rgba(0,0,0,0.14)",
                    padding: 12,
                    display: "flex", flexDirection: "column", gap: 16,
                    zIndex: 50,
                  }}>
                    {/* Language */}
                    <div>
                      <div style={{
                        fontSize: 10, color: TEXT_MUTED, fontWeight: 600,
                        letterSpacing: 1, textTransform: "uppercase", marginBottom: 8,
                      }}>
                        Language
                      </div>
                      <div style={{
                        display: "flex", border: `1px solid ${BORDER}`,
                        borderRadius: 10, overflow: "hidden",
                      }}>
                        {[
                          { code: "sv-SE", flag: "🇸🇪", label: "SWE" },
                          { code: "en-US", flag: "🇬🇧", label: "ENG" },
                        ].map(opt => {
                          const isActive = inputLang === opt.code;
                          return (
                            <button
                              key={opt.code}
                              onClick={() => setInputLang(opt.code)}
                              style={{
                                flex: 1,
                                background: isActive ? PURPLE : "transparent",
                                color: isActive ? "#e9e5ff" : TEXT,
                                border: "none", padding: "10px 12px",
                                fontSize: 13, fontWeight: isActive ? 500 : 400,
                                fontFamily: FONT, cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                              }}>
                              <span>{opt.flag}</span>
                              <span>{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Speed (only relevant when audio mode is on) */}
                    {audioMode && (
                      <div>
                        <div style={{
                          fontSize: 10, color: TEXT_MUTED, fontWeight: 600,
                          letterSpacing: 1, textTransform: "uppercase", marginBottom: 8,
                        }}>
                          Playback speed
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          {VOICE_RATES.map(opt => {
                            const isActive = voiceRate === opt.value;
                            return (
                              <button
                                key={opt.value}
                                onClick={() => { setVoiceRate(opt.value); setMoreMenuOpen(false); }}
                                style={{
                                  display: "flex", alignItems: "center", gap: 8,
                                  padding: "10px 10px", border: "none",
                                  background: isActive ? "rgba(41,26,116,0.08)" : "transparent",
                                  color: isActive ? PURPLE : TEXT,
                                  fontFamily: FONT, fontSize: 14, fontWeight: isActive ? 500 : 400,
                                  borderRadius: 6, cursor: "pointer", textAlign: "left",
                                }}>
                                <Icon
                                  name="check"
                                  size={16}
                                  style={{ color: isActive ? PURPLE : "transparent" }}
                                />
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: isMobile ? "auto" : 0 }}>

            {isListening ? (
              <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 12, height: isMobile ? 48 : 36 }}>
                <button onClick={cancelListening} style={{
                  background: "#eee", border: "none", borderRadius: isMobile ? 20 : 24,
                  width: isMobile ? 40 : 32, height: isMobile ? 40 : 32, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon name="close" size={isMobile ? 18 : 16} style={{ color: TEXT }} />
                </button>
                {!isMobile && <Waveform />}
                <span style={{ fontSize: 13, fontWeight: 500, color: TEXT_MUTED, fontFamily: FONT }}>
                  {elapsedLabel}
                </span>
                {isMobile && <div style={{ flex: 1 }} />}
                <button
                  onClick={pauseListening}
                  title="Stop recording, keep what you've said so you can edit before sending"
                  style={{
                    background: "#eee", border: "none", borderRadius: isMobile ? 12 : 8,
                    width: isMobile ? 48 : 36, height: isMobile ? 48 : 36, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                  <Icon name="stop" size={isMobile ? 22 : 18} style={{ color: TEXT }} />
                </button>
                <button onClick={submitListening} style={{
                  background: PURPLE, border: "none", borderRadius: isMobile ? 12 : 8,
                  width: isMobile ? 48 : 36, height: isMobile ? 48 : 36, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon name="arrow_upward" size={isMobile ? 24 : 20} style={{ color: "#faf8ff" }} />
                </button>
              </div>
            ) : (
              <>
                <button onClick={startListening} disabled={isThinking || isSpeaking} style={{
                  background: isMobile ? "rgba(0,0,0,0.04)" : "transparent",
                  border: isMobile ? `1px solid ${BORDER}` : "none",
                  width: isMobile ? 48 : 36, height: isMobile ? 48 : 36,
                  borderRadius: isMobile ? 12 : 8,
                  cursor: isThinking || isSpeaking ? "not-allowed" : "pointer",
                  opacity: isThinking || isSpeaking ? 0.4 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon name="mic_none" size={isMobile ? 26 : 22} style={{ color: TEXT }} />
                </button>
                {textInput.trim() && (
                  <button onClick={sendText} disabled={isThinking} style={{
                    background: PURPLE, border: "none", borderRadius: isMobile ? 12 : 8,
                    width: isMobile ? 48 : 36, height: isMobile ? 48 : 36,
                    cursor: isThinking ? "not-allowed" : "pointer",
                    opacity: isThinking ? 0.5 : 1,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon name="arrow_upward" size={isMobile ? 24 : 20} style={{ color: "#faf8ff" }} />
                  </button>
                )}
              </>
            )}
            </div>
          </div>
        </div>

        {(isSpeaking || isPaused) && (
          <div style={{
            position: "absolute", bottom: 180, left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: 8,
          }}>
            <button
              onClick={() => {
                if (isPaused) {
                  synthRef.current.resume();
                  setIsPaused(false);
                } else {
                  synthRef.current.pause();
                  setIsPaused(true);
                }
              }}
              style={{
                background: "white", border: `1px solid ${BORDER}`, borderRadius: 50,
                padding: "8px 16px", fontSize: 12, color: TEXT, cursor: "pointer",
                fontFamily: FONT, boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                display: "flex", alignItems: "center", gap: 6,
              }}>
              <Icon name={isPaused ? "play_arrow" : "pause"} size={16} />
              {isPaused ? "Resume" : "Pause"}
            </button>
            <button
              onClick={() => {
                const last = [...messages].reverse().find(m => m.role === "assistant");
                if (last) {
                  setIsPaused(false);
                  speak(last.text);
                }
              }}
              style={{
                background: "white", border: `1px solid ${BORDER}`, borderRadius: 50,
                padding: "8px 16px", fontSize: 12, color: TEXT, cursor: "pointer",
                fontFamily: FONT, boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                display: "flex", alignItems: "center", gap: 6,
              }}>
              <Icon name="replay" size={16} />
              Replay
            </button>
            <button
              onClick={() => {
                synthRef.current.cancel();
                setIsSpeaking(false);
                setIsPaused(false);
              }}
              style={{
                background: "white", border: `1px solid ${BORDER}`, borderRadius: 50,
                padding: "8px 16px", fontSize: 12, color: TEXT_MUTED, cursor: "pointer",
                fontFamily: FONT, boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                display: "flex", alignItems: "center", gap: 6,
              }}>
              <Icon name="stop_circle" size={16} />
              Stop
            </button>
          </div>
        )}
      </main>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes wave {
          0%, 100% { transform: scaleY(0.18); }
          50% { transform: scaleY(1); }
        }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 3px; }
      `}</style>
    </div>
  );
}

function FeedbackCard({ feedback }) {
  if (!feedback) return null;
  const good = feedback.what_was_good || [];
  const work = feedback.what_needs_work || [];
  if (good.length === 0 && work.length === 0) return null;

  return (
    <div style={{
      background: "rgba(41,26,116,0.03)",
      border: `1px solid rgba(218,218,218,0.7)`,
      borderRadius: 8,
      padding: 14,
      marginTop: 12,
      display: "flex", flexDirection: "column", gap: 14,
      fontFamily: FONT,
    }}>
      {good.length > 0 && (
        <div>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 10, fontWeight: 600, letterSpacing: 1,
            color: "#1f6b3a", textTransform: "uppercase", marginBottom: 8,
          }}>
            <Icon name="check_circle" size={14} style={{ color: "#1f6b3a" }} />
            What you nailed
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {good.map((item, i) => (
              <div key={i} style={{ fontSize: 13, lineHeight: "20px", color: TEXT }}>
                <span style={{ fontWeight: 600 }}>{item.highlight}</span>
                {item.note && (
                  <span style={{ color: TEXT_MUTED }}> — {item.note}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {work.length > 0 && (
        <div>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 10, fontWeight: 600, letterSpacing: 1,
            color: "#a04a00", textTransform: "uppercase", marginBottom: 8,
          }}>
            <Icon name="edit" size={14} style={{ color: "#a04a00" }} />
            Try this next time
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {work.map((item, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: PURPLE, letterSpacing: 0.3 }}>
                  {item.category}
                </div>
                {item.original && (
                  <div style={{ fontSize: 13, lineHeight: "20px", color: TEXT_MUTED, textDecoration: "line-through" }}>
                    {item.original}
                  </div>
                )}
                {item.corrected && (
                  <div style={{ fontSize: 13, lineHeight: "20px", color: TEXT, fontWeight: 500 }}>
                    {item.corrected}
                  </div>
                )}
                {item.explanation && (
                  <div style={{ fontSize: 12, lineHeight: "18px", color: TEXT_MUTED, marginTop: 2 }}>
                    {item.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LessonsList({ activeLessonId, onStart }) {
  const byLevel = useMemo(() => {
    const groups = {};
    for (const l of CURRICULUM) {
      (groups[l.level] ||= []).push(l);
    }
    return groups;
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {Object.entries(byLevel).map(([level, lessons]) => (
        <div key={level} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: TEXT_MUTED, letterSpacing: 1,
            textTransform: "uppercase",
          }}>
            {level}
          </div>
          {lessons.map(l => {
            const isActive = l.id === activeLessonId;
            return (
              <button
                key={l.id}
                onClick={() => onStart(l)}
                style={{
                  textAlign: "left", border: "none",
                  background: isActive ? "rgba(41,26,116,0.08)" : "transparent",
                  color: isActive ? PURPLE : TEXT,
                  fontSize: 13, fontWeight: 400, lineHeight: "20px",
                  padding: "6px 8px", borderRadius: 6,
                  cursor: "pointer", fontFamily: FONT,
                  display: "flex", flexDirection: "column", gap: 2,
                }}
              >
                <span style={{ fontWeight: 500 }}>{l.title}</span>
                <span style={{ fontSize: 11, color: TEXT_PLACEHOLDER }}>
                  {l.theme}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Waveform() {
  const BAR_COUNT = 28;
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center", height: 32 }}>
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <div key={i} style={{
          width: 2, height: 18, background: "black", opacity: 0.66, borderRadius: 1,
          animation: `wave 1.4s cubic-bezier(0.45, 0, 0.55, 1) infinite`,
          animationDelay: `${-1.4 + (i / BAR_COUNT) * 1.4}s`,
          transformOrigin: "center",
        }} />
      ))}
    </div>
  );
}
