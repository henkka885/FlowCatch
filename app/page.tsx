"use client";

import { useState, useEffect } from "react";
import { KEYS, load, save } from "./lib/storage";
import { buildPrompt } from "./lib/prompt";
import { TopBar } from "./components/TopBar";
import { CatchPanel } from "./components/CatchPanel";
import { ChatView } from "./components/ChatView";
import { FilesView } from "./components/FilesView";
import type { FileItem, Message, AppMode, AppView } from "./lib/types";

export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentFile, setCurrentFile] = useState<number | null>(null);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AppMode>("chat");
  const [view, setView] = useState<AppView>("chat");

  const [catchMode, setCatchMode] = useState(false);
  const [catchStart, setCatchStart] = useState<number | null>(null);
  const [catchEnd, setCatchEnd] = useState<number | null>(null);
  const [showCatchPanel, setShowCatchPanel] = useState(false);
  const [catchFileName, setCatchFileName] = useState("");
  const [catchTargetFile, setCatchTargetFile] = useState<"new" | number>("new");
  const [memory, setMemory] = useState<string>("");

  useEffect(() => {
    setFiles(load<FileItem[]>(KEYS.files, []));
    setMessages(load<Message[]>(KEYS.messages, []));
    setCurrentFile(load<number | null>(KEYS.currentFile, null));
    setHydrated(true);
    setMemory(load<string>(KEYS.memory, ""));
  }, []);

  useEffect(() => { if (hydrated) save(KEYS.files, files); }, [files, hydrated]);
  useEffect(() => { if (hydrated) save(KEYS.messages, messages); }, [messages, hydrated]);
  useEffect(() => { if (hydrated) save(KEYS.currentFile, currentFile); }, [currentFile, hydrated]);

  const toggleCatch = () => {
    setCatchMode((v) => !v);
    setCatchStart(null);
    setCatchEnd(null);
    setShowCatchPanel(false);
  };

  const handleMessageClick = (i: number) => {
    if (!catchMode) return;
    if (catchStart === null) {
      setCatchStart(i);
    } else if (catchEnd === null && i !== catchStart) {
      setCatchEnd(i);
      setShowCatchPanel(true);
    } else {
      setCatchStart(i);
      setCatchEnd(null);
      setShowCatchPanel(false);
    }
  };

  const saveCatch = () => {
    if (catchStart === null) return;
    const end = catchEnd ?? catchStart;
    const from = Math.min(catchStart, end);
    const to = Math.max(catchStart, end);
    const text = messages
      .slice(from, to + 1)
      .map((m) => `[${m.role === "user" ? "Minä" : "AI"}]\n${m.text}`)
      .join("\n\n---\n\n");

    if (catchTargetFile === "new") {
      if (!catchFileName.trim()) return;
      setFiles((f) => {
        const updated = [...f, { name: catchFileName.trim(), content: text }];
        setCurrentFile(updated.length - 1);
        return updated;
      });
    } else {
      setFiles((f) =>
        f.map((file, i) =>
          i === catchTargetFile
            ? { ...file, content: file.content ? file.content + "\n\n---\n\n" + text : text }
            : file
        )
      );
      setCurrentFile(catchTargetFile as number);
    }
    setCatchMode(false);
    setCatchStart(null);
    setCatchEnd(null);
    setShowCatchPanel(false);
    setCatchFileName("");
  };

  const createFile = (name: string) => {
    setFiles((f) => {
      const updated = [...f, { name, content: "" }];
      setCurrentFile(updated.length - 1);
      return updated;
    });
    setView("files");
  };

  const updateFile = (i: number, content: string) => {
    setFiles((f) => f.map((file, idx) => idx === i ? { ...file, content } : file));
  };

  const deleteFile = (i: number) => {
    setFiles((f) => f.filter((_, idx) => idx !== i));
    setCurrentFile(null);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    setMessages((m) => [...m, { role: "user", text: input }]);
    setInput("");
    setLoading(true);

    const prompt = buildPrompt(input, mode, currentFile, files);
let data: any = null;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
            message: prompt,
            mode,
            history: mode === "chat" ? messages : [],
            memory: memory,
          }),
        });
      const data = await res.json();

      const cleaned = (data.text || "")
        .replace(/^```[\w]*\n?/gm, "")
        .replace(/```$/gm, "")
        .trim();

      setMessages((m) => [...m, { role: "ai", text: cleaned }]);

      if (mode === "edit" && currentFile !== null) {
        updateFile(currentFile, cleaned);
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "ai", text: `Virhe: ${err instanceof Error ? err.message : "Tuntematon"}` },
      ]);
      } finally {
          if (data.updatedMemory) {
            setMemory(data.updatedMemory);
            save(KEYS.memory, data.updatedMemory);
          }
          setLoading(false);
    }
  };

  if (!hydrated) {
    return (
      <div style={{
        display: "flex", height: "100vh",
        alignItems: "center", justifyContent: "center",
        fontFamily: "system-ui", color: "#9ca3af", fontSize: 16,
      }}>
        ✂️ FlowCatch ladataan...
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh",
      fontFamily: "system-ui, monospace", background: "#f9fafb",
    }}>
      <TopBar catchMode={catchMode} onCatchToggle={toggleCatch} />

      <CatchPanel
        catchMode={catchMode}
        catchStart={catchStart}
        catchEnd={catchEnd}
        showCatchPanel={showCatchPanel}
        catchFileName={catchFileName}
        catchTargetFile={catchTargetFile}
        files={files}
        onCatchFileNameChange={setCatchFileName}
        onCatchTargetChange={setCatchTargetFile}
        onSave={saveCatch}
        onCancel={() => { setShowCatchPanel(false); setCatchStart(null); setCatchEnd(null); }}
      />

      <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", background: "#fff", flexShrink: 0 }}>
        {(["chat", "files"] as AppView[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setView(tab)}
            style={{
              flex: 1, padding: "10px 0", border: "none", cursor: "pointer",
              background: "transparent", fontSize: 14,
              fontWeight: view === tab ? 700 : 400,
              borderBottom: view === tab ? "3px solid #4f46e5" : "3px solid transparent",
              color: view === tab ? "#4f46e5" : "#6b7280",
            }}
          >
            {tab === "chat" ? "💬 Chat" : `📁 Tiedostot${files.length > 0 ? ` (${files.length})` : ""}`}
          </button>
        ))}
      </div>

      {view === "chat" && (
        <ChatView
          messages={messages}
          input={input}
          loading={loading}
          mode={mode}
          currentFile={currentFile}
          files={files}
          catchMode={catchMode}
          catchStart={catchStart}
          catchEnd={catchEnd}
          onInputChange={setInput}
          onSend={sendMessage}
          onModeChange={setMode}
          onMessageClick={handleMessageClick}
        />
      )}

      {view === "files" && (
        <FilesView
          files={files}
          currentFile={currentFile}
          onSelectFile={setCurrentFile}
          onCreateFile={createFile}
          onUpdateFile={updateFile}
          onDeleteFile={deleteFile}
          onEditWithAI={() => { setMode("edit"); setView("chat"); }}
        />
      )}
    </div>
  );
}