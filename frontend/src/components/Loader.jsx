import React, { useEffect, useState } from "react";

const steps = [
  "Fetching repository metadata...",
  "Reading README and file structure...",
  "Scanning dependencies...",
  "Running AI analysis...",
  "Generating insights...",
];

export default function Loader() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s < steps.length - 1 ? s + 1 : s));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={s.wrap}>
      <div style={s.orb} />
      <div style={s.ring} />
      <p style={s.step}>{steps[step]}</p>
      <div style={s.dots}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ ...s.dot, animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
      <style>{css}</style>
    </div>
  );
}

const s = {
  wrap: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", padding: "80px 20px", gap: "20px",
  },
  orb: {
    width: "72px", height: "72px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,217,255,0.4) 0%, transparent 70%)",
    animation: "pulse 2s ease-in-out infinite",
    boxShadow: "0 0 40px rgba(0,217,255,0.3)",
  },
  ring: {
    position: "absolute",
    width: "96px", height: "96px", borderRadius: "50%",
    border: "1px solid rgba(0,217,255,0.3)",
    animation: "spin 3s linear infinite",
  },
  step: {
    fontFamily: "var(--font-mono)", fontSize: "13px",
    color: "var(--accent)", marginTop: "24px", letterSpacing: "0.05em",
  },
  dots: { display: "flex", gap: "6px" },
  dot: {
    width: "6px", height: "6px", borderRadius: "50%",
    background: "var(--muted)", animation: "blink 1.2s ease-in-out infinite",
  },
};

const css = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.15); opacity: 1; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes blink {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }
`;
