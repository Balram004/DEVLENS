import { useState } from "react";
import { analyzeRepo } from "../services/api";

export function useAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async (repoUrl) => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const result = await analyzeRepo(repoUrl);
      setData(result);
    } catch (e) {
      setError(e.response?.data?.error || "Analysis failed. Check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setData(null); setError(""); };

  return { data, loading, error, analyze, reset };
}
