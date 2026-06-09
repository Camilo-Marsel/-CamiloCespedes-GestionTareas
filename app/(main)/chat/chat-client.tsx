"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { BubbleChatIcon, MailSend01Icon, Folder01Icon } from "@hugeicons/core-free-icons";

type Message = {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string; role: string };
};

type Project = { id: string; name: string };

interface ChatClientProps {
  userId: string;
}

export default function ChatClient({ userId }: ChatClientProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function fetchProjects() {
    const res = await fetch("/api/projects");
    const data = await res.json();
    const list: Project[] = data.projects || [];
    setProjects(list);
    if (list.length > 0) setProjectId(list[0].id);
  }

  async function fetchMessages() {
    if (!projectId) return;
    const res = await fetch(`/api/chat?projectId=${projectId}`);
    if (!res.ok) return;
    const data = await res.json();
    setMessages(data.messages || []);
  }

  useEffect(() => { fetchProjects(); }, []);
  useEffect(() => { fetchMessages(); }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !projectId) return;
    setSending(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, content: input.trim() }),
    });
    setSending(false);
    if (!res.ok) { toast.error("Error al enviar el mensaje"); return; }
    setInput("");
    fetchMessages();
  }

  const currentProject = projects.find((p) => p.id === projectId);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <HugeiconsIcon icon={BubbleChatIcon} strokeWidth={2} className="size-5 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Chat de proyecto</h1>
          <p className="text-sm text-muted-foreground">Comunicación en tiempo real por proyecto</p>
        </div>
        {/* Project selector */}
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} className="size-4 text-muted-foreground shrink-0" />
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {projects.length === 0 && <option value="">Cargando...</option>}
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto rounded-xl border bg-card/50 p-4 flex flex-col gap-2 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
            <HugeiconsIcon icon={BubbleChatIcon} strokeWidth={1.5} className="size-10 opacity-20" />
            <p className="text-sm">Sin mensajes en este proyecto todavía.</p>
            <p className="text-xs">¡Sé el primero en escribir!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.author.id === userId;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                {!isMe && (
                  <span className="text-[11px] font-semibold text-muted-foreground mb-0.5 ml-1">
                    {msg.author.name}
                    {msg.author.role === "ADMIN" && (
                      <span className="ml-1 rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold text-violet-700">ADMIN</span>
                    )}
                  </span>
                )}
                <div
                  className={`max-w-xs rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-white border rounded-bl-sm text-foreground"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-muted-foreground mt-0.5 mx-1">
                  {new Date(msg.createdAt).toLocaleTimeString("es-CO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={currentProject ? `Mensaje en ${currentProject.name}...` : "Selecciona un proyecto..."}
          disabled={!projectId || sending}
          className="flex-1 h-10 rounded-xl border bg-background px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
          autoComplete="off"
        />
        <Button type="submit" disabled={!input.trim() || !projectId || sending} className="h-10 gap-2 rounded-xl px-4">
          <HugeiconsIcon icon={MailSend01Icon} strokeWidth={2} className="size-4" />
          <span className="hidden sm:inline">Enviar</span>
        </Button>
      </form>
    </div>
  );
}