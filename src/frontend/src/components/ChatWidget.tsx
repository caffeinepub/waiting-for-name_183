import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDesignModal } from "@/context/DesignModalContext";
import { useActor } from "@/hooks/useActor";
import {
  ArrowLeft,
  Bot,
  Loader2,
  MessageSquare,
  Paperclip,
  Send,
  Upload,
  User,
  UserCheck,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system-info";
  content: string;
  timestamp: Date;
  isHuman?: boolean; // true when the message is from real admin (not AI)
}

interface AttachedFile {
  name: string;
  preview?: string;
  type: string;
}

const GREETING: ChatMessage = {
  id: "greeting",
  role: "assistant",
  content:
    "Hey! 👋 I'm the MEGATRX support bot. I can help you with questions about our products, pricing, and custom design services. What can I help you with today?",
  timestamp: new Date(),
};

// Phrases that trigger escalation to a human
const HUMAN_TRIGGER_PHRASES = [
  "talk to a human",
  "talk to human",
  "speak to a human",
  "speak to human",
  "real person",
  "human agent",
  "live agent",
  "live chat",
  "talk to someone",
  "speak to someone",
  "talk to a person",
  "speak to a person",
  "connect me to",
  "agent please",
  "human please",
  "representative",
  "rep please",
  "customer service",
];

function wantsHuman(text: string): boolean {
  const lower = text.toLowerCase();
  return HUMAN_TRIGGER_PHRASES.some((phrase) => lower.includes(phrase));
}

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

// Session management for live admin chat
function getOrCreateSessionId(): string {
  let id = sessionStorage.getItem("megatrx_chat_session_id");
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    sessionStorage.setItem("megatrx_chat_session_id", id);
  }
  return id;
}

interface LiveChatSession {
  id: string;
  customerName: string;
  customerEmail?: string;
  lastSeen: string;
  isEscalated: boolean; // true when customer requested human
  messages: Array<{
    role: "customer" | "admin";
    content: string;
    timestamp: string;
    isHuman?: boolean;
  }>;
}

function getLiveSessions(): LiveChatSession[] {
  try {
    const raw = localStorage.getItem("megatrx_live_chat_sessions");
    return raw ? (JSON.parse(raw) as LiveChatSession[]) : [];
  } catch {
    return [];
  }
}

function saveLiveSessions(sessions: LiveChatSession[]) {
  localStorage.setItem("megatrx_live_chat_sessions", JSON.stringify(sessions));
}

function upsertSessionMessage(
  sessionId: string,
  role: "customer" | "admin",
  content: string,
  customerName?: string,
  customerEmail?: string,
  isEscalated?: boolean,
) {
  const sessions = getLiveSessions();
  const existing = sessions.find((s) => s.id === sessionId);
  const newMsg = { role, content, timestamp: new Date().toISOString() };
  if (existing) {
    existing.messages.push(newMsg);
    existing.lastSeen = new Date().toISOString();
    if (customerName && role === "customer") {
      existing.customerName = customerName;
    }
    if (customerEmail) {
      existing.customerEmail = customerEmail;
    }
    if (isEscalated) {
      existing.isEscalated = true;
    }
  } else {
    sessions.push({
      id: sessionId,
      customerName: customerName || "Customer",
      customerEmail: customerEmail,
      lastSeen: new Date().toISOString(),
      isEscalated: isEscalated || false,
      messages: [newMsg],
    });
  }
  saveLiveSessions(sessions);
}

function getAdminRepliesForSession(
  sessionId: string,
  afterIndex: number,
): Array<{ content: string; timestamp: string; isHuman?: boolean }> {
  const sessions = getLiveSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return [];
  return session.messages
    .filter((m) => m.role === "admin")
    .slice(afterIndex)
    .map((m) => ({
      content: m.content,
      timestamp: m.timestamp,
      isHuman: m.isHuman,
    }));
}

async function fetchAIResponse(messages: ChatMessage[]): Promise<string> {
  const lastUserMsg = messages.filter((m) => m.role === "user").slice(-1)[0];
  const userText = lastUserMsg?.content ?? "";

  const systemPrompt =
    "You are a friendly customer support assistant for MEGATRX, a graphic design and custom merchandise company. We make custom T-shirts, hoodies, sweaters, mugs, tumblers, business cards, photo books, posters, stickers, iPhone cases, and event invitations. Prices: T-shirts from $25, mugs $15, business cards $20/100, photo books $35, sweaters $40, tumblers $20, iPhone cases from $18. We offer custom design services. Always be warm, concise, and helpful. Encourage browsing the shop or submitting a custom design request.";

  // Try GET endpoint first (most reliable)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const fullPrompt = `${systemPrompt}\n\nCustomer: ${userText}\n\nAssistant:`;
    const res = await fetch(
      `https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}`,
      { signal: controller.signal },
    );
    clearTimeout(timeout);
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 5) return text.trim();
    }
  } catch {
    // fall through to POST
  }

  // Try POST to Pollinations
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userText },
        ],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const text =
        data?.choices?.[0]?.message?.content ||
        data?.text ||
        data?.response ||
        "";
      if (text && text.trim().length > 5) return text.trim();
    }
  } catch {
    // fall through to local
  }

  // Smart local fallback — always returns something useful
  const lower = userText.toLowerCase();
  if (
    lower.includes("iphone") ||
    lower.includes("case") ||
    lower.includes("phone")
  ) {
    return "We make custom iPhone cases in multiple sizes including iPhone 13, 14, 15, and Pro Max models! You can add your own design, logo, or photo. Cases start at $18. Want to place an order?";
  }
  if (
    lower.includes("price") ||
    lower.includes("cost") ||
    lower.includes("how much")
  ) {
    return "Our pricing: T-shirts from $25 · Mugs $15 · Business Cards $20/100 · Photo Books $35 · Sweaters $40 · Tumblers $20 · iPhone Cases $18 · Stickers from $10. Custom design work is quoted by project. Want a custom quote?";
  }
  if (
    lower.includes("t-shirt") ||
    lower.includes("tshirt") ||
    lower.includes("shirt")
  ) {
    return "Our custom T-shirts start at $25. Available in sizes S, M, L, XL, and XXL. You can add any design, logo, or artwork. We print front, back, and sleeves. Ready to order?";
  }
  if (
    lower.includes("mug") ||
    lower.includes("cup") ||
    lower.includes("coffee")
  ) {
    return "Custom mugs start at $15 and come in 11oz and 15oz sizes. Full wraparound print available. Great for gifts! Want to add one to your cart?";
  }
  if (
    lower.includes("custom") ||
    lower.includes("design") ||
    lower.includes("logo")
  ) {
    return "We love custom work! You can use the 'Request Custom Design' button to submit your idea, reference images, and any text you want. Our team will get back to you quickly with a quote.";
  }
  if (
    lower.includes("ship") ||
    lower.includes("deliver") ||
    lower.includes("how long")
  ) {
    return "We ship via USPS and UPS. Standard delivery is 5–7 business days. Rush options are available. You'll get a tracking number by email once your order ships!";
  }
  if (lower.includes("track") || lower.includes("where is my order")) {
    return "Once your order ships, we'll email you a tracking number. You can also check your order status in your account page. Need help with a specific order?";
  }
  if (
    lower.includes("return") ||
    lower.includes("refund") ||
    lower.includes("cancel")
  ) {
    return "Since all our items are custom-made, we accept returns for defects or errors on our end. If there's an issue with your order, please contact us and we'll make it right!";
  }
  if (lower.includes("business card")) {
    return "Custom business cards start at $20 for 100 cards. Full color, both sides available. Multiple finishes: matte, gloss, and soft-touch. Want to order some?";
  }
  if (lower.includes("sweater") || lower.includes("hoodie")) {
    return "Custom sweaters and hoodies start at $40. Available in sizes S–XXL with full custom print. Perfect for teams, events, or gifts!";
  }
  if (
    lower.includes("hello") ||
    lower.includes("hi ") ||
    lower.includes("hey")
  ) {
    return "Hey! Welcome to MEGATRX! I'm here to help with products, pricing, custom orders, or any questions. What can I help you with today?";
  }
  return "Thanks for reaching out to MEGATRX! We specialize in custom merch, apparel, and graphic design. You can browse our shop, submit a custom design request, or ask me anything. How can I help?";
}

export default function ChatWidget() {
  const { actor } = useActor();
  const { openModal } = useDesignModal();
  const [savedLogo, setSavedLogo] = useState(
    () => localStorage.getItem("megatrx_logo") || "",
  );
  const sessionId = getOrCreateSessionId();
  const [seenAdminReplies, setSeenAdminReplies] = useState(0);

  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"chat" | "escalation">("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Escalation form
  const [escalationName, setEscalationName] = useState("");
  const [escalationEmail, setEscalationEmail] = useState("");
  const [escalationMessage, setEscalationMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [escalationSent, setEscalationSent] = useState(false);
  // Track if currently in human mode (escalated + waiting for human reply)
  const [humanMode, setHumanMode] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Listen for external open requests (e.g. "Chat with Us" button on homepage)
  useEffect(() => {
    const handler = () => {
      setIsOpen(true);
    };
    window.addEventListener("openMegatrxChat", handler);
    return () => window.removeEventListener("openMegatrxChat", handler);
  }, []);

  // Update logo when it changes in localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      const current = localStorage.getItem("megatrx_logo") || "";
      setSavedLogo((prev) => (prev !== current ? current : prev));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Poll for admin replies every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const adminReplies = getAdminRepliesForSession(
        sessionId,
        seenAdminReplies,
      );
      if (adminReplies.length > 0) {
        setSeenAdminReplies((prev) => prev + adminReplies.length);
        // Filter out AI bot replies (those prefixed with [AI Bot])
        const humanReplies = adminReplies.filter(
          (r) => !r.content.startsWith("[AI Bot]"),
        );
        if (humanReplies.length > 0) {
          setMessages((prev) => [
            ...prev,
            ...humanReplies.map((r) => ({
              id: generateId(),
              role: "assistant" as const,
              content: r.content,
              timestamp: new Date(r.timestamp),
              isHuman: true,
            })),
          ]);
          // Auto-open chat if it was closed
          setIsOpen(true);
          setView("chat");
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [sessionId, seenAdminReplies]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  });

  useEffect(() => {
    if (isOpen && view === "chat" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, view]);

  // Pre-fill escalation with chat context
  function openEscalation() {
    const recentContext = messages
      .slice(-6)
      .filter((m) => m.role !== "system-info")
      .map((m) => `${m.role === "user" ? "Customer" : "Support"}: ${m.content}`)
      .join("\n");
    setEscalationMessage(recentContext);
    setView("escalation");
  }

  const processFiles = useCallback((fileList: FileList) => {
    const newFiles: AttachedFile[] = [];
    for (const file of fileList) {
      if (newFiles.length >= 3) break;
      newFiles.push({
        name: file.name,
        type: file.type,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
      });
    }
    setAttachedFiles((prev) => {
      const combined = [...prev, ...newFiles];
      return combined.slice(0, 3);
    });
  }, []);

  function removeFile(index: number) {
    setAttachedFiles((prev) => {
      const updated = [...prev];
      const file = updated[index];
      if (file.preview) URL.revokeObjectURL(file.preview);
      updated.splice(index, 1);
      return updated;
    });
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
    },
    [processFiles],
  );

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed && attachedFiles.length === 0) return;

    const userContent =
      attachedFiles.length > 0
        ? `${trimmed}${trimmed ? "\n" : ""}[Attached files: ${attachedFiles.map((f) => f.name).join(", ")}]`
        : trimmed;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: "user",
      content: userContent,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setAttachedFiles([]);

    // Save customer message to live session so admin can see it
    upsertSessionMessage(sessionId, "customer", userContent);

    // Check if customer wants to talk to a human
    if (wantsHuman(userContent)) {
      setIsTyping(true);
      // Small delay to feel natural
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsTyping(false);

      const botMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content:
          "Of course! I'll connect you with a real MEGATRX team member. Please fill out the short form below so we know how to reach you.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      upsertSessionMessage(sessionId, "admin", `[AI Bot] ${botMsg.content}`);

      // Auto-open escalation form after a moment
      setTimeout(() => {
        openEscalation();
      }, 1200);
      return;
    }

    // If in human mode (admin is chatting), don't let AI respond
    if (humanMode) {
      return;
    }

    setIsTyping(true);

    try {
      const reply = await fetchAIResponse(updatedMessages);
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content: reply,
          timestamp: new Date(),
        },
      ]);
      // Save AI reply to session for context
      upsertSessionMessage(sessionId, "admin", `[AI Bot] ${reply}`);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content:
            "I'm having a connection issue right now. Please try again in a moment, or use the 'Talk to a human' button below.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  async function submitEscalation(e: React.FormEvent) {
    e.preventDefault();
    if (!escalationName || !escalationEmail) return;

    setIsSubmitting(true);
    try {
      // Mark session as escalated with customer info
      upsertSessionMessage(
        sessionId,
        "customer",
        `[HUMAN REQUESTED] Name: ${escalationName}, Email: ${escalationEmail}. Message: ${escalationMessage}`,
        escalationName,
        escalationEmail,
        true, // isEscalated
      );

      // Also try to save via actor if available
      if (actor) {
        try {
          await actor.addCustomDesignRequest(
            escalationName,
            escalationEmail,
            "Chat Escalation",
            escalationMessage,
            "",
            attachedFiles.map((f) => f.name),
            new Date().toISOString(),
            true,
          );
        } catch {
          // ignore backend error, we already saved to localStorage
        }
      }

      setEscalationSent(true);
      setHumanMode(true);

      // Add a message in the chat indicating human mode is active
      const humanWaitMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content:
          "Your request has been received! A MEGATRX team member will join this chat shortly. You'll see their replies appear here directly.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, humanWaitMsg]);
    } catch {
      setEscalationSent(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // Logo source with fallback chain
  const logoSrc =
    savedLogo ||
    "/assets/uploads/Rebellious-Lettermark-for-Music-Brand-MEGATRAX-3-1.PNG";

  return (
    <>
      {/* Floating Chat Bubble */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            type="button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-110 transition-transform"
            aria-label="Open chat"
            data-ocid="chat.open_modal_button"
          >
            <MessageSquare className="w-6 h-6 text-primary-foreground" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-6 right-6 z-[100] w-[360px] max-w-[calc(100vw-3rem)] h-[520px] max-h-[calc(100vh-5rem)] flex flex-col rounded-xl border border-border bg-card shadow-2xl shadow-black/40 overflow-hidden"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Drag overlay */}
            {isDragging && (
              <div className="absolute inset-0 bg-primary/20 border-2 border-dashed border-primary rounded-xl z-10 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-primary">
                    Drop files here
                  </p>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground shrink-0">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                {view === "escalation" && (
                  <button
                    type="button"
                    onClick={() => setView("chat")}
                    className="hover:opacity-80 transition-opacity"
                    aria-label="Back to chat"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={logoSrc}
                    alt="MEGATRX"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const el = e.currentTarget;
                      if (!el.dataset.fallback) {
                        el.dataset.fallback = "1";
                        el.src =
                          "/assets/uploads/Rebellious-Lettermark-for-Music-Brand-MEGATRAX-4-2.PNG";
                      } else {
                        el.style.display = "none";
                      }
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold tracking-tight">
                    MEGATRX Support
                  </p>
                  <p className="text-xs opacity-70 truncate">
                    {humanMode
                      ? "Connected to a real person"
                      : view === "escalation"
                        ? "Contact a human"
                        : "Typically replies instantly"}
                  </p>
                </div>
                {humanMode ? (
                  <span className="ml-auto mr-2 text-[10px] font-mono bg-green-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shrink-0">
                    <UserCheck className="w-3 h-3" />
                    HUMAN
                  </span>
                ) : (
                  <span className="ml-auto mr-2 text-[10px] font-mono bg-primary-foreground/20 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                    AI
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="hover:opacity-80 transition-opacity ml-2 shrink-0"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat View */}
            {view === "chat" && (
              <>
                {/* Messages */}
                <div
                  className="flex-1 overflow-y-auto p-4 space-y-3"
                  style={{ minHeight: "350px" }}
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {msg.role !== "user" && (
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${msg.isHuman ? "bg-green-500/20 border border-green-500/40" : "bg-primary/20 border border-primary/30"}`}
                        >
                          {msg.isHuman ? (
                            <UserCheck className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <Bot className="w-3.5 h-3.5 text-primary" />
                          )}
                        </div>
                      )}
                      {msg.role === "user" && (
                        <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex flex-col gap-0.5 max-w-[75%]">
                        {msg.isHuman && msg.role === "assistant" && (
                          <span className="text-[10px] font-mono text-green-500 px-1 flex items-center gap-1">
                            <UserCheck className="w-2.5 h-2.5" />
                            MEGATRX Team (Real Person)
                          </span>
                        )}
                        <div
                          className={`rounded-xl px-3 py-2 text-[14px] leading-relaxed ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground rounded-tr-sm"
                              : msg.isHuman
                                ? "bg-green-500/10 border border-green-500/20 text-foreground rounded-tl-sm"
                                : "bg-muted text-foreground rounded-tl-sm"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Human mode active banner */}
                  {humanMode && (
                    <div className="flex items-center justify-center gap-2 py-2 px-3 bg-green-500/10 border border-green-500/20 rounded-lg text-xs font-mono text-green-500">
                      <UserCheck className="w-3.5 h-3.5" />
                      You&apos;re now chatting with a MEGATRX Team Member
                    </div>
                  )}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="bg-muted rounded-xl rounded-tl-sm px-3 py-3 flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Attached files preview */}
                {attachedFiles.length > 0 && (
                  <div className="px-3 py-2 border-t border-border bg-muted/30 flex flex-wrap gap-1.5">
                    {attachedFiles.map((file, i) => (
                      <div
                        key={`${file.name}-${i}`}
                        className="flex items-center gap-1 bg-card border border-border rounded px-2 py-0.5 text-xs"
                      >
                        {file.preview ? (
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="w-4 h-4 object-cover rounded"
                          />
                        ) : (
                          <Paperclip className="w-3 h-3 text-muted-foreground" />
                        )}
                        <span className="max-w-[80px] truncate font-mono">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input area */}
                <div className="border-t border-border p-3 shrink-0 bg-card/80">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                      aria-label="Attach file"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files && processFiles(e.target.files)
                      }
                    />
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        humanMode
                          ? "Send a message to the MEGATRX team..."
                          : "Ask me anything..."
                      }
                      className="flex-1 bg-background/50 border-border text-sm h-9"
                      disabled={isTyping}
                      data-ocid="chat.input"
                    />
                    <button
                      type="button"
                      onClick={sendMessage}
                      disabled={
                        isTyping ||
                        (!input.trim() && attachedFiles.length === 0)
                      }
                      className="text-primary hover:text-primary/80 transition-colors disabled:opacity-30 shrink-0"
                      aria-label="Send message"
                      data-ocid="chat.primary_button"
                    >
                      {isTyping ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {!humanMode && (
                    <div className="flex items-center justify-between mt-2">
                      <button
                        type="button"
                        onClick={openEscalation}
                        className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
                        data-ocid="chat.secondary_button"
                      >
                        👤 Talk to a human
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          openModal();
                        }}
                        className="text-[11px] text-primary hover:text-primary/80 transition-colors"
                      >
                        ✏️ Custom design request
                      </button>
                    </div>
                  )}
                  {humanMode && (
                    <p className="text-[10px] text-green-500 mt-1.5 font-mono flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      You are chatting with a real MEGATRX team member
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Escalation View */}
            {view === "escalation" && (
              <div className="flex-1 overflow-y-auto p-4">
                {escalationSent ? (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                      <UserCheck className="w-7 h-7 text-green-500" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground mb-1">
                        Request Sent!
                      </p>
                      <p className="text-sm text-muted-foreground">
                        A real MEGATRX team member will join this chat. Their
                        replies will appear directly in the chat window.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setView("chat");
                        setEscalationSent(false);
                        setEscalationName("");
                        setEscalationEmail("");
                        setEscalationMessage("");
                      }}
                    >
                      Back to Chat
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={submitEscalation} className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="w-4 h-4 text-primary" />
                        <p className="font-semibold text-sm text-foreground">
                          Connect with a Real Person
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Fill out the form below. A real MEGATRX team member —
                        not a bot — will get back to you directly.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Label className="font-mono text-xs uppercase text-muted-foreground">
                        Name *
                      </Label>
                      <Input
                        value={escalationName}
                        onChange={(e) => setEscalationName(e.target.value)}
                        placeholder="Your name"
                        required
                        className="bg-background/50 h-9 text-sm"
                        data-ocid="escalation.input"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="font-mono text-xs uppercase text-muted-foreground">
                        Email *
                      </Label>
                      <Input
                        type="email"
                        value={escalationEmail}
                        onChange={(e) => setEscalationEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="bg-background/50 h-9 text-sm"
                        data-ocid="escalation.input"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="font-mono text-xs uppercase text-muted-foreground">
                        Message
                      </Label>
                      <Textarea
                        value={escalationMessage}
                        onChange={(e) => setEscalationMessage(e.target.value)}
                        className="bg-background/50 text-sm min-h-[80px] resize-none"
                        placeholder="Describe what you need help with..."
                        data-ocid="escalation.textarea"
                      />
                    </div>

                    {/* Attached files carry over */}
                    {attachedFiles.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {attachedFiles.map((file, i) => (
                          <div
                            key={`esc-${file.name}-${i}`}
                            className="flex items-center gap-1 bg-muted border border-border rounded px-2 py-0.5 text-xs"
                          >
                            <Paperclip className="w-3 h-3 text-muted-foreground" />
                            <span className="max-w-[80px] truncate font-mono">
                              {file.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={
                        isSubmitting || !escalationName || !escalationEmail
                      }
                      className="w-full gap-2"
                      data-ocid="escalation.submit_button"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )}
                      Connect Me with a Real Person
                    </Button>
                  </form>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
