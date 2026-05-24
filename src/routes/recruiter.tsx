import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Building2, Briefcase, DollarSign, Globe, Sparkles, Clock } from "lucide-react";
import { useState } from "react";
import { GlowButton } from "@/components/GlowButton";
import { useAnalysisStore } from "@/lib/store";

export const Route = createFileRoute("/recruiter")({
  head: () => ({
    meta: [
      { title: "Recruiter Dashboard — TrustHire" },
      { name: "description", content: "Submit a job posting and get an instant AI trust score." },
      { property: "og:title", content: "Recruiter Dashboard — TrustHire" },
      { property: "og:description", content: "Run AI trust analysis on your hiring posts in seconds." },
    ],
  }),
  component: Recruiter,
});

function Recruiter() {
  const navigate = useNavigate();
  const setInput = useAnalysisStore((s) => s.setInput);
  const [form, setForm] = useState({
    company: "Stripe",
    jobTitle: "Frontend Engineer Intern",
    salary: "$8,000 / month",
    website: "https://stripe.com",
    description: "We're hiring a frontend engineer intern to ship product surfaces in our Dashboard. You'll work with React, TypeScript, and our internal design system. Competitive comp, mentorship from senior engineers, and a structured intern program with end-of-summer offers for top performers.",
  });

  const recent = [
    { co: "Linear", title: "Design Intern", score: 94, t: "2m ago" },
    { co: "Vercel", title: "ML Platform", score: 92, t: "1h ago" },
    { co: "QuickRich", title: "Data Entry", score: 18, t: "3h ago" },
    { co: "Notion", title: "Backend Eng", score: 90, t: "yesterday" },
  ];

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInput(form);
    navigate({ to: "/analysis" });
  };

  return (
    <div className="px-6 pb-12">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="text-xs uppercase tracking-[0.2em] text-primary">Recruiter Console</div>
          <h1 className="mt-2 text-4xl font-display font-bold">Submit a job for verification</h1>
          <p className="mt-2 text-muted-foreground">Our trust engine analyzes 32 signals before students ever see your posting.</p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <motion.form
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6 sm:p-8 space-y-5"
          >
            <Field icon={Building2} label="Company name">
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={inputCls} placeholder="Acme Inc." />
            </Field>
            <Field icon={Briefcase} label="Job title">
              <input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} className={inputCls} placeholder="Senior Frontend Engineer" />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field icon={DollarSign} label="Salary">
                <input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} className={inputCls} placeholder="$8,000 / month" />
              </Field>
              <Field icon={Globe} label="Website URL">
                <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className={inputCls} placeholder="https://example.com" />
              </Field>
            </div>
            <Field label="Job description">
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={8} className={`${inputCls} resize-none font-mono text-sm`} placeholder="Paste the full job description…" />
              <div className="mt-1.5 text-xs text-muted-foreground">{form.description.length} chars · the more context, the better the score.</div>
            </Field>

            <div className="pt-2 flex justify-end">
              <GlowButton type="submit" size="xl"><Sparkles className="h-5 w-5" /> Analyze Trust Score</GlowButton>
            </div>
          </motion.form>

          <motion.aside initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-2 mb-3"><Clock className="h-3.5 w-3.5" /> Recent Analyses</div>
              <div className="space-y-3">
                {recent.map((r) => (
                  <div key={r.title} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">{r.title}</div>
                      <div className="text-xs text-muted-foreground">{r.co} · {r.t}</div>
                    </div>
                    <div className={`text-lg font-display font-bold tabular-nums ${r.score >= 80 ? "text-gradient" : r.score >= 50 ? "text-warning" : "text-destructive"}`}>{r.score}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass rounded-2xl p-5 text-sm">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">What we check</div>
              <ul className="space-y-1.5 text-muted-foreground text-[13px]">
                <li>· Domain age, SSL, WHOIS</li>
                <li>· Recruiter behavior graph</li>
                <li>· Salary vs market cohort</li>
                <li>· Language scam markers</li>
                <li>· Hiring pattern history</li>
                <li>· LLM intent classification</li>
              </ul>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl bg-input/40 border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition-all placeholder:text-muted-foreground/50";

function Field({ label, icon: Icon, children }: { label: string; icon?: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5">
        {Icon && <Icon className="h-3.5 w-3.5" />} {label}
      </div>
      {children}
    </label>
  );
}
