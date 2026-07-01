"use client";

import { useState } from "react";
import type { FileItem } from "../lib/types";

interface FilesViewProps {
  files: FileItem[];
  currentFile: number | null;
  onSelectFile: (i: number) => void;
  onCreateFile: (name: string) => void;
  onUpdateFile: (i: number, content: string) => void;
  onDeleteFile: (i: number) => void;
  onEditWithAI: () => void;
}

export function FilesView({
  files, currentFile,
  onSelectFile, onCreateFile, onUpdateFile, onDeleteFile, onEditWithAI,
}: FilesViewProps) {
  const [newFileName, setNewFileName] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleCreate = () => {
    if (!newFileName.trim()) return;
    onCreateFile(newFileName.trim());
    setNewFileName("");
    setShowInput(false);
  };

  const activeFile = currentFile !== null ? files[currentFile] : null;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

      <div style={{
        padding: "10px 16px", borderBottom: "1px solid #e5e7eb",
        background: "#fff", flexShrink: 0, display: "flex", gap: 8, flexWrap: "wrap",
        alignItems: "center",
      }}>
        {showInput ? (
          <>
            <input
              autoFocus
              placeholder="tiedoston-nimi.js"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") setShowInput(false);
              }}
              style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }}
            />
            <button onClick={handleCreate} style={{
              padding: "5px 12px", background: "#4f46e5", color: "#fff",
              border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13,
            }}>✓ Luo</button>
            <button onClick={() => setShowInput(false)} style={{
              padding: "5px 10px", background: "#f3f4f6",
              border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13,
            }}>✗</button>
          </>
        ) : (
          <button onClick={() => setShowInput(true)} style={{
            padding: "5px 14px", background: "#f9fafb",
            border: "1px dashed #d1d5db", borderRadius: 6, cursor: "pointer", fontSize: 13,
          }}>+ Uusi tiedosto</button>
        )}

        {files.map((f, i) => (
          <button
            key={i}
            onClick={() => onSelectFile(i)}
            style={{
              padding: "5px 12px", fontSize: 13,
              background: currentFile === i ? "#ede9fe" : "#f9fafb",
              border: `1px solid ${currentFile === i ? "#8b5cf6" : "#e5e7eb"}`,
              borderRadius: 6, cursor: "pointer",
              fontWeight: currentFile === i ? 700 : 400,
              color: currentFile === i ? "#4f46e5" : "#374151",
            }}
          >
            📄 {f.name}
          </button>
        ))}
      </div>

      {activeFile ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: 16 }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 8,
          }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>✏️ {activeFile.name}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onEditWithAI} style={{
                padding: "4px 12px", background: "#f59e0b", color: "#fff",
                border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: "bold",
              }}>✏️ Muokkaa AI:lla → Chat</button>
              <button
                onClick={() => {
                  if (currentFile !== null && confirm(`Poistetaanko "${activeFile.name}"?`)) {
                    onDeleteFile(currentFile);
                  }
                }}
                style={{
                  padding: "4px 10px", background: "#fee2e2", color: "#dc2626",
                  border: "1px solid #fca5a5", borderRadius: 6, cursor: "pointer", fontSize: 12,
                }}
              >🗑️</button>
            </div>
          </div>
          <textarea
            value={activeFile.content}
            onChange={(e) => currentFile !== null && onUpdateFile(currentFile, e.target.value)}
            style={{
              flex: 1, width: "100%", fontFamily: "monospace", fontSize: 13,
              padding: 12, border: "1px solid #e5e7eb", borderRadius: 8,
              resize: "none", boxSizing: "border-box", background: "#fff",
              outline: "none", lineHeight: 1.6,
            }}
            placeholder="Liitä koodi tähän tai luo se AI:lla Chat → Edit-moodissa..."
          />
        </div>
      ) : (
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          color: "#9ca3af", fontSize: 14, flexDirection: "column", gap: 8,
        }}>
          <div style={{ fontSize: 40 }}>📁</div>
          <div>Valitse tiedosto ylhäältä tai luo uusi</div>
        </div>
      )}
    </div>
  );
}