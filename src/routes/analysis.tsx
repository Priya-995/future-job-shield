import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, ArrowLeft, RotateCcw, Briefcase } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from "recharts";
import { TrustScoreRing } from "@/components/TrustScoreRing";
import { LoadingScanner } from "@/components/LoadingScanner";
import { GlowButton } from "@/components/GlowButton";
import { useAnalysisStore } from "@/lib/store";
import { analyze } from "@/lib/mock-analysis";

export const Route = createFileRoute("/analysis")({
  head: () => ({
    meta: [
      { title: "AI Trust Analysis — TrustHire" },
      { name: "description", content: "Live AI breakdown of a job posting's trust signals." },
      { property: "og:title", content: "AI Trust Analysis — TrustHire" },
      { property: "og:description", content: "Trust score, fraud risk, salary transparency, and more." },
    ],
  }),
  component: Analysis,
});

function Analysis() {
  const input = useAnalysisStore((s) => s.input);
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    if (!input) {
      const t = setTimeout(() => navigate({ to: "/recruiter" }), 50);
      return () => clearTimeout(t);
    }
  }, [input, navigate]);

  const result = useMemo(() => (input ? analyze(input) : null), [input]);

  if (!input || !result) return null;

  return (
    <div className="px-6 pb-12">
      <div className="mx-auto max-w-6xl">
        <Link to="/recruiter" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to recruiter
        </Link>

        {scanning ? (
          <div className="glass rounded-3xl">
            <LoadingScanner onDone={() => setScanning(false)} />
          </div>
        ) : (
          <Results input={input} result={result} onRescan={() => setScanning(true)} />
        )}
      </div>
    </div>
  );
}

function Results({ input, result, onRescan }: { input: { company: string; jobTitle: string }; result: ReturnType<typeof analyze>; onRescan: () => void }) {
  const radarData = result.metrics.map((m) => ({ subject: m.label.replace(" ", "\n"), value: m.label === "Fraud Risk" ? 100 - m.value : m.value }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-6">
      {/* Header */}
      <div className="glass rounded-3xl p-6 sm:p-10 grid md:grid-cols-[280px_1fr] gap-8 items-center">
        <div className="flex justify-center">
          <TrustScoreRing score={result.trustScore} size={240} />
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-primary">Verdict</div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">{result.verdict}</h1>
          <div className="mt-3 text-muted-foreground flex items-center gap-2">
            <Briefcase className="h-4 w-4" /> {input.jobTitle} <span className="text-foreground/40">·</span> {input.company}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={onRescan} className="inline-flex items-center gap-1.5 rounded-full glass px-4 py-2 text-sm hover:bg-foreground/5">
              <RotateCcw className="h-3.5 w-3.5" /> Re-run
            </button>
            <Link to="/jobs"><GlowButton size="md">View matching candidates</GlowButton></Link>
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {result.metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="glass rounded-2xl p-5"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{m.label}</div>
              <div className={`text-2xl font-display font-bold tabular-nums ${m.tone === "good" ? "text-gradient" : m.tone === "warn" ? "text-warning" : "text-destructive"}`}>
                {m.value}
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-foreground/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${m.value}%` }}
                transition={{ duration: 1.2, delay: 0.2 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className={`h-full rounded-full ${m.tone === "good" ? "bg-gradient-primary" : m.tone === "warn" ? "bg-warning" : "bg-destructive"}`}
                style={{ boxShadow: m.tone === "good" ? "0 0 12px var(--primary)" : undefined }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Signals + Radar */}
      <div className="grid lg:grid-cols-[1fr_1fr_360px] gap-4">
        <SignalCol title="Positive Signals" tone="good" items={result.positives} />
        <SignalCol title="Suspicious Signals" tone="bad" items={result.suspicious} />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-5">
          <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">Trust Profile</div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="oklch(0.4 0.04 275 / 0.4)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "oklch(0.7 0.03 265)", fontSize: 10 }} />
              <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
              <Radar dataKey="value" stroke="oklch(0.72 0.2 280)" fill="oklch(0.65 0.22 280)" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  );
}

function SignalCol({ title, tone, items }: { title: string; tone: "good" | "bad"; items: string[] }) {
  const Icon = tone === "good" ? CheckCircle2 : AlertTriangle;
  const color = tone === "good" ? "text-success" : "text-destructive";
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-5">
      <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">{title}</div>
      <ul className="space-y-3">
        {items.length === 0 && <li className="text-sm text-muted-foreground">— none detected —</li>}
        {items.map((s, i) => (
          <motion.li
            key={s}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className="flex items-start gap-2 text-sm"
          >
            <Icon className={`h-4 w-4 ${color} flex-shrink-0 mt-0.5`} />
            <span>{s}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
