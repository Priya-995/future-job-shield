import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Sparkles, TrendingUp, Target, MessageSquare, Award, ArrowRight } from "lucide-react";
import { TypingText } from "@/components/TypingText";
import { GlowButton } from "@/components/GlowButton";

export const Route = createFileRoute("/fit")({
  head: () => ({
    meta: [
      { title: "Honest Fit — TrustHire" },
      { name: "description", content: "Conversational AI explains why you match — and what's missing." },
      { property: "og:title", content: "Honest Fit — TrustHire" },
      { property: "og:description", content: "Real talk from AI on your job fit." },
    ],
  }),
  component: Fit,
});

const SECTIONS = [
  {
    icon: Target,
    title: "Why you match",
    body: "You've shipped 3 React projects this year, your TypeScript fundamentals are solid (82%), and your GitHub activity shows consistent commits. The Stripe Frontend Intern role rewards exactly that — execution speed plus type discipline.",
  },
  {
    icon: TrendingUp,
    title: "What's missing",
    body: "System design depth (54%) and ML fundamentals (48%) are below the bar for senior-track roles. You also lack a public portfolio link — recruiters drop applications without one ~38% of the time.",
  },
  {
    icon: Sparkles,
    title: "Growth suggestions",
    body: "Spend two weeks on a single end-to-end project: design doc, schema, deploy, postmortem. That moves system design from 54 → 75. Add a one-page portfolio with three case studies. Don't chase certifications — ship.",
  },
  {
    icon: MessageSquare,
    title: "Honest feedback",
    body: "You're closer than you think. Your weakness isn't skill — it's narrative. Your resume buries your best work. Lead every bullet with the outcome, not the tool. Hiring managers scan in 7 seconds.",
  },
  {
    icon: Award,
    title: "Final recommendation",
    body: "Apply to Stripe, Linear, and Figma this week. They reward your profile shape. Skip Vercel for now — their ML-heavy postings will out-rank you. Re-run this analysis after you ship one new project.",
  },
];

function Fit() {
  const [i, setI] = useState(0);

  return (
    <div className="px-6 pb-12">
      <div className="mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> AI Reasoning · Live
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold">Your Honest Fit</h1>
          <p className="mt-3 text-muted-foreground">No fluff. No "you've got this." Just signal — generated for your profile.</p>
        </motion.div>

        <div className="space-y-4">
          {SECTIONS.slice(0, i + 1).map((s, idx) => {
            const Icon = s.icon;
            const isLast = idx === i;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass rounded-2xl p-5 sm:p-6"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs uppercase tracking-[0.15em] text-primary mb-1">{s.title}</div>
                    <div className="text-[15px] leading-relaxed text-foreground/90">
                      {isLast ? (
                        <TypingText text={s.body} speed={14} onDone={() => setI((v) => Math.min(v + 1, SECTIONS.length - 1))} />
                      ) : (
                        s.body
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {i >= SECTIONS.length - 1 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/jobs"><GlowButton size="lg">View matching jobs <ArrowRight className="h-4 w-4" /></GlowButton></Link>
            <button onClick={() => setI(0)} className="rounded-full glass px-5 py-2.5 text-sm hover:bg-foreground/5">Replay analysis</button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
