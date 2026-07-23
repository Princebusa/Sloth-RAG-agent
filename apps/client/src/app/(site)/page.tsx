"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  Check,
  Cloud,
  FileText,
  MessageSquare,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";



const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <main>
        <Hero heroRef={heroRef} heroY={heroY} heroOpacity={heroOpacity} />
        <LogoStrip />
        <Features />
        <HowItWorks />
        <ChatPreview />
        <CTA />
      </main>
    </div>
  );
}

function Hero({
  heroRef,
  heroY,
  heroOpacity,
}: {
  heroRef: React.RefObject<HTMLDivElement | null>;
  heroY: ReturnType<typeof useTransform<number, number>>;
  heroOpacity: ReturnType<typeof useTransform<number, number>>;
}) {
  return (
    <section ref={heroRef} className="relative pt-16 pb-24">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="absolute inset-0 dotted-grid opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black,transparent)] pointer-events-none" />

      <motion.div
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative max-w-6xl mx-auto px-6"
      >
        <div className="surface-card p-8 md:p-16 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                </span>
                Now indexing Google Drive
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
                Your Google Drive{" "}
                <span className="font-display italic text-gradient">finally</span>{" "}
                has a brain.
              </h1>

              <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                Sloth connects to your Google Drive, understands your documents,
                and turns them into a conversation. Ask anything — get answers
                with sources.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <a
                  href="#cta"
                  className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] hover:bg-primary/90 transition"
                >
                  Connect Google Drive
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                </a>
                <a
                  href="#how"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm text-foreground hover:bg-surface-elevated transition"
                >
                  See how it works
                </a>
              </div>

              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-primary" /> No credit card
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-primary" /> Private & secure
                </span>
              </div>
            </motion.div>

            <HeroVisual />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <div className="relative z-10 bg-surface-elevated rounded-2xl border border-border shadow-[var(--shadow-soft)] overflow-hidden">
        <div className="border-b border-border px-4 py-3 flex items-center gap-2 bg-surface">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-border" />
            <div className="w-2.5 h-2.5 rounded-full bg-border" />
            <div className="w-2.5 h-2.5 rounded-full bg-border" />
          </div>
          <div className="mx-auto text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
            sloth · /q4-strategy
          </div>
        </div>

        <div className="p-6 space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-secondary shrink-0" />
            <div className="bg-secondary px-4 py-2.5 rounded-2xl rounded-tl-none text-sm text-foreground max-w-xs">
              Summarize the Q4 strategy deck and pull revenue targets.
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="flex gap-3 flex-row-reverse"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <div className="bg-surface border border-border px-4 py-3 rounded-2xl rounded-tr-none text-sm space-y-2 max-w-sm shadow-sm">
              <p>
                Q4 focuses on three bets: enterprise expansion, self-serve
                pricing, and AI-native onboarding. Revenue target is{" "}
                <span className="text-primary font-medium">$4.8M</span>, up 32% QoQ.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["Q4-Strategy.pdf", "Revenue-Model.xlsx", "Roadmap.docx"].map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground"
                  >
                    <FileText className="w-3 h-3" /> {f}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="px-4 py-3 border-t border-border bg-surface">
          <div className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground flex justify-between items-center">
            <span>Ask Sloth anything about your Drive…</span>
            <span className="text-primary font-medium">⌘K</span>
          </div>
        </div>
      </div>

      <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-border/40 rounded-full blur-3xl" />
    </motion.div>
  );
}

function LogoStrip() {
  const items = ["Docs", "Sheets", "Slides", "PDF", "Markdown", "Notion Export"];
  return (
    <section className="border-y border-border bg-surface/50">
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-xs uppercase tracking-widest text-muted-foreground">
        <span className="text-foreground/60">Understands</span>
        {items.map((i) => (
          <span key={i}>{i}</span>
        ))}
      </div>
    </section>
  );
}

const features = [
  {
    icon: Cloud,
    title: "One-click Drive sync",
    desc: "Connect Google Drive in seconds. Sloth continuously indexes new and updated files.",
  },
  {
    icon: MessageSquare,
    title: "Conversational search",
    desc: "Ask questions in plain language. Get precise answers with citations to source files.",
  },
  {
    icon: Zap,
    title: "Instant summaries",
    desc: "Turn 40-page decks into bullets. Extract action items from meeting notes in a click.",
  },
  {
    icon: Shield,
    title: "Private by default",
    desc: "Your documents never train public models. Encrypted at rest, revocable anytime.",
  },
];

function Features() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-32">
      <SectionHeading
        eyebrow="Features"
        title={
          <>
            Your Drive,{" "}
            <span className="font-display italic text-gradient">but thinking</span>.
          </>
        }
        subtitle="Sloth builds a private knowledge graph over your files so you can find, summarize, and reason across everything you own."
      />

      <motion.div
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08 } },
        }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mt-16 grid gap-4 md:grid-cols-2"
      >
        {features.map((f) => (
          <motion.div
            key={f.title}
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="surface-card p-8 hover:border-primary/30 transition group"
          >
            <div className="w-11 h-11 rounded-xl bg-secondary border border-border flex items-center justify-center mb-5 group-hover:bg-primary/10 transition">
              <f.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-medium tracking-tight">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

const steps = [
  {
    n: "01",
    title: "Connect your Drive",
    desc: "Authorize Sloth in one click. Choose folders or your whole Drive.",
  },
  {
    n: "02",
    title: "We index in the background",
    desc: "Sloth reads, chunks, and embeds every doc into a private vector index.",
  },
  {
    n: "03",
    title: "Ask anything",
    desc: "Chat across all your files with sources and instant follow-ups.",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="relative py-32 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          eyebrow="How it works"
          title={
            <>
              Three steps to a{" "}
              <span className="font-display italic text-gradient">smarter</span>{" "}
              workspace.
            </>
          }
          subtitle="From authorization to answer in under a minute."
        />

        <div className="mt-16 grid gap-8 md:grid-cols-3 relative">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
              className="relative"
            >
              <div className="text-xs font-mono text-primary mb-4">{s.n}</div>
              <h3 className="text-xl font-medium tracking-tight">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              <div className="mt-6 h-px w-16 bg-gradient-to-r from-primary to-transparent" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ChatPreview() {
  const msgs = [
    { from: "u", text: "What did the design team ship last sprint?" },
    {
      from: "a",
      text: "Design shipped 4 items: new onboarding flow, dashboard v2 (in review), icon system refresh, and updated marketing site hero.",
    },
    { from: "u", text: "Draft an email to investors summarizing it." },
    {
      from: "a",
      text: "Drafted. Pulled context from Sprint-42.md, Design-Review.pdf, and last week's all-hands notes.",
    },
  ];

  return (
    <section id="preview" className="max-w-5xl mx-auto px-6 py-32">
      <SectionHeading
        eyebrow="Preview"
        title={
          <>
            A conversation with{" "}
            <span className="font-display italic text-gradient">everything</span>.
          </>
        }
        subtitle="Sloth reads across your whole Drive so answers come from the full picture, not one file."
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mt-16 surface-card p-6 md:p-10 shadow-[var(--shadow-soft)]"
      >
        <div className="space-y-4">
          {msgs.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className={m.from === "u" ? "flex justify-end" : "flex items-start gap-3"}
            >
              {m.from === "a" && (
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
              <div
                className={
                  m.from === "u"
                    ? "max-w-md rounded-2xl rounded-tr-sm bg-secondary px-4 py-2.5 text-sm"
                    : "max-w-xl rounded-2xl rounded-tl-sm bg-surface-elevated border border-border px-4 py-3 text-sm shadow-sm"
                }
              >
                {m.text}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground flex-1">
            Ask Sloth anything about your Drive…
          </span>
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
            <ArrowRight className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function CTA() {
  return (
    <section id="cta" className="mx-auto max-w-4xl px-6 py-32">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden surface-card p-12 text-center md:p-16"
      >
        <div className="pointer-events-none absolute inset-0 bg-hero-glow opacity-70" />
        <div className="relative">
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Meet the slowest way to <br />
            <span className="font-display italic text-gradient">work faster</span>.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Join teams turning their Drive into an AI-powered second brain.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition hover:bg-primary/90"
            >
              Connect Google Drive
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              Book a demo →
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-2xl text-center"
    >
      <div className="mb-4 text-xs tracking-[0.2em] text-primary/80 uppercase">
        {eyebrow}
      </div>
      <h2 className="text-4xl font-semibold tracking-tight leading-[1.05] md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-muted-foreground">{subtitle}</p>
    </motion.div>
  );
}
