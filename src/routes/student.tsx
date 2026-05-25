import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { TrustScoreRing } from "@/components/TrustScoreRing";
import { JobCard } from "@/components/JobCard";
import { GlowButton } from "@/components/GlowButton";
import { jobs } from "@/lib/mock-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/student")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — TrustHire" },
      { name: "description", content: "Upload your resume, see verified job matches, and get honest AI fit feedback." },
      { property: "og:title", content: "Student Dashboard — TrustHire" },
      { property: "og:description", content: "Verified jobs with honest fit explanations." },
    ],
  }),
  component: Student,
});

type ResumeAnalysis = {
  name: string;
  education: string;
  experience_level: string;
  skills: string[];
  skill_scores: Record<string, number>;
  profile_strength: number;
  top_job_roles: string[];
  missing_skills: string[];
  summary: string;
};

function Student() {
  const [analyzing, setAnalyzing] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeAnalysis | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("resumeData");
    if (saved) {
      try {
        setResumeData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved resume data", e);
      }
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    
    try {
      let text = "";

      if (file.type === "application/pdf") {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item: any) => item.str);
          fullText += strings.join(" ") + "\n";
        }
        text = fullText;
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.endsWith(".docx")
      ) {
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else {
        // Fallback to plain text for .txt and other formats
        text = await file.text();
      }

      if (!text.trim()) {
        throw new Error("Could not extract text from the resume. Please ensure it's not empty or an image-only PDF.");
      }

      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) {
        toast.error("VITE_GROQ_API_KEY is not defined");
        setAnalyzing(false);
        return;
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
              content: "You are a resume analyzer for Indian job seekers.",
            },
            {
              role: "user",
              content: `Analyze this resume. Return ONLY JSON: 
              { 
                "name": "string", 
                "education": "string", 
                "experience_level": "Fresher/1-2 years/3-5 years", 
                "skills": ["array of skills"], 
                "skill_scores": { "skillName": 0_to_100 }, 
                "profile_strength": 0-100, 
                "top_job_roles": ["3 strings"], 
                "missing_skills": ["4 strings"], 
                "summary": "string (2 lines about the candidate)" 
              } 
              Resume text: ${text}`,
            },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) throw new Error("API call failed");

      const data = await response.json();
      const analysis: ResumeAnalysis = JSON.parse(data.choices[0].message.content);

      localStorage.setItem("resumeData", JSON.stringify(analysis));
      setResumeData(analysis);
      toast.success("Resume analyzed successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to analyze resume. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const recommended = jobs.filter((j) => !j.flagged).slice(0, 3);

  return (
    <div className="px-6 pb-12">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-accent">Student Console</div>
            <h1 className="mt-2 text-4xl font-display font-bold">
              {resumeData ? `Welcome back, ${resumeData.name.split(" ")[0]}.` : "Welcome back, Aisha."}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {resumeData ? resumeData.summary : "Your trust profile is live. 3 new verified matches today."}
            </p>
          </div>
          <GlowButton 
            size="md" 
            disabled={!resumeData}
            onClick={() => navigate({ to: "/fit" })}
            className={cn(!resumeData && "opacity-50 cursor-not-allowed")}
          >
            See Honest Fit <ArrowRight className="h-4 w-4" />
          </GlowButton>
        </motion.div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6 flex flex-col items-center text-center">
              <TrustScoreRing score={resumeData?.profile_strength || 78} size={170} label="Profile Strength" />
              <div className="mt-4 text-sm text-muted-foreground">
                {resumeData ? "Resume analyzed and profile updated." : "Add a project + portfolio link to reach 90+."}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-5">
              <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">Resume</div>
              {analyzing ? (
                <div className="w-full rounded-xl bg-foreground/5 p-6 flex flex-col items-center text-center">
                  <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
                  <div className="text-sm font-medium">Analyzing...</div>
                </div>
              ) : resumeData ? (
                <div className="flex items-center gap-3 rounded-xl bg-foreground/5 p-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="flex-1 text-sm truncate">Resume Analyzed</div>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full rounded-xl border-2 border-dashed border-border hover:border-primary/60 p-6 flex flex-col items-center text-center transition-colors"
                >
                  <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                  <div className="text-sm font-medium">Upload resume</div>
                  <div className="text-xs text-muted-foreground mt-1">PDF · drop or click</div>
                </button>
              )}
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleFileUpload} />
            </motion.div>
          </div>

          {/* Main */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Your Skills</div>
                <div className="text-xs text-muted-foreground">{resumeData ? Object.keys(resumeData.skill_scores).length : 6} tracked</div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {resumeData ? (
                  Object.entries(resumeData.skill_scores).map(([name, score], i) => (
                    <div key={name} className="rounded-xl bg-foreground/5 p-3">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium">{name}</span>
                        <span className="text-muted-foreground tabular-nums">{score}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1, delay: 0.2 + i * 0.05 }} className="h-full bg-gradient-primary rounded-full" />
                      </div>
                    </div>
                  ))
                ) : (
                  [
                    { name: "React", level: 82 },
                    { name: "TypeScript", level: 75 },
                    { name: "Tailwind CSS", level: 90 },
                    { name: "Node.js", level: 65 },
                  ].map((s, i) => (
                    <div key={s.name} className="rounded-xl bg-foreground/5 p-3">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium">{s.name}</span>
                        <span className="text-muted-foreground tabular-nums">{s.level}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${s.level}%` }} transition={{ duration: 1, delay: 0.2 + i * 0.05 }} className="h-full bg-gradient-primary rounded-full" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-semibold">Verified Recommendations</h2>
                <Link to="/jobs" className="text-sm text-primary hover:underline">See all →</Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommended.map((j, i) => <JobCard key={j.id} job={j} index={i} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
