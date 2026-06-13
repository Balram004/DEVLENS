import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://devlens-nro8.onrender.com",
});

export async function analyzeRepo(repoUrl) {
  const { data } = await client.post("/api/analyze", { repoUrl });
  return data;
}