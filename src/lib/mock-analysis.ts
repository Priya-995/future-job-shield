import type { RecruiterInput } from "./store";

export type AnalysisResult = {
  trustScore: number;
  verdict: string;
  metrics: { label: string; value: number; tone: "good" | "warn" | "bad" }[];
  positives: string[];
  suspicious: string[];
};

export async function analyze(input: RecruiterInput): Promise<AnalysisResult> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("VITE_GROQ_API_KEY is not defined");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Return ONLY valid JSON, no markdown",
        },
        {
          role: "user",
          content: `Analyze this job for fraud and return JSON with: overall_score, verdict, fraud_risk, domain_credibility, salary_transparency, hiring_authenticity, scam_detection, language_analysis, positive_signals[], suspicious_signals[].
          
          Company: ${input.company}
          Job Title: ${input.jobTitle}
          Salary: ${input.salary}
          Website: ${input.website}
          Job Description: ${input.description}`,
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Groq API error: ${response.status} ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);

  const tone = (n: number): "good" | "warn" | "bad" => (n >= 75 ? "good" : n >= 50 ? "warn" : "bad");

  const metrics = [
    {
      label: "Fraud Risk",
      value: content.fraud_risk,
      tone: content.fraud_risk < 25 ? ("good" as const) : content.fraud_risk < 55 ? ("warn" as const) : ("bad" as const),
    },
    { label: "Domain Credibility", value: content.domain_credibility, tone: tone(content.domain_credibility) },
    { label: "Salary Transparency", value: content.salary_transparency, tone: tone(content.salary_transparency) },
    { label: "Hiring Authenticity", value: content.hiring_authenticity, tone: tone(content.hiring_authenticity) },
    { label: "AI Scam Detection", value: content.scam_detection, tone: tone(content.scam_detection) },
    { label: "Language Analysis", value: content.language_analysis, tone: tone(content.language_analysis) },
  ];

  return {
    trustScore: content.overall_score,
    verdict: content.verdict,
    metrics,
    positives: content.positive_signals,
    suspicious: content.suspicious_signals,
  };
}
