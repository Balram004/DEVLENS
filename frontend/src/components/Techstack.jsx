import React from "react";

const CATEGORY_COLORS = {
  Frontend: { color: "#00d9ff", bg: "rgba(0,217,255,0.1)" },
  Backend:  { color: "#7b61ff", bg: "rgba(123,97,255,0.1)" },
  Database: { color: "#00e5a0", bg: "rgba(0,229,160,0.1)" },
  DevOps:   { color: "#ff9f43", bg: "rgba(255,159,67,0.1)" },
  Testing:  { color: "#ff5e7d", bg: "rgba(255,94,125,0.1)" },
  Other:    { color: "#718096", bg: "rgba(113,128,150,0.1)" },
};

export default function TechStack({ techStack = [] }) {
  if (!techStack.length) return null;

  const grouped = techStack.reduce((acc, t) => {
    const cat = t.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});

  return (
    <div style={s.wrap}>
      <h3 style={s.heading}>Tech Stack</h3>
      <div style={s.groups}>
        {Object.entries(grouped).map(([category, items]) => {
          const clr = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
          return (
            <div key={category} style={s.group}>
              <span style={{ ...s.catLabel, color: clr.color }}>{category}</span>
              <div style={s.chips}>
                {items.map((t) => (
                  <div key={t.name} style={{ ...s.chip, background: clr.bg, border: `1px solid ${clr.color}30` }} title={t.reason}>
                    <span style={{ ...s.chipName, color: clr.color }}>{t.name}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  wrap: {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "16px", padding: "24px",
  },
  heading: {
    fontSize: "13px", fontFamily: "var(--font-mono)", color: "var(--muted2)",
    textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "20px",
  },
  groups: { display: "flex", flexDirection: "column", gap: "16px" },
  group: { display: "flex", flexDirection: "column", gap: "8px" },
  catLabel: {
    fontSize: "11px", fontFamily: "var(--font-mono)",
    textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "600",
  },
  chips: { display: "flex", flexWrap: "wrap", gap: "8px" },
  chip: {
    borderRadius: "8px", padding: "6px 12px",
    display: "flex", alignItems: "center", gap: "6px",
  },
  chipName: { fontSize: "13px", fontWeight: "600", fontFamily: "var(--font-mono)" },
};
