import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ShieldCheck, Globe, DollarSign, Users, Sparkles, Zap, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { GlowButton } from "@/components/GlowButton";
import { TrustScoreRing } from "@/components/TrustScoreRing";
import { FloatingAICard } from "@/components/FloatingAICard";
import { AnimatedStat } from "@/components/AnimatedStat";
import { features, liveStats, testimonials } from "@/lib/mock-data";

const ICONS = { shield: ShieldCheck, globe: Globe, dollar: DollarSign, users: Users, sparkles: Sparkles, zap: Zap } as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TrustHire — Jobs we can prove are real" },
      { name: "description", content: "AI-powered hiring trust platform. Detect fake jobs, ghost listings, and recruiter scams in seconds." },
      { property: "og:title", content: "TrustHire — Jobs we can prove are real" },
      { property: "og:description", content: "AI trust scoring for every job. For students and recruiters." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative">
      {/* HERO */}
      <section className="relative px-6 pt-12 pb-32 overflow-hidden">
        <div className="mx-auto max-w-6xl relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-medium mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              AI Trust Engine · Live
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold tracking-tight max-w-5xl mx-auto leading-[1.05]">
              We don't show <span className="text-muted-foreground/60">more</span> jobs.<br />
              We show jobs we can <span className="text-gradient">prove are real.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              AI-powered hiring trust platform for students and recruiters. Every job earns its score. Or it doesn't show up.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link to="/recruiter"><GlowButton size="lg">Analyze a Job <ArrowRight className="h-4 w-4" /></GlowButton></Link>
              <Link to="/jobs"><GlowButton size="lg" variant="ghost">Browse Verified Jobs</GlowButton></Link>
            </div>
          </motion.div>

          {/* Trust ring + floating cards */}
          <div className="relative mt-20 flex items-center justify-center min-h-[420px]">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }} className="relative">
              <div className="absolute inset-0 -m-12 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />
              <TrustScoreRing score={94} size={280} />
            </motion.div>

            <FloatingAICard delay={0.6} className="hidden md:block absolute left-0 top-8 max-w-[230px]">
              <div className="flex items-center gap-2 text-xs text-success mb-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Domain Verified</div>
              <div className="text-sm font-medium">stripe.com</div>
              <div className="text-[11px] text-muted-foreground mt-1">Registered 14yrs · SSL valid · trusted</div>
            </FloatingAICard>
            <FloatingAICard delay={0.9} className="hidden md:block absolute right-0 top-0 max-w-[230px]">
              <div className="flex items-center gap-2 text-xs text-warning mb-1.5"><AlertTriangle className="h-3.5 w-3.5" /> Salary Outlier</div>
              <div className="text-sm font-medium">$5,000/week · Remote</div>
              <div className="text-[11px] text-muted-foreground mt-1">11x market median · flagged</div>
            </FloatingAICard>
            <FloatingAICard delay={1.1} className="hidden lg:block absolute right-12 bottom-4 max-w-[230px]">
              <div className="flex items-center gap-2 text-xs text-accent mb-1.5"><Sparkles className="h-3.5 w-3.5" /> AI Match</div>
              <div className="text-sm font-medium">React + TypeScript</div>
              <div className="text-[11px] text-muted-foreground mt-1">92% fit · grow: system design</div>
            </FloatingAICard>
            <FloatingAICard delay={1.3} className="hidden lg:block absolute left-12 bottom-0 max-w-[230px]">
              <div className="flex items-center gap-2 text-xs text-primary mb-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Recruiter Auth</div>
              <div className="text-sm font-medium">3yr tenure · 94% reply</div>
              <div className="text-[11px] text-muted-foreground mt-1">verified across platform</div>
            </FloatingAICard>
          </div>
        </div>
      </section>

      {/* LIVE STATS */}
      <section className="px-6">
        <div className="mx-auto max-w-6xl glass rounded-3xl p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {liveStats.map((s) => (
            <AnimatedStat key={s.label} value={s.value} label={s.label} suffix={s.suffix} />
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 mt-32">
        <div className="mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <div className="text-xs uppercase tracking-[0.2em] text-primary mb-3">The Trust Engine</div>
            <h2 className="text-3xl sm:text-5xl font-display font-bold">Six layers of verification.<br />Zero ghost jobs.</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => {
              const Icon = ICONS[f.icon as keyof typeof ICONS];
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className="glass rounded-2xl p-6 group hover:glow-primary transition-all"
                >
                  <div className="h-11 w-11 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="font-semibold text-lg">{f.title}</div>
                  <div className="text-sm text-muted-foreground mt-1.5">{f.desc}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 mt-32">
        <div className="mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <div className="text-xs uppercase tracking-[0.2em] text-accent mb-3">Three Steps</div>
            <h2 className="text-3xl sm:text-5xl font-display font-bold">From posting to <span className="text-gradient">proof</span>.</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { n: "01", t: "Submit", d: "Recruiters submit a job. Students upload a resume." },
              { n: "02", t: "Analyze", d: "AI runs 32 trust signals across domain, salary, language, and behavior." },
              { n: "03", t: "Decide", d: "We give you a score, the why, and an honest fit verdict." },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass rounded-2xl p-8 relative overflow-hidden"
              >
                <div className="text-6xl font-display font-bold text-primary/15 absolute top-2 right-4">{s.n}</div>
                <div className="font-display text-2xl font-bold">{s.t}</div>
                <div className="text-sm text-muted-foreground mt-2">{s.d}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-6 mt-32">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-center mb-14">Loved by students.<br /><span className="text-gradient">Trusted by recruiters.</span></h2>
          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass rounded-2xl p-6"
              >
                <p className="text-sm leading-relaxed">"{t.quote}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-semibold text-primary-foreground">{t.avatar}</div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 mt-32">
        <div className="mx-auto max-w-4xl glass-strong rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-primary opacity-10" />
          <div className="relative">
            <h2 className="text-3xl sm:text-5xl font-display font-bold">Stop guessing.<br />Start <span className="text-gradient">trusting</span>.</h2>
            <p className="mt-4 text-muted-foreground">Drop in a job posting. Get a verdict in seconds.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/recruiter"><GlowButton size="lg">Run Trust Analysis <Sparkles className="h-4 w-4" /></GlowButton></Link>
              <Link to="/student"><GlowButton size="lg" variant="ghost">I'm a Student</GlowButton></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
