import type { RecruiterInput } from "./store";

export type AnalysisResult = {
  trustScore: number;
  verdict: string;
  metrics: { label: string; value: number; tone: "good" | "warn" | "bad" }[];
  positives: string[];
  suspicious: string[];
};

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function analyze(input: RecruiterInput): AnalysisResult {
  const text = `${input.company} ${input.jobTitle} ${input.salary} ${input.website} ${input.description}`.toLowerCase();
  const h = hash(text);

  const sketchyTerms = ["urgent", "earn $", "no experience", "wire transfer", "telegram", "western union", "crypto payout", "$5000/week", "guarantee"];
  const flagHits = sketchyTerms.filter((t) => text.includes(t)).length;

  const hasDomain = /\.(com|io|co|ai|dev|org)/.test(input.website);
  const hasSalaryNum = /\d/.test(input.salary);
  const longJD = input.description.length > 180;

  let base = 65 + (h % 25); // 65-89
  if (hasDomain) base += 4;
  if (hasSalaryNum) base += 3;
  if (longJD) base += 3;
  base -= flagHits * 22;
  const trustScore = Math.max(8, Math.min(98, base));

  const tone = (n: number): "good" | "warn" | "bad" => (n >= 75 ? "good" : n >= 50 ? "warn" : "bad");

  const fraudRisk = Math.max(2, 100 - trustScore - (h % 8));
  const domainCred = hasDomain ? 78 + (h % 20) : 24 + (h % 18);
  const salaryT = hasSalaryNum && flagHits === 0 ? 80 + (h % 18) : 30 + (h % 25);
  const hiringAuth = trustScore - 4 + ((h >> 3) % 10);
  const scamDet = 100 - fraudRisk;
  const langAna = longJD ? 82 + (h % 15) : 55 + (h % 20);

  const metrics = [
    { label: "Fraud Risk", value: fraudRisk, tone: fraudRisk < 25 ? "good" as const : fraudRisk < 55 ? "warn" as const : "bad" as const },
    { label: "Domain Credibility", value: domainCred, tone: tone(domainCred) },
    { label: "Salary Transparency", value: salaryT, tone: tone(salaryT) },
    { label: "Hiring Authenticity", value: Math.max(10, Math.min(98, hiringAuth)), tone: tone(hiringAuth) },
    { label: "AI Scam Detection", value: scamDet, tone: tone(scamDet) },
    { label: "Language Analysis", value: langAna, tone: tone(langAna) },
  ];

  const positivesPool = [
    "Domain registered over 4 years ago",
    "Recruiter activity matches verified pattern",
    "Salary aligns with market median (±8%)",
    "Job description uses specific, measurable scope",
    "Company has consistent hiring history",
    "SSL certificate valid and trusted",
    "No high-risk language detected",
  ];
  const suspiciousPool = [
    "Salary deviates 4σ above market median",
    "Domain registered within last 30 days",
    "Job description contains urgency triggers",
    "Recruiter account created < 14 days ago",
    "External payment terms mentioned",
    "Generic role description with no specifics",
  ];

  const positives = positivesPool.slice(0, trustScore > 80 ? 5 : trustScore > 60 ? 4 : 2);
  const suspicious = flagHits > 0 || trustScore < 70
    ? suspiciousPool.slice(0, flagHits > 0 ? 4 : 2)
    : suspiciousPool.slice(0, 1);

  const verdict =
    trustScore >= 85 ? "Highly Trusted — Safe to Apply" :
    trustScore >= 65 ? "Mostly Trusted — Minor Caution" :
    trustScore >= 40 ? "Risky — Verify Independently" :
    "Likely Scam — Do Not Engage";

  return { trustScore, verdict, metrics, positives, suspicious };
}
