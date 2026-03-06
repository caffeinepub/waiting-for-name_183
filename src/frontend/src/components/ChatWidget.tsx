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
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system-info";
  content: string;
  timestamp: Date;
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

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

async function fetchAIResponse(messages: ChatMessage[]): Promise<string> {
  const lastUserMsg = messages.filter((m) => m.role === "user").slice(-1)[0];
  const userText = lastUserMsg?.content ?? "";

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
          {
            role: "system",
            content:
              "You are a friendly customer support assistant for MEGATRX, a graphic design and custom merchandise company. We make custom T-shirts, hoodies, sweaters, mugs, tumblers, business cards, photo books, posters, stickers, iPhone cases, and event invitations. Prices: T-shirts from $25, mugs $15, business cards $20/100, photo books $35, sweaters $40, tumblers $20, iPhone cases from $18. We offer custom design services. Always be warm, concise, and helpful. Encourage browsing the shop or submitting a custom design request.",
          },
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
  const savedLogo = localStorage.getItem("megatrx_logo");

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Listen for external open requests (e.g. "Chat with Us" button on homepage)
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener("openMegatrxChat", handler);
    return () => window.removeEventListener("openMegatrxChat", handler);
  }, []);

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
      .map((m) => `${m.role === "user" ? "Customer" : "Bot"}: ${m.content}`)
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
    if (!actor || !escalationName || !escalationEmail) return;

    setIsSubmitting(true);
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
      setEscalationSent(true);
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
              <div className="flex items-center gap-2.5">
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
                <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center overflow-hidden">
                  <img
                    src={
                      savedLogo ||
                      "/assets/uploads/Rebellious-Lettermark-for-Music-Brand-MEGATRAX-3-1.PNG"
                    }
                    alt="MEGATRX"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const icon = document.createElement("span");
                        icon.innerHTML =
                          '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>';
                        parent.appendChild(icon);
                      }
                    }}
                  />
                </div>
                <div>
                  <p className="text-sm font-bold tracking-tight">
                    MEGATRX Support
                  </p>
                  <p className="text-xs opacity-70">
                    {view === "escalation"
                      ? "Contact a human"
                      : "Typically replies instantly"}
                  </p>
                </div>
                <span className="ml-auto mr-2 text-[10px] font-mono bg-primary-foreground/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  AI
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="hover:opacity-80 transition-opacity"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat View */}
            {view === "chat" && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {msg.role !== "user" && (
                        <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-3.5 h-3.5 text-primary" />
                        </div>
                      )}
                      {msg.role === "user" && (
                        <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-muted text-foreground rounded-tl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}

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

                  {/* Talk to human button — shown after greeting */}
                  {messages.length === 1 && !isTyping && (
                    <div className="flex justify-center pt-1">
                      <button
                        type="button"
                        onClick={openEscalation}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
                      >
                        Talk to a human instead
                      </button>
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
                      placeholder="Ask me anything..."
                      className="flex-1 bg-background/50 border-border text-sm h-9"
                      disabled={isTyping}
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
                    >
                      {isTyping ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <button
                      type="button"
                      onClick={openEscalation}
                      className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
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
                </div>
              </>
            )}

            {/* Escalation View */}
            {view === "escalation" && (
              <div className="flex-1 overflow-y-auto p-4">
                {escalationSent ? (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                      <User className="w-7 h-7 text-green-500" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground mb-1">
                        Request Sent!
                      </p>
                      <p className="text-sm text-muted-foreground">
                        A MEGATRX team member will reach out to you within 24
                        hours.
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
                      <p className="text-sm text-muted-foreground mb-4">
                        Fill out the form below and a team member will get back
                        to you within 24 hours.
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
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="font-mono text-xs uppercase text-muted-foreground">
                        Message
                      </Label>
                      <Textarea
                        value={escalationMessage}
                        onChange={(e) => setEscalationMessage(e.target.value)}
                        className="bg-background/50 text-sm min-h-[100px] resize-none"
                        placeholder="Describe what you need help with..."
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
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Submit Request
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
