import express from "express";
import axios from "axios";
import { analyzeWithGroq } from "../services/groq.js";

const router = express.Router();

// Parse owner/repo from various GitHub URL formats
function parseGitHubUrl(input) {
  const clean = input.trim().replace(/\.git$/, "");
  const match = clean.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (match) return { owner: match[1], repo: match[2] };
  const parts = clean.split("/").filter(Boolean);
  if (parts.length === 2) return { owner: parts[0], repo: parts[1] };
  throw new Error("Invalid GitHub URL or repo format");
}

async function fetchGitHubData(owner, repo) {
  const headers = { Accept: "application/vnd.github.v3+json" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }

  const base = `https://api.github.com/repos/${owner}/${repo}`;

  const [repoRes, treeRes] = await Promise.allSettled([
    axios.get(base, { headers }),
    axios.get(`${base}/git/trees/HEAD?recursive=1`, { headers }),
  ]);

  const repoInfo = repoRes.status === "fulfilled" ? repoRes.value.data : {};
  const tree = treeRes.status === "fulfilled"
    ? treeRes.value.data.tree?.slice(0, 50).map((f) => f.path).join("\n")
    : "";

  // Try to get README
  let readme = "";
  try {
    const readmeRes = await axios.get(`${base}/readme`, { headers });
    readme = Buffer.from(readmeRes.data.content, "base64").toString("utf-8");
  } catch {}

  // Try to get package.json
  let packageJson = "";
  try {
    const pkgRes = await axios.get(`${base}/contents/package.json`, { headers });
    const raw = Buffer.from(pkgRes.data.content, "base64").toString("utf-8");
    const parsed = JSON.parse(raw);
    packageJson = JSON.stringify(
      {
        dependencies: parsed.dependencies,
        devDependencies: parsed.devDependencies,
        scripts: parsed.scripts,
      },
      null,
      2
    );
  } catch {}

  return {
    name: repoInfo.full_name || `${owner}/${repo}`,
    description: repoInfo.description,
    language: repoInfo.language,
    stars: repoInfo.stargazers_count || 0,
    forks: repoInfo.forks_count || 0,
    topics: repoInfo.topics || [],
    readme,
    packageJson,
    fileTree: tree,
    url: repoInfo.html_url || `https://github.com/${owner}/${repo}`,
    createdAt: repoInfo.created_at,
    updatedAt: repoInfo.updated_at,
  };
}

router.post("/", async (req, res) => {
  const { repoUrl } = req.body;
  if (!repoUrl) return res.status(400).json({ error: "repoUrl is required" });

  try {
    const { owner, repo } = parseGitHubUrl(repoUrl);
    const repoData = await fetchGitHubData(owner, repo);
    const analysis = await analyzeWithGroq(repoData);

    res.json({
      repo: {
        name: repoData.name,
        description: repoData.description,
        language: repoData.language,
        stars: repoData.stars,
        forks: repoData.forks,
        url: repoData.url,
        updatedAt: repoData.updatedAt,
      },
      analysis,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message || "Analysis failed" });
  }
});

export default router;
