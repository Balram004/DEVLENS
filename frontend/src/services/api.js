import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

export async function analyzeRepo(repoUrl) {
  const { data } = await client.post("/analyze", { repoUrl });
  return data;
}
