import React, { useEffect, useState } from "react";
// import TechStack from "./TechStack";

const COMPLEXITY_COLOR = {
  Beginner:     { color: "#00e5a0", bg: "rgba(0,229,160,0.1)" },
  Intermediate: { color: "#ff9f43", bg: "rgba(255,159,67,0.1)" },
  Advanced:     { color: "#ff5e7d", bg: "rgba(255,94,125,0.1)" },
};

function ScoreRing({ score }) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  const r = 30;
  const circ = 2 * Math.PI * r;
  const dash = (animated / 10) * circ;
  const color = score >= 8 ? "#00e5a0" : score >= 6 ? "#ff9f43" : "#ff5e7d";

  return (
    <div style={{ position: "relative", width: "80px", height: "80px", flexShrink: 0 }}>
      <svg width="80" height="80" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
        <circle
          cx="40" cy="40" r={r} fill="none"
          stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: "20px", fontWeight: "800", color, fontFamily: "var(--font-mono)" }}>
          {score}
        </span>
        <span style={{ fontSize: "9px", color: "var(--muted)", fontFamily: "var(--font-mono)" }}>/10</span>
      </div>
    </div>
  );
}

function AnimatedCard({ children, delay = 0, style = {} }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div style={{
      ...s.card, ...style,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(16px)",
      transition: `opacity 0.5s ease, transform 0.5s ease`,
    }}>
      {children}
    </div>
  );
}

export default function AnalysisCard({ data, onReset }) {
  const { repo, analysis } = data;
  const complexity = COMPLEXITY_COLOR[analysis.complexity] || COMPLEXITY_COLOR.Intermediate;
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const text = `🔍 DevLens Analysis: ${repo.name}\n\n${analysis.verdict}\n\nTech: ${analysis.techStack?.map(t => t.name).join(", ")}\nQuality Score: ${analysis.codeQuality?.score}/10\nComplexity: ${analysis.complexity}\n\n${repo.url}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={s.wrap}>
      {/* Repo Header */}
      <div style={{ ...s.repoHeader, animation: "fadeSlideIn 0.5s ease forwards" }}>
        <div style={s.repoLeft}>
          <div style={s.repoName}>
            <a href={repo.url} target="_blank" rel="noreferrer" style={s.repoLink}>
              {repo.name}
            </a>
            <span style={{ ...s.complexityBadge, color: complexity.color, background: complexity.bg }}>
              {analysis.complexity}
            </span>
          </div>
          {repo.description && <p style={s.repoDesc}>{repo.description}</p>}
          <div style={s.repometa}>
            {repo.language && <span style={s.metaItem}>⬡ {repo.language}</span>}
            <span style={s.metaItem}>★ {repo.stars?.toLocaleString()}</span>
            <span style={s.metaItem}>⑂ {repo.forks?.toLocaleString()}</span>
          </div>
        </div>
        <div style={s.headerActions}>
          <button style={{ ...s.shareBtn, background: copied ? "rgba(0,229,160,0.1)" : "transparent", color: copied ? "#00e5a0" : "var(--muted2)" }} onClick={handleShare}>
            {copied ? "✓ Copied!" : "⎘ Share"}
          </button>
          <button style={s.resetBtn} onClick={onReset}>← New</button>
        </div>
      </div>

      {/* Verdict */}
      <AnimatedCard delay={100} style={{ background: "linear-gradient(135deg, rgba(0,217,255,0.08), rgba(123,97,255,0.08))", border: "1px solid rgba(0,217,255,0.2)" }}>
        <div style={s.verdict}>
          <span style={s.verdictIcon}>⚡</span>
          <p style={s.verdictText}>{analysis.verdict}</p>
        </div>
      </AnimatedCard>

      {/* Summary + Architecture side by side */}
      <div style={s.grid2}>
        <AnimatedCard delay={200}>
          <h3 style={s.cardHeading}>Overview</h3>
          <p style={s.summaryText}>{analysis.summary}</p>
        </AnimatedCard>
        <AnimatedCard delay={300}>
          <h3 style={s.cardHeading}>Architecture</h3>
          <p style={s.summaryText}>{analysis.architecture}</p>
        </AnimatedCard>
      </div>

      {/* Code Quality */}
      <AnimatedCard delay={400}>
        <div style={s.qualityTop}>
          <div style={{ flex: 1 }}>
            <h3 style={s.cardHeading}>Code Quality</h3>
            <div style={s.qualityLists}>
              <div>
                <p style={{ ...s.listLabel, color: "#00e5a0" }}>✓ Strengths</p>
                {analysis.codeQuality?.strengths?.map((str, i) => (
                  <p key={i} style={s.listItem}>· {str}</p>
                ))}
              </div>
              <div>
                <p style={{ ...s.listLabel, color: "#ff9f43" }}>↑ Improvements</p>
                {analysis.codeQuality?.improvements?.map((imp, i) => (
                  <p key={i} style={s.listItem}>· {imp}</p>
                ))}
              </div>
            </div>
          </div>
          <ScoreRing score={analysis.codeQuality?.score || 7} />
        </div>
      </AnimatedCard>

      {/* Tech Stack */}
      <AnimatedCard delay={500} style={{ padding: 0, overflow: "hidden" }}>
        <TechStack techStack={analysis.techStack} />
      </AnimatedCard>

      {/* Use Cases */}
      {analysis.useCases?.length > 0 && (
        <AnimatedCard delay={600}>
          <h3 style={s.cardHeading}>Use Cases</h3>
          <div style={s.useCases}>
            {analysis.useCases.map((uc, i) => (
              <div key={i} style={s.useCase}>
                <span style={s.ucNum}>{String(i + 1).padStart(2, "0")}</span>
                <span style={s.ucText}>{uc}</span>
              </div>
            ))}
          </div>
        </AnimatedCard>
      )}

      <style>{css}</style>
    </div>
  );
}

const s = {
  wrap: { maxWidth: "720px", margin: "0 auto", padding: "40px 24px", display: "flex", flexDirection: "column", gap: "16px" },
  repoHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", gap: "16px", flexWrap: "wrap", marginBottom: "8px",
  },
  repoLeft: { display: "flex", flexDirection: "column", gap: "6px" },
  repoName: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
  repoLink: { fontSize: "22px", fontWeight: "800", color: "var(--text)", textDecoration: "none", letterSpacing: "-0.02em" },
  complexityBadge: {
    fontSize: "11px", fontWeight: "600", fontFamily: "var(--font-mono)",
    padding: "3px 10px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.08em",
  },
  repoDesc: { fontSize: "14px", color: "var(--muted2)", lineHeight: 1.5 },
  repometa: { display: "flex", gap: "16px" },
  metaItem: { fontSize: "13px", color: "var(--muted)", fontFamily: "var(--font-mono)" },
  headerActions: { display: "flex", gap: "8px", alignItems: "center" },
  shareBtn: {
    border: "1px solid var(--border)", borderRadius: "8px",
    padding: "8px 14px", fontFamily: "var(--font-display)",
    fontSize: "13px", cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
  },
  resetBtn: {
    background: "transparent", border: "1px solid var(--border)",
    borderRadius: "8px", padding: "8px 16px", color: "var(--muted2)",
    fontFamily: "var(--font-display)", fontSize: "13px", cursor: "pointer",
    whiteSpace: "nowrap", transition: "all 0.15s",
  },
  verdict: { display: "flex", gap: "12px", alignItems: "flex-start" },
  verdictIcon: { fontSize: "18px", marginTop: "1px" },
  verdictText: { fontSize: "15px", color: "var(--text)", lineHeight: 1.6, fontWeight: "600" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  card: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px" },
  cardHeading: {
    fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--muted2)",
    textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px",
  },
  summaryText: { fontSize: "14px", color: "var(--muted2)", lineHeight: 1.7 },
  qualityTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px" },
  qualityLists: { display: "flex", flexDirection: "column", gap: "16px" },
  listLabel: { fontSize: "12px", fontWeight: "700", fontFamily: "var(--font-mono)", marginBottom: "6px", letterSpacing: "0.05em" },
  listItem: { fontSize: "13px", color: "var(--muted2)", lineHeight: 1.7, paddingLeft: "4px" },
  useCases: { display: "flex", flexDirection: "column", gap: "10px" },
  useCase: { display: "flex", gap: "14px", alignItems: "flex-start" },
  ucNum: {
    fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--accent)",
    background: "rgba(0,217,255,0.1)", padding: "2px 8px", borderRadius: "6px",
    minWidth: "30px", textAlign: "center", marginTop: "2px",
  },
  ucText: { fontSize: "14px", color: "var(--muted2)", lineHeight: 1.6 },
};

const css = `
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  button:hover { opacity: 0.8; }
  @media (max-width: 540px) {
    .grid2 { grid-template-columns: 1fr !important; }
  }
`;
