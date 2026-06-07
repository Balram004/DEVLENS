import React, { useState } from "react";
import RepoInput from "../components/RepoInput";
import Loader from "../components/Loader";
import AnalysisCard from "../components/AnalysisCard";
import CompareView from "../components/CompareView";
import { useAnalysis } from "../hooks/useAnalysis";

export default function Home() {
  const { data, loading, error, analyze, reset } = useAnalysis();
  const [mode, setMode] = useState("single"); // "single" | "compare"

  const switchMode = (m) => {
    setMode(m);
    reset();
  };

  return (
    <div style={s.page}>
      <div style={s.glow1} />
      <div style={s.glow2} />

      {/* Nav */}
      <nav style={s.nav}>
        <div style={s.navLogo}>
          <span style={s.logoMark}>◈</span>
          <span style={s.logoText}>DevLens</span>
        </div>
        <div style={s.navRight}>
          {/* Mode Toggle */}
          <div style={s.modeToggle}>
            <button
              style={{ ...s.modeBtn, ...(mode === "single" ? s.modeBtnActive : {}) }}
              onClick={() => switchMode("single")}
            >
              Analyze
            </button>
            <button
              style={{ ...s.modeBtn, ...(mode === "compare" ? s.modeBtnActive : {}) }}
              onClick={() => switchMode("compare")}
            >
              ⇄ Compare
            </button>
          </div>
        </div>
      </nav>

      {/* Compare Mode */}
      {mode === "compare" && (
        <CompareView onBack={() => switchMode("single")} />
      )}

      {/* Single Mode */}
      {mode === "single" && (
        <>
          {!data && !loading && <RepoInput onAnalyze={analyze} loading={loading} />}
          {loading && <Loader />}
          {error && (
            <div style={s.errorWrap}>
              <div style={s.errorBox}>
                <span style={s.errorIcon}>⚠</span>
                <div>
                  <p style={s.errorTitle}>Analysis Failed</p>
                  <p style={s.errorMsg}>{error}</p>
                </div>
              </div>
              <button style={s.retryBtn} onClick={reset}>← Try Again</button>
            </div>
          )}
          {data && !loading && <AnalysisCard data={data} onReset={reset} />}

          {!data && !loading && (
            <footer style={s.footer}>
              <p style={s.footerText}>Crafted by Balram · React + Node.js + Groq AI</p>
            </footer>
          )}
        </>
      )}
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", position: "relative", overflow: "hidden" },
  glow1: {
    position: "fixed", top: "-200px", left: "-200px",
    width: "600px", height: "600px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,217,255,0.06) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  glow2: {
    position: "fixed", bottom: "-200px", right: "-200px",
    width: "500px", height: "500px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(123,97,255,0.06) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  nav: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 32px", borderBottom: "1px solid var(--border)",
    position: "sticky", top: 0, background: "rgba(8,10,15,0.9)",
    backdropFilter: "blur(12px)", zIndex: 10,
  },
  navLogo: { display: "flex", alignItems: "center", gap: "8px" },
  logoMark: { color: "var(--accent)", fontSize: "18px" },
  logoText: { fontSize: "16px", fontWeight: "800", letterSpacing: "-0.02em" },
  navRight: { display: "flex", alignItems: "center", gap: "12px" },
  modeToggle: {
    display: "flex", background: "var(--surface)",
    border: "1px solid var(--border)", borderRadius: "10px", padding: "3px", gap: "2px",
  },
  modeBtn: {
    background: "transparent", border: "none", borderRadius: "8px",
    padding: "7px 16px", color: "var(--muted2)", fontFamily: "var(--font-display)",
    fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s",
  },
  modeBtnActive: {
    background: "linear-gradient(135deg, rgba(0,217,255,0.15), rgba(123,97,255,0.15))",
    color: "var(--accent)", border: "1px solid rgba(0,217,255,0.2)",
  },
  errorWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "60px 24px" },
  errorBox: {
    display: "flex", gap: "12px", alignItems: "flex-start",
    background: "rgba(255,94,125,0.08)", border: "1px solid rgba(255,94,125,0.2)",
    borderRadius: "12px", padding: "20px 24px", maxWidth: "480px",
  },
  errorIcon: { fontSize: "18px", color: "#ff5e7d" },
  errorTitle: { fontSize: "15px", fontWeight: "700", color: "#ff5e7d", marginBottom: "4px" },
  errorMsg: { fontSize: "13px", color: "var(--muted2)", fontFamily: "var(--font-mono)" },
  retryBtn: {
    background: "transparent", border: "1px solid var(--border)",
    borderRadius: "8px", padding: "10px 20px", color: "var(--muted2)",
    fontFamily: "var(--font-display)", fontSize: "14px", cursor: "pointer",
  },
  footer: { textAlign: "center", padding: "40px 24px" },
  footerText: { fontSize: "12px", color: "var(--muted)", fontFamily: "var(--font-mono)" },
};
