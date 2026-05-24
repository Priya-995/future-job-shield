import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import { useRef, useState } from "react";
import { TrustScoreRing } from "@/components/TrustScoreRing";
import { JobCard } from "@/components/JobCard";
import { GlowButton } from "@/components/GlowButton";
import { jobs, skills } from "@/lib/mock-data";

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

function Student() {
  const [resume, setResume] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recommended = jobs.filter((j) => !j.flagged).slice(0, 3);

  return (
    <div className="px-6 pb-12">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-accent">Student Console</div>
            <h1 className="mt-2 text-4xl font-display font-bold">Welcome back, Aisha.</h1>
            <p className="mt-2 text-muted-foreground">Your trust profile is live. 3 new verified matches today.</p>
          </div>
          <Link to="/fit"><GlowButton size="md">See Honest Fit <ArrowRight className="h-4 w-4" /></GlowButton></Link>
        </motion.div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6 flex flex-col items-center text-center">
              <TrustScoreRing score={78} size={170} label="Profile Strength" />
              <div className="mt-4 text-sm text-muted-foreground">Add a project + portfolio link to reach 90+.</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-5">
              <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">Resume</div>
              {resume ? (
                <div className="flex items-center gap-3 rounded-xl bg-foreground/5 p-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="flex-1 text-sm truncate">{resume}</div>
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
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setResume(f.name); }} />
            </motion.div>
          </div>

          {/* Main */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Your Skills</div>
                <div className="text-xs text-muted-foreground">{skills.length} tracked</div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {skills.map((s, i) => (
                  <div key={s.name} className="rounded-xl bg-foreground/5 p-3">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">{s.name}</span>
                      <span className="text-muted-foreground tabular-nums">{s.level}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${s.level}%` }} transition={{ duration: 1, delay: 0.2 + i * 0.05 }} className="h-full bg-gradient-primary rounded-full" />
                    </div>
                  </div>
                ))}
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
