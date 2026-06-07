import React, { useState } from "react";
import { analyzeRepo } from "../services/api";

const COMPLEXITY_COLOR = {
  Beginner:     { color: "#00e5a0", bg: "rgba(0,229,160,0.1)" },
  Intermediate: { color: "#ff9f43", bg: "rgba(255,159,67,0.1)" },
  Advanced:     { color: "#ff5e7d", bg: "rgba(255,94,125,0.1)" },
};

function ScoreBar({ score, color }) {
  const [width, setWidth] = useState(0);
  React.useEffect(() => {
    const t = setTimeout(() => setWidth((score / 10) * 100), 400);
    return () => clearTimeout(t);
  }, [score]);
  return (
    <div style={s.barWrap}>
      <div style={{ ...s.barFill, width: `${width}%`, background: color, transition: "width 1s ease" }} />
    </div>
  );
}

function RepoColumn({ data, side }) {
  if (!data) return null;
  const { repo, analysis } = data;
  const complexity = COMPLEXITY_COLOR[analysis.complexity] || COMPLEXITY_COLOR.Intermediate;
  const scoreColor = analysis.codeQuality?.score >= 8 ? "#00e5a0" : analysis.codeQuality?.score >= 6 ? "#ff9f43" : "#ff5e7d";

  return (
    <div style={s.column}>
      {/* Header */}
      <div style={s.colHeader}>
        <a href={repo.url} target="_blank" rel="noreferrer" style={s.colRepoName}>{repo.name}</a>
        <span style={{ ...s.badge, color: complexity.color, background: complexity.bg }}>{analysis.complexity}</span>
        <div style={s.metaRow}>
          {repo.language && <span style={s.meta}>⬡ {repo.language}</span>}
          <span style={s.meta}>★ {repo.stars?.toLocaleString()}</span>
          <span style={s.meta}>⑂ {repo.forks?.toLocaleString()}</span>
        </div>
      </div>

      {/* Score */}
      <div style={s.scoreCard}>
        <div style={s.scoreTop}>
          <span style={s.scoreLabel}>Quality Score</span>
          <span style={{ ...s.scoreNum, color: scoreColor }}>{analysis.codeQuality?.score}/10</span>
        </div>
        <ScoreBar score={analysis.codeQuality?.score || 0} color={scoreColor} />
      </div>

      {/* Verdict */}
      <div style={s.verdictBox}>
        <span style={s.verdictIcon}>⚡</span>
        <p style={s.verdictText}>{analysis.verdict}</p>
      </div>

      {/* Summary */}
      <div style={s.section}>
        <h4 style={s.sectionTitle}>Overview</h4>
        <p style={s.sectionText}>{analysis.summary}</p>
      </div>

      {/* Architecture */}
      <div style={s.section}>
        <h4 style={s.sectionTitle}>Architecture</h4>
        <p style={s.sectionText}>{analysis.architecture}</p>
      </div>

      {/* Tech Stack */}
      <div style={s.section}>
        <h4 style={s.sectionTitle}>Tech Stack</h4>
        <div style={s.chips}>
          {analysis.techStack?.map((t, i) => (
            <span key={i} style={s.chip}>{t.name}</span>
          ))}
        </div>
      </div>

      {/* Strengths */}
      <div style={s.section}>
        <h4 style={{ ...s.sectionTitle, color: "#00e5a0" }}>✓ Strengths</h4>
        {analysis.codeQuality?.strengths?.map((str, i) => (
          <p key={i} style={s.listItem}>· {str}</p>
        ))}
      </div>

      {/* Improvements */}
      <div style={s.section}>
        <h4 style={{ ...s.sectionTitle, color: "#ff9f43" }}>↑ Improvements</h4>
        {analysis.codeQuality?.improvements?.map((imp, i) => (
          <p key={i} style={s.listItem}>· {imp}</p>
        ))}
      </div>
    </div>
  );
}

export default function CompareView({ onBack }) {
  const [urls, setUrls] = useState(["", ""]);
  const [results, setResults] = useState([null, null]);
  const [loading, setLoading] = useState([false, false]);
  const [errors, setErrors] = useState(["", ""]);

  const analyze = async (idx) => {
    if (!urls[idx].trim()) return;
    setLoading(prev => { const n = [...prev]; n[idx] = true; return n; });
    setErrors(prev => { const n = [...prev]; n[idx] = ""; return n; });
    try {
      const data = await analyzeRepo(urls[idx].trim());
      setResults(prev => { const n = [...prev]; n[idx] = data; return n; });
    } catch (e) {
      setErrors(prev => { const n = [...prev]; n[idx] = e.response?.data?.error || "Failed"; return n; });
    } finally {
      setLoading(prev => { const n = [...prev]; n[idx] = false; return n; });
    }
  };

  const winner = results[0] && results[1]
    ? results[0].analysis.codeQuality?.score > results[1].analysis.codeQuality?.score ? 0
    : results[1].analysis.codeQuality?.score > results[0].analysis.codeQuality?.score ? 1
    : -1
    : null;

  return (
    <div style={s.wrap}>
      <div style={s.topBar}>
        <button style={s.backBtn} onClick={onBack}>← Back</button>
        <div style={s.topTitle}>
          <span style={s.topTitleText}>Compare Repos</span>
          <span style={s.topTitleSub}>Analyze two repos side by side</span>
        </div>
      </div>

      {/* Input Row */}
      <div style={s.inputGrid}>
        {[0, 1].map(idx => (
          <div key={idx} style={s.inputCol}>
            <span style={s.inputLabel}>Repo {idx + 1}</span>
            <div style={s.inputRow}>
              <input
                style={s.input}
                placeholder="https://github.com/owner/repo"
                value={urls[idx]}
                onChange={e => setUrls(prev => { const n = [...prev]; n[idx] = e.target.value; return n; })}
                onKeyDown={e => e.key === "Enter" && analyze(idx)}
                spellCheck={false}
              />
              <button
                style={{ ...s.analyzeBtn, opacity: loading[idx] ? 0.6 : 1 }}
                onClick={() => analyze(idx)}
                disabled={loading[idx]}
              >
                {loading[idx] ? "..." : "→"}
              </button>
            </div>
            {errors[idx] && <p style={s.error}>{errors[idx]}</p>}
          </div>
        ))}
      </div>

      {/* Winner Banner */}
      {winner !== null && winner !== -1 && (
        <div style={s.winnerBanner}>
          🏆 <strong>{results[winner].repo.name}</strong> wins with a higher quality score!
        </div>
      )}
      {winner === -1 && results[0] && results[1] && (
        <div style={{ ...s.winnerBanner, background: "rgba(123,97,255,0.1)", borderColor: "rgba(123,97,255,0.3)", color: "#7b61ff" }}>
          🤝 It's a tie — both repos have equal quality scores!
        </div>
      )}

      {/* Compare Columns */}
      {(results[0] || results[1]) && (
        <div style={s.compareGrid}>
          {[0, 1].map(idx => (
            <div key={idx} style={{ position: "relative" }}>
              {winner === idx && (
                <div style={s.winnerTag}>🏆 Winner</div>
              )}
              {results[idx]
                ? <RepoColumn data={results[idx]} side={idx} />
                : loading[idx]
                  ? <div style={s.loadingCol}>Analyzing...</div>
                  : <div style={s.emptyCol}>Enter a repo URL above</div>
              }
            </div>
          ))}
        </div>
      )}

      <style>{css}</style>
    </div>
  );
}

const s = {
  wrap: { maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" },
  topBar: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" },
  backBtn: {
    background: "transparent", border: "1px solid var(--border)", borderRadius: "8px",
    padding: "8px 16px", color: "var(--muted2)", fontFamily: "var(--font-display)",
    fontSize: "13px", cursor: "pointer",
  },
  topTitle: { display: "flex", flexDirection: "column", gap: "2px" },
  topTitleText: { fontSize: "20px", fontWeight: "800", letterSpacing: "-0.02em" },
  topTitleSub: { fontSize: "13px", color: "var(--muted2)" },
  inputGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" },
  inputCol: { display: "flex", flexDirection: "column", gap: "8px" },
  inputLabel: { fontSize: "11px", color: "var(--muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em" },
  inputRow: { display: "flex", gap: "8px" },
  input: {
    flex: 1, background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "10px", padding: "11px 14px", color: "var(--text)",
    fontFamily: "var(--font-mono)", fontSize: "13px", outline: "none",
  },
  analyzeBtn: {
    background: "linear-gradient(135deg, #00d9ff, #7b61ff)", color: "#080a0f",
    border: "none", borderRadius: "10px", padding: "11px 18px",
    fontWeight: "700", fontSize: "16px", cursor: "pointer",
  },
  error: { fontSize: "12px", color: "#ff5e7d", fontFamily: "var(--font-mono)" },
  winnerBanner: {
    background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.3)",
    borderRadius: "12px", padding: "14px 20px", fontSize: "14px",
    color: "#00e5a0", marginBottom: "20px", textAlign: "center",
  },
  compareGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "start" },
  column: {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "16px", padding: "24px", display: "flex",
    flexDirection: "column", gap: "16px",
  },
  colHeader: { display: "flex", flexDirection: "column", gap: "6px" },
  colRepoName: { fontSize: "18px", fontWeight: "800", color: "var(--text)", textDecoration: "none", letterSpacing: "-0.02em" },
  badge: { fontSize: "11px", fontWeight: "600", fontFamily: "var(--font-mono)", padding: "2px 8px", borderRadius: "20px", width: "fit-content", textTransform: "uppercase" },
  metaRow: { display: "flex", gap: "12px" },
  meta: { fontSize: "12px", color: "var(--muted)", fontFamily: "var(--font-mono)" },
  scoreCard: { background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" },
  scoreTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  scoreLabel: { fontSize: "12px", color: "var(--muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" },
  scoreNum: { fontSize: "22px", fontWeight: "800", fontFamily: "var(--font-mono)" },
  barWrap: { height: "6px", background: "var(--border)", borderRadius: "10px", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: "10px" },
  verdictBox: { display: "flex", gap: "8px", alignItems: "flex-start" },
  verdictIcon: { fontSize: "14px" },
  verdictText: { fontSize: "13px", color: "var(--text)", lineHeight: 1.6, fontWeight: "600" },
  section: { display: "flex", flexDirection: "column", gap: "8px" },
  sectionTitle: { fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--muted2)", textTransform: "uppercase", letterSpacing: "0.1em" },
  sectionText: { fontSize: "13px", color: "var(--muted2)", lineHeight: 1.6 },
  chips: { display: "flex", flexWrap: "wrap", gap: "6px" },
  chip: { fontSize: "12px", color: "var(--accent)", background: "rgba(0,217,255,0.08)", border: "1px solid rgba(0,217,255,0.2)", padding: "3px 10px", borderRadius: "6px", fontFamily: "var(--font-mono)" },
  listItem: { fontSize: "13px", color: "var(--muted2)", lineHeight: 1.6 },
  winnerTag: {
    position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)",
    background: "linear-gradient(135deg, #00d9ff, #7b61ff)", color: "#080a0f",
    fontSize: "11px", fontWeight: "700", padding: "3px 14px", borderRadius: "20px",
    whiteSpace: "nowrap", zIndex: 2,
  },
  loadingCol: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "40px", textAlign: "center", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "13px" },
  emptyCol: { background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: "16px", padding: "40px", textAlign: "center", color: "var(--muted)", fontSize: "13px" },
};

const css = `
  input:focus { border-color: rgba(0,217,255,0.5) !important; }
  button:hover:not(:disabled) { opacity: 0.85; }
  @media (max-width: 640px) {
    .compareGrid, .inputGrid { grid-template-columns: 1fr !important; }
  }
`;