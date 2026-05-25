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

  const normalize = (n: number) => {
    const val = n < 1 ? n * 100 : n;
    return Math.round(val);
  };

  const overallScore = normalize(content.overall_score);
  const fraudRisk = normalize(content.fraud_risk);
  const domainCredibility = normalize(content.domain_credibility);
  const salaryTransparency = normalize(content.salary_transparency);
  const hiringAuthenticity = normalize(content.hiring_authenticity);
  const scamDetection = normalize(content.scam_detection);
  const languageAnalysis = normalize(content.language_analysis);

  const tone = (n: number): "good" | "warn" | "bad" => (n >= 75 ? "good" : n >= 50 ? "warn" : "bad");

  const metrics = [
    {
      label: "Fraud Risk",
      value: fraudRisk,
      tone: fraudRisk < 25 ? ("good" as const) : fraudRisk < 55 ? ("warn" as const) : ("bad" as const),
    },
    { label: "Domain Credibility", value: domainCredibility, tone: tone(domainCredibility) },
    { label: "Salary Transparency", value: salaryTransparency, tone: tone(salaryTransparency) },
    { label: "Hiring Authenticity", value: hiringAuthenticity, tone: tone(hiringAuthenticity) },
    { label: "AI Scam Detection", value: scamDetection, tone: tone(scamDetection) },
    { label: "Language Analysis", value: languageAnalysis, tone: tone(languageAnalysis) },
  ];

  return {
    trustScore: overallScore,
    verdict: content.verdict,
    metrics,
    positives: content.positive_signals,
    suspicious: content.suspicious_signals,
  };
}
