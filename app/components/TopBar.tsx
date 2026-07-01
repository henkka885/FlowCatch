"use client";

interface TopBarProps {
  catchMode: boolean;
  onCatchToggle: () => void;
}

export function TopBar({ catchMode, onCatchToggle }: TopBarProps) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 16px", background: "#fff", borderBottom: "1px solid #e5e7eb",
      flexShrink: 0,
    }}>
      <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>
        ✂️ FlowCatch
      </h1>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#10b981" }}>💾 Auto-tallennus päällä</span>
        <button
          onClick={onCatchToggle}
          style={{
            padding: "5px 14px", fontWeight: "bold", fontSize: 13,
            background: catchMode ? "#10b981" : "#f3f4f6",
            color: catchMode ? "#fff" : "#374151",
            border: `2px solid ${catchMode ? "#10b981" : "#d1d5db"}`,
            borderRadius: 8, cursor: "pointer",
          }}
        >
          {catchMode ? "✂️ Valitse viestit..." : "✂️ Catch"}
        </button>
      </div>
    </div>
  );
}