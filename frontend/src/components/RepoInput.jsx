import React, { useState, useEffect } from "react";

const EXAMPLES = [
  "https://github.com/facebook/react",
  "https://github.com/vercel/next.js",
  "https://github.com/vitejs/vite",
];

const HISTORY_KEY = "devlens_history";

export default function RepoInput({ onAnalyze, loading }) {
  const [url, setUrl] = useState("");
  const [history, setHistory] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      setHistory(saved);
    } catch {}
  }, []);

  const submit = () => {
    if (!url.trim()) return;
    const newHistory = [url.trim(), ...history.filter(h => h !== url.trim())].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    onAnalyze(url.trim());
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  return (
    <div style={{ ...s.wrap, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)" }}>
      <div style={s.badge}>AI-Powered · Groq LLaMA 3.3</div>

      <h1 style={s.title}>
        Decode any<br />
        <span style={s.accent}>GitHub repo</span><br />
        instantly.
      </h1>

      <p style={s.sub}>
        Paste a repo URL. Get architecture breakdown, tech stack analysis,<br />
        code quality score — powered by Groq AI.
      </p>

      <div style={s.inputRow}>
        <div style={s.inputWrap}>
          <span style={s.ghIcon}>⌥</span>
          <input
            style={s.input}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="https://github.com/owner/repo"
            spellCheck={false}
          />
          {url && (
            <button style={s.clearBtn} onClick={() => setUrl("")}>✕</button>
          )}
        </div>
        <button style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} onClick={submit} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze →"}
        </button>
      </div>

      {history.length > 0 && (
        <div style={s.historyWrap}>
          <div style={s.historyHeader}>
            <span style={s.historyLabel}>Recent</span>
            <button style={s.clearHistBtn} onClick={clearHistory}>Clear</button>
          </div>
          <div style={s.historyList}>
            {history.map((h, i) => (
              <button key={i} style={s.historyItem} onClick={() => setUrl(h)}>
                <span style={s.historyIcon}>⟳</span>
                <span style={s.historyText}>{h.replace("https://github.com/", "")}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={s.examples}>
        <span style={s.exLabel}>Try:</span>
        {EXAMPLES.map((ex) => (
          <button key={ex} style={s.exBtn} onClick={() => setUrl(ex)}>
            {ex.replace("https://github.com/", "")}
          </button>
        ))}
      </div>

      <style>{css}</style>
    </div>
  );
}

const s = {
  wrap: {
    maxWidth: "720px", margin: "0 auto",
    padding: "100px 24px 60px", textAlign: "center",
    transition: "opacity 0.6s ease, transform 0.6s ease",
  },
  badge: {
    display: "inline-block", fontFamily: "var(--font-mono)",
    fontSize: "11px", letterSpacing: "0.12em", color: "var(--accent)",
    border: "1px solid rgba(0,217,255,0.3)", borderRadius: "20px",
    padding: "4px 14px", marginBottom: "28px", textTransform: "uppercase",
    background: "rgba(0,217,255,0.05)",
  },
  title: {
    fontSize: "clamp(42px, 8vw, 72px)", fontWeight: "800",
    lineHeight: 1.1, letterSpacing: "-0.03em",
    color: "var(--text)", marginBottom: "20px",
  },
  accent: {
    background: "linear-gradient(135deg, #00d9ff, #7b61ff)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  sub: { fontSize: "16px", color: "var(--muted2)", lineHeight: 1.7, marginBottom: "44px" },
  inputRow: { display: "flex", gap: "10px", marginBottom: "20px" },
  inputWrap: {
    flex: 1, display: "flex", alignItems: "center",
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "12px", padding: "0 16px", gap: "10px",
    transition: "border-color 0.2s",
  },
  ghIcon: { fontSize: "16px", color: "var(--muted)" },
  input: {
    flex: 1, background: "transparent", border: "none", outline: "none",
    color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: "14px",
    padding: "14px 0",
  },
  clearBtn: {
    background: "transparent", border: "none", color: "var(--muted)",
    cursor: "pointer", fontSize: "12px", padding: "4px",
  },
  btn: {
    background: "linear-gradient(135deg, #00d9ff, #7b61ff)",
    color: "#080a0f", border: "none", borderRadius: "12px",
    padding: "14px 28px", fontFamily: "var(--font-display)",
    fontSize: "15px", fontWeight: "700", cursor: "pointer",
    whiteSpace: "nowrap", transition: "transform 0.15s, box-shadow 0.15s",
  },
  historyWrap: {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "12px", padding: "16px", marginBottom: "20px", textAlign: "left",
  },
  historyHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" },
  historyLabel: { fontSize: "11px", color: "var(--muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em" },
  clearHistBtn: {
    background: "transparent", border: "none", color: "var(--muted)",
    fontSize: "11px", cursor: "pointer", fontFamily: "var(--font-mono)",
  },
  historyList: { display: "flex", flexDirection: "column", gap: "4px" },
  historyItem: {
    display: "flex", alignItems: "center", gap: "10px",
    background: "transparent", border: "1px solid transparent",
    borderRadius: "8px", padding: "8px 10px", cursor: "pointer",
    transition: "all 0.15s", textAlign: "left", width: "100%",
  },
  historyIcon: { fontSize: "12px", color: "var(--accent)", minWidth: "14px" },
  historyText: { fontSize: "13px", color: "var(--muted2)", fontFamily: "var(--font-mono)" },
  examples: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", justifyContent: "center" },
  exLabel: { fontSize: "12px", color: "var(--muted)", fontFamily: "var(--font-mono)" },
  exBtn: {
    background: "transparent", border: "1px solid var(--border)",
    borderRadius: "8px", padding: "5px 12px", color: "var(--muted2)",
    fontFamily: "var(--font-mono)", fontSize: "12px", cursor: "pointer",
    transition: "all 0.15s",
  },
};

const css = `
  button:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
`;
