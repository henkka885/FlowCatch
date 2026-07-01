"use client";

import { useRef, useEffect } from "react";
import type { Message, FileItem, AppMode } from "../lib/types";

interface ChatViewProps {
  messages: Message[];
  input: string;
  loading: boolean;
  mode: AppMode;
  currentFile: number | null;
  files: FileItem[];
  catchMode: boolean;
  catchStart: number | null;
  catchEnd: number | null;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onModeChange: (m: AppMode) => void;
  onMessageClick: (i: number) => void;
}

function isInRange(i: number, start: number | null, end: number | null): boolean {
  if (start === null) return false;
  const e = end ?? start;
  return i >= Math.min(start, e) && i <= Math.max(start, e);
}

export function ChatView({
  messages, input, loading, mode, currentFile, files,
  catchMode, catchStart, catchEnd,
  onInputChange, onSend, onModeChange, onMessageClick,
}: ChatViewProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const activeFile = currentFile !== null ? files[currentFile] : null;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* MOODIPALKKI */}
      <div style={{
        padding: "6px 16px", flexShrink: 0,
        background: mode === "edit" && activeFile ? "#fef3c7" : "#ede9fe",
        borderBottom: `2px solid ${mode === "edit" && activeFile ? "#f59e0b" : "#8b5cf6"}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {(["chat", "edit"] as AppMode[]).map((m) => (
            <button
              key={m}
              onClick={() => m === "edit" && !activeFile ? undefined : onModeChange(m)}
              disabled={m === "edit" && !activeFile}
              title={m === "edit" && !activeFile ? "Avaa tiedosto Files-välilehdeltä" : ""}
              style={{
                padding: "3px 10px", border: "none", borderRadius: 5, fontSize: 12,
                cursor: m === "edit" && !activeFile ? "not-allowed" : "pointer",
                background: mode === m ? (m === "edit" ? "#f59e0b" : "#4f46e5") : "transparent",
                color: mode === m ? "#fff" : "#6b7280",
                fontWeight: "bold",
                opacity: m === "edit" && !activeFile ? 0.4 : 1,
              }}
            >
              {m === "chat" ? "💬 Chat" : "✏️ Edit code"}
            </button>
          ))}
          {mode === "edit" && activeFile && (
            <span style={{ color: "#92400e", fontSize: 12 }}>→ {activeFile.name}</span>
          )}
        </div>
        {mode === "chat" && activeFile && (
          <button
            onClick={() => onModeChange("edit")}
            style={{
              fontSize: 11, padding: "2px 8px", background: "#f59e0b",
              border: "none", borderRadius: 5, cursor: "pointer", fontWeight: "bold",
            }}
          >Vaihda Edit →</button>
        )}
      </div>

      {/* VIESTIT */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "12px 16px",
        display: "flex", flexDirection: "column", gap: 10,
      }}>
        {messages.length === 0 && (
          <div style={{
            color: "#9ca3af", fontSize: 14, textAlign: "center",
            marginTop: 60, lineHeight: 2,
          }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>✂️</div>
            <strong style={{ color: "#374151" }}>Tervetuloa FlowCatchiin!</strong><br />
            Chättäile vapaasti. Tallenna parhaat hetket ✂️ Catch-napilla.<br />
            Avaa kooditiedostoja Files-välilehdeltä ja muokkaa Edit-moodissa.
          </div>
        )}

        {messages.map((m, i) => {
          const inRange = isInRange(i, catchStart, catchEnd);
          const isStart = catchStart === i && catchEnd === null;
          return (
            <div
              key={i}
              onClick={() => onMessageClick(i)}
              title={catchMode ? "Klikkaa valitaksesi" : ""}
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "80%",
                background: inRange ? "#d1fae5" : m.role === "user" ? "#4f46e5" : "#ffffff",
                color: inRange ? "#065f46" : m.role === "user" ? "#fff" : "#111",
                padding: "10px 14px",
                borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                fontSize: 14, whiteSpace: "pre-wrap", wordBreak: "break-word",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                border: inRange ? "2px solid #10b981" : isStart ? "2px solid #34d399" : "2px solid transparent",
                cursor: catchMode ? "pointer" : "default",
                transition: "border 0.1s, background 0.1s",
              }}
            >
              <div style={{ fontSize: 10, opacity: 0.5, marginBottom: 3 }}>
                {catchMode && "✂️ "}{m.role === "user" ? "Sinä" : "AI"}
              </div>
              {m.text}
            </div>
          );
        })}

        {loading && (
          <div style={{
            alignSelf: "flex-start", background: "#fff", padding: "10px 14px",
            borderRadius: "16px 16px 16px 4px", fontSize: 14, color: "#9ca3af",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}>
            ⏳ AI miettii...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT */}
      <div style={{
        padding: "10px 16px", background: "#fff",
        borderTop: "1px solid #e5e7eb", flexShrink: 0,
      }}>
        <div style={{ display: "flex", gap: 8 }}>
          <textarea
            style={{
              flex: 1, padding: "10px 14px", fontSize: 14, height: 56,
              border: `2px solid ${mode === "edit" && activeFile ? "#f59e0b" : "#e5e7eb"}`,
              borderRadius: 12, resize: "none", fontFamily: "inherit", outline: "none",
              background: mode === "edit" && activeFile ? "#fffbeb" : "#f9fafb",
              transition: "border 0.15s, background 0.15s",
            }}
            autoComplete="off"
            name="flowcatch-input"
            id="flowcatch-input"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={
              mode === "edit" && activeFile
                ? `✏️ Mitä muutoksia tiedostoon "${activeFile.name}"?`
                : "💬 Kirjoita viesti... (Shift+Enter = rivinvaihto)"
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
            }}
            disabled={loading}
          />
          <button
            onClick={onSend}
            disabled={loading || !input.trim()}
            style={{
              width: 52, height: 56, flexShrink: 0, fontSize: 20,
              background: loading || !input.trim() ? "#e5e7eb"
                : mode === "edit" && activeFile ? "#f59e0b" : "#4f46e5",
              color: loading || !input.trim() ? "#9ca3af" : "#fff",
              border: "none", borderRadius: 12,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              transition: "background 0.15s",
            }}
          >
            {loading ? "…" : mode === "edit" && activeFile ? "✏️" : "↑"}
          </button>
        </div>
      </div>
    </div>
  );
}