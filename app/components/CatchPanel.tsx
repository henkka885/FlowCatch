"use client";

import type { FileItem } from "../lib/types";

interface CatchPanelProps {
  catchMode: boolean;
  catchStart: number | null;
  catchEnd: number | null;
  showCatchPanel: boolean;
  catchFileName: string;
  catchTargetFile: "new" | number;
  files: FileItem[];
  onCatchFileNameChange: (v: string) => void;
  onCatchTargetChange: (v: "new" | number) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function CatchPanel({
  catchMode, catchStart, catchEnd,
  showCatchPanel, catchFileName, catchTargetFile,
  files, onCatchFileNameChange, onCatchTargetChange, onSave, onCancel,
}: CatchPanelProps) {
  const count = catchStart !== null && catchEnd !== null
    ? Math.abs(catchEnd - catchStart) + 1
    : null;

  return (
    <>
      {catchMode && (
        <div style={{
          padding: "8px 16px", background: "#d1fae5",
          borderBottom: "2px solid #10b981", fontSize: 13, flexShrink: 0,
        }}>
          {catchStart === null
            ? "👆 Klikkaa ensimmäistä viestiä josta tallennus alkaa"
            : catchEnd === null
            ? "✅ Aloitusviesti valittu — klikkaa nyt lopetusviesti"
            : `✅ ${count} viestiä valittu — valitse kohde`}
        </div>
      )}

      {showCatchPanel && (
        <div style={{
          padding: "10px 16px", background: "#f0fdf4",
          borderBottom: "2px solid #10b981", flexShrink: 0,
          display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center",
        }}>
          <strong style={{ fontSize: 13 }}>💾 Tallenna ajatusvirta:</strong>

          <label style={{ fontSize: 13, cursor: "pointer", display: "flex", gap: 4, alignItems: "center" }}>
            <input type="radio" checked={catchTargetFile === "new"}
              onChange={() => onCatchTargetChange("new")} />
            Uusi tiedosto
          </label>

          {files.length > 0 && (
            <label style={{ fontSize: 13, cursor: "pointer", display: "flex", gap: 4, alignItems: "center" }}>
              <input type="radio" checked={catchTargetFile !== "new"}
                onChange={() => onCatchTargetChange(0)} />
              Liitä olemassa olevaan
            </label>
          )}

          {catchTargetFile === "new" ? (
            <input
              autoFocus
              placeholder="tiedoston-nimi.md"
              value={catchFileName}
              onChange={(e) => onCatchFileNameChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onSave(); }}
              style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }}
            />
          ) : (
            <select
              value={catchTargetFile as number}
              onChange={(e) => onCatchTargetChange(Number(e.target.value))}
              style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }}
            >
              {files.map((f, i) => <option key={i} value={i}>{f.name}</option>)}
            </select>
          )}

          <button onClick={onSave} style={{
            padding: "4px 14px", background: "#10b981", color: "#fff",
            border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold", fontSize: 13,
          }}>💾 Tallenna</button>

          <button onClick={onCancel} style={{
            padding: "4px 10px", background: "#f3f4f6",
            border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13,
          }}>Peruuta</button>
        </div>
      )}
    </>
  );
}