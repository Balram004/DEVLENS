import Groq from "groq-sdk";

export async function analyzeWithGroq(repoData) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  
  const prompt = `You are an expert software architect and code reviewer. Analyze this GitHub repository and provide a detailed technical breakdown.

Repository: ${repoData.name}
Description: ${repoData.description || "No description"}
Language: ${repoData.language || "Unknown"}
Stars: ${repoData.stars}
Forks: ${repoData.forks}
Topics: ${repoData.topics?.join(", ") || "None"}

README Content:
${repoData.readme?.slice(0, 3000) || "No README found"}

Package.json / Dependencies:
${repoData.packageJson || "Not found"}

File Structure (top-level):
${repoData.fileTree || "Not available"}

Provide a JSON response with EXACTLY this structure (no extra text, just JSON):
{
  "summary": "2-3 sentence overview of what this project does",
  "techStack": [
    { "name": "React", "category": "Frontend", "reason": "why used" }
  ],
  "architecture": "Brief description of the architecture pattern used",
  "codeQuality": {
    "score": 8,
    "strengths": ["strength 1", "strength 2"],
    "improvements": ["improvement 1", "improvement 2"]
  },
  "complexity": "Beginner | Intermediate | Advanced",
  "useCases": ["use case 1", "use case 2", "use case 3"],
  "verdict": "One punchy sentence — what makes this repo stand out or fall short"
}`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    max_tokens: 1500,
  });

  const raw = completion.choices[0].message.content;
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid AI response format");
  return JSON.parse(jsonMatch[0]);
}