import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { 
  Upload, 
  Linkedin, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  FileText, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  Briefcase,
  Calendar,
  ExternalLink,
  Terminal
} from "lucide-react";
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
      { name: "description", content: "Analyze your profile with AI and get actionable career insights." },
      { property: "og:title", content: "Student Dashboard — TrustHire" },
    ],
  }),
  component: Student,
});

type SkillGap = {
  skill: string;
  why_needed: string;
  how_to_learn: string;
  time_to_learn: string;
};

type RecommendedRole = {
  title: string;
  company_type: string;
  match_percentage: number;
  why_fit: string;
};

type RecommendedInternship = {
  title: string;
  skills_needed: string;
  match_percentage: number;
};

type ActionPlan = {
  week: string;
  task: string;
  resource: string;
};

type ResumeAnalysis = {
  name: string;
  experience_level: string;
  current_skills: { skill: string; score: number }[];
  profile_strength: number;
  skill_gaps: SkillGap[];
  recommended_roles: RecommendedRole[];
  recommended_internships?: RecommendedInternship[];
  action_plan: ActionPlan[];
  profile_tips: string[];
  summary?: string;
};

function Student() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysis | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("resumeData");
    if (saved) {
      try {
        setAnalysisResult(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved resume data", e);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
    } else if (file) {
      toast.error("Please upload a PDF file only.");
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
    } else if (file) {
      toast.error("Please upload a PDF file only.");
    }
  };

  const readFileAsText = async (file: File): Promise<string> => { 
    // PDFs are binary; readAsText will return garbage.
    // We must use a PDF parser to get actual text content.
    return new Promise(async (resolve, reject) => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item: any) => item.str);
          fullText += strings.join(" ") + "\n";
        }
        resolve(fullText);
      } catch (err) {
        console.error("PDF Parsing Error:", err);
        // Fallback to basic text reading if PDF parsing fails
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsText(file);
      }
    });
  };

  const handleAnalyze = async () => { 
    setLoading(true); 
    setError(null); 
     
    try { 
      let profileContext = ""; 
       
      if (uploadedFile) { 
        const text = await readFileAsText(uploadedFile); 
        // Limit text and remove special characters 
        profileContext = text 
          .slice(0, 2000) 
          .replace(/[^\x20-\x7E\n]/g, ' ') 
          .replace(/\s+/g, ' ') 
          .trim(); 
      } else if (linkedinUrl) { 
        profileContext = linkedinUrl; 
      } else { 
        alert("Please upload resume or enter LinkedIn URL"); 
        setLoading(false); 
        return; 
      } 
   
      const prompt = `You are analyzing a student profile for career guidance. 
  Profile info: ${profileContext} 
  LinkedIn: ${linkedinUrl || 'not provided'} 
   
  Return ONLY this JSON (no markdown, no backticks, just raw JSON): 
  { 
    "name": "Student Name", 
    "experience_level": "Fresher", 
    "profile_strength": 70, 
    "summary": "Brief 2 line profile summary", 
    "current_skills": [ 
      {"skill": "React", "score": 75}, 
      {"skill": "JavaScript", "score": 80} 
    ], 
    "skill_gaps": [ 
      { 
        "skill": "Docker", 
        "why_needed": "Required for DevOps roles", 
        "how_to_learn": "TechWorld with Nana on YouTube", 
        "time_to_learn": "2 weeks" 
      } 
    ], 
    "recommended_roles": [ 
      { 
        "title": "Frontend Developer", 
        "company_type": "Product Startup", 
        "match_percentage": 82, 
        "why_fit": "Strong React skills match requirement" 
      } 
    ], 
    "action_plan": [ 
      { 
        "week": "Week 1-2", 
        "task": "Complete Docker basics course", 
        "resource": "YouTube - TechWorld with Nana" 
      }, 
      { 
        "week": "Week 3-4",  
        "task": "Build a full stack project", 
        "resource": "Add to GitHub portfolio" 
      } 
    ], 
    "profile_tips": [ 
      "Add GitHub profile link to resume", 
      "Build 2 more projects to strengthen portfolio", 
      "Get AWS Cloud Practitioner certification" 
    ] 
  }`; 
   
      const response = await fetch( 
        'https://api.groq.com/openai/v1/chat/completions', 
        { 
          method: 'POST', 
          headers: { 
            'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`, 
            'Content-Type': 'application/json' 
          }, 
          body: JSON.stringify({ 
            model: 'llama-3.3-70b-versatile', 
            messages: [ 
              { 
                role: 'user', 
                content: prompt 
              } 
            ], 
            max_tokens: 1500, 
            temperature: 0.3 
          }) 
        } 
      ); 
   
      if (!response.ok) { 
        const errData = await response.json(); 
        throw new Error(`API ${response.status}: ${JSON.stringify(errData)}`); 
      } 
       
      const data = await response.json(); 
      const text = data.choices[0].message.content; 
       
      // Clean and parse JSON 
      const jsonMatch = text.match(/\{[\s\S]*\}/); 
      if (!jsonMatch) throw new Error('No JSON in response'); 
       
      const result = JSON.parse(jsonMatch[0]); 
      localStorage.setItem('resumeData', JSON.stringify(result)); 
      setAnalysisResult(result); 
      toast.success("Profile analyzed successfully!");
      
      // Scroll to results smoothly
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
       
    } catch (err: any) { 
      console.error('Full error:', err); 
      setError('Analysis failed: ' + err.message); 
      toast.error('Analysis failed: ' + err.message);
    } finally { 
      setLoading(false); 
    } 
  }; 

  const recommendedJobs = jobs.filter((j) => !j.flagged).slice(0, 3);

  return (
    <div className="px-6 pb-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-accent">Student Console</div>
            <h1 className="mt-2 text-4xl font-display font-bold">
              {analysisResult ? `Welcome, ${analysisResult.name.split(" ")[0]}.` : "Futuristic Career AI"}
            </h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              {analysisResult ? analysisResult.summary : "Upload your resume or link your LinkedIn to generate your real-time trust profile."}
            </p>
          </div>
          <GlowButton 
            size="md" 
            disabled={!analysisResult}
            onClick={() => navigate({ to: "/fit" })}
            className={cn(!analysisResult && "opacity-50 cursor-not-allowed")}
          >
            See Honest Fit <ArrowRight className="h-4 w-4" />
          </GlowButton>
        </motion.div>

        {/* Profile Inputs */}
        <div className="grid lg:grid-cols-[1fr_400px] gap-8 mb-12">
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              {/* PDF Upload */}
              <div 
                onClick={() => fileRef.current?.click()}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={cn(
                  "glass rounded-3xl p-8 border-2 border-dashed transition-all cursor-pointer flex flex-col items-center text-center hover:bg-foreground/5",
                  uploadedFile ? "border-primary/60 bg-primary/5" : "border-border",
                  isDragging && "border-primary bg-primary/10 scale-[1.02]"
                )}
              >
                <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  {uploadedFile ? <FileText className="h-8 w-8" /> : <Upload className="h-8 w-8" />}
                </div>
                <h3 className="font-display font-bold mb-1">Resume Upload</h3>
                <p className="text-xs text-muted-foreground mb-4">Drag & drop your PDF here</p>
                {uploadedFile && (
                  <div className="text-sm font-medium text-primary flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> {uploadedFile.name}
                  </div>
                )}
              </div>

              {/* LinkedIn URL */}
              <div className="glass rounded-3xl p-8 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-2xl bg-[#0077b5]/10 flex items-center justify-center mb-4 text-[#0077b5]">
                  <Linkedin className="h-8 w-8" />
                </div>
                <h3 className="font-display font-bold mb-1">LinkedIn Profile</h3>
                <p className="text-xs text-muted-foreground mb-4">Paste your public profile URL</p>
                <input 
                  type="text" 
                  placeholder="https://linkedin.com/in/yourname"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full rounded-xl bg-foreground/5 border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <GlowButton 
              onClick={handleAnalyze}
              disabled={loading || (!uploadedFile && !linkedinUrl)}
              className="w-full h-14 text-lg"
            >
              {loading ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> AI is analyzing your profile...</>
              ) : (
                <>Analyze My Profile with AI <ArrowRight className="h-5 w-5" /></>
              )}
            </GlowButton>
          </div>

          {/* Sidebar Info/Result Summary */}
          <div>
            {analysisResult ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-3xl p-8 flex flex-col items-center text-center border-primary/20 border h-full justify-center">
                <TrustScoreRing score={analysisResult.profile_strength || 0} size={200} label="Profile Strength" />
                <div className="mt-6 flex items-center gap-2 text-success text-lg font-bold">
                  <CheckCircle2 className="h-6 w-6" /> Analysis Complete
                </div>
                <p className="text-sm text-muted-foreground mt-2">Your data is stored locally for fit analysis.</p>
              </motion.div>
            ) : (
              <div className="glass rounded-3xl p-8 h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                <Target className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-sm">Analysis results will appear here after processing.</p>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Results Sections */}
        {analysisResult && (
          <div ref={resultsRef} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 2. Current Skills */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Terminal className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-display font-bold uppercase tracking-wider">Current Skills</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(analysisResult.current_skills || []).map((s, i) => (
                  <div key={s.skill} className="glass rounded-2xl p-5">
                    <div className="flex justify-between text-sm mb-2 font-bold">
                      <span>{s.skill}</span>
                      <span className="text-primary tabular-nums">{s.score || 0}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${s.score || 0}%` }} transition={{ duration: 1.2, delay: i * 0.05 }} className="h-full bg-gradient-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)]" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Skill Gaps */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5 text-destructive" />
                <h2 className="text-2xl font-display font-bold uppercase tracking-wider">Skill Gaps to Bridge</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                {(analysisResult.skill_gaps || []).map((gap) => (
                  <div key={gap.skill} className="glass rounded-3xl p-6 border-l-4 border-destructive/40">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-destructive/10 text-destructive text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest border border-destructive/20">
                        {gap.skill}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {gap.time_to_learn}
                      </span>
                    </div>
                    <p className="text-sm font-semibold mb-2">{gap.why_needed}</p>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{gap.how_to_learn}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 4 & 5 Roles & Internships */}
            <div className="grid lg:grid-cols-2 gap-10">
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-display font-bold uppercase tracking-wider">Recommended Roles</h2>
                </div>
                <div className="space-y-4">
                  {(analysisResult.recommended_roles || []).map((role) => (
                    <div key={role.title} className="glass rounded-2xl p-6 flex gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg">{role.title}</h3>
                          <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{role.match_percentage}% Match</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">{role.company_type}</p>
                        <p className="text-sm leading-relaxed">{role.why_fit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {analysisResult.recommended_internships && analysisResult.recommended_internships.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <h2 className="text-2xl font-display font-bold uppercase tracking-wider">Top Internships</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {analysisResult.recommended_internships.map((intern) => (
                      <div key={intern.title} className="glass rounded-2xl p-5 text-center">
                        <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-3 font-bold text-xs">
                          {intern.match_percentage}%
                        </div>
                        <h3 className="font-bold text-sm mb-1">{intern.title}</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider line-clamp-1">{intern.skills_needed}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* 6. Action Plan */}
            <section className="glass rounded-[40px] p-10 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                <TrendingUp size={120} />
              </div>
              <div className="flex items-center gap-2 mb-8">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-display font-bold uppercase tracking-wider">Your Action Plan</h2>
              </div>
              <div className="space-y-8 relative">
                <div className="absolute left-4 top-2 bottom-2 w-px bg-border hidden sm:block" />
                {(analysisResult.action_plan || []).map((step, i) => (
                  <div key={step.week} className="flex flex-col sm:flex-row gap-4 relative">
                    <div className="h-8 w-8 rounded-full bg-background border-2 border-primary flex items-center justify-center text-[10px] font-bold z-10 shrink-0 hidden sm:flex">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">{step.week}</div>
                      <h3 className="font-display font-bold text-lg mb-2">{step.task}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-foreground/5 w-fit px-3 py-1.5 rounded-lg border border-border">
                        <ExternalLink className="h-3 w-3" /> {step.resource}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 7. Profile Tips */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Lightbulb className="h-5 w-5 text-warning" />
                <h2 className="text-2xl font-display font-bold uppercase tracking-wider">Profile Improvement Tips</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {(analysisResult.profile_tips || []).map((tip, i) => (
                  <div key={i} className="glass rounded-3xl p-6 bg-warning/5 border-warning/10 border relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Lightbulb size={80} />
                    </div>
                    <p className="text-sm leading-relaxed font-medium">{tip}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Existing Recommendations */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-display font-bold">Verified Recommendations</h2>
            <Link to="/jobs" className="text-sm text-primary hover:underline font-bold flex items-center gap-1.5">
              See all live openings <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedJobs.map((j, i) => <JobCard key={j.id} job={j} index={i} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
