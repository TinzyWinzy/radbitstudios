"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  AlertTriangle,
  Shield,
  ChevronRight,
  ArrowRight,
  Clock,
  FileWarning,
  Target,
  Swords,
  Network,
  ScrollText,
} from "lucide-react"
import { MagneticButton } from "@/components/magnetic-button"
import Link from "next/link"

interface ThreatHolonProps {
  holon: {
    holon_type: string
    metadata: {
      target_keyword: string
      trigger_event: string
      trigger_source: string
      generated_at: string
      risk_level: "critical" | "high" | "medium" | "low"
    }
    hero_section: {
      h1_headline: string
      sub_headline: string
    }
    diagnostic_widget: {
      widget_title: string
      prompt_text: string
      underlying_radbit_solution: string
    }
    market_reality_copy: {
      paragraph_1: string
      paragraph_2: string
    }
    pillar_mapping?: {
      primary_pillar: string
      secondary_pillar?: string
      armor_layer: string
    }
  }
}

const RISK_COLORS: Record<string, { border: string; bg: string; text: string; label: string }> = {
  critical: { border: "border-red-500/50", bg: "bg-red-950/30", text: "text-red-400", label: "Critical" },
  high: { border: "border-orange-500/50", bg: "bg-orange-950/30", text: "text-orange-400", label: "High" },
  medium: { border: "border-yellow-500/50", bg: "bg-yellow-950/30", text: "text-yellow-400", label: "Medium" },
  low: { border: "border-green-500/50", bg: "bg-green-950/30", text: "text-green-400", label: "Low" },
}

const PILLAR_ICONS: Record<string, typeof Shield> = {
  simbare_engine: Swords,
  executive_multiplier: Network,
  global_passport: ScrollText,
}

const PILLAR_LABELS: Record<string, string> = {
  simbare_engine: "SimbaRE Engine (Tender Compliance Shield)",
  executive_multiplier: "Executive Multiplier (Agentic ERP)",
  global_passport: "Global Partner Passport (Blockchain Ledgers)",
}

export function ThreatAssessmentHolon({ holon }: ThreatHolonProps) {
  const [showDiagnostic, setShowDiagnostic] = useState(false)
  const [userWorkflow, setUserWorkflow] = useState("")
  const riskConfig = RISK_COLORS[holon.metadata.risk_level] || RISK_COLORS.medium

  const PrimaryIcon = PILLAR_ICONS[holon.pillar_mapping?.primary_pillar || ""] || Shield
  const SecondaryIcon = PILLAR_ICONS[holon.pillar_mapping?.secondary_pillar || ""] || Shield

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Risk Banner ── */}
      <div className={`sticky top-16 z-40 border-b ${riskConfig.border} ${riskConfig.bg} backdrop-blur-sm`}>
        <div className="container py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-3.5 w-3.5 ${riskConfig.text}`} />
            <span className={`font-semibold uppercase tracking-wider ${riskConfig.text}`}>
              {riskConfig.label} Risk Assessment
            </span>
            <span className="text-muted-foreground/50 mx-1">|</span>
            <span className="text-muted-foreground/70">{holon.metadata.trigger_event}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground/50">
            <Clock className="h-3 w-3" />
            <span>{new Date(holon.metadata.generated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* ── Hero Section ── */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.08),transparent_70%)]" />
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium">
              <FileWarning className="h-3 w-3" />
              Regulatory Threat Assessment
            </div>
            <h1 className="font-headline text-fluid-4xl md:text-fluid-5xl font-bold tracking-tighter leading-[0.95]">
              {holon.hero_section.h1_headline}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {holon.hero_section.sub_headline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <MagneticButton
                asChild
                size="default"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-headline text-sm"
              >
                <Link href="/assessment">
                  Stress-Test Your Compliance
                  <ChevronRight className="ml-1.5 h-4 w-4" />
                </Link>
              </MagneticButton>
              <button
                onClick={() => setShowDiagnostic(!showDiagnostic)}
                className="px-6 py-2.5 rounded-xl border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              >
                {showDiagnostic ? "Hide Diagnostic" : "Run the Simulator"}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Diagnostic Widget ── */}
      {showDiagnostic && (
        <section className="border-t border-border py-12">
          <div className="container max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border/50 bg-card/30 p-6 md:p-8 space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-foreground">{holon.diagnostic_widget.widget_title}</h3>
                  <p className="text-xs text-muted-foreground/60">60-second assessment</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{holon.diagnostic_widget.prompt_text}</p>
              <textarea
                value={userWorkflow}
                onChange={(e) => setUserWorkflow(e.target.value)}
                placeholder="Describe your current document management and compliance workflow..."
                rows={3}
                className="w-full rounded-lg border border-border/50 bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground/50">
                  <span className="text-primary/70">Radbit solution: </span>
                  {holon.diagnostic_widget.underlying_radbit_solution}
                </p>
                <button
                  disabled={!userWorkflow.trim()}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Analyze Workflow
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Market Reality Copy ── */}
      <section className="border-t border-border py-16 md:py-24">
        <div className="container max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="font-headline text-2xl font-bold tracking-tight flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              What This Means for Your Enterprise
            </h2>
            <p className="text-base text-foreground/70 leading-relaxed">{holon.market_reality_copy.paragraph_1}</p>
            <div className="p-5 rounded-xl border border-primary/10 bg-primary/[0.02]">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-base text-foreground/80 leading-relaxed">{holon.market_reality_copy.paragraph_2}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Pillar Mapping ── */}
      {holon.pillar_mapping && (
        <section className="border-t border-border py-16 bg-muted/20">
          <div className="container max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="font-headline text-2xl font-bold tracking-tight">Radbit&apos;s Armor Layer</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl border border-border/50 bg-card/30">
                  <div className="flex items-center gap-2 mb-3">
                    <PrimaryIcon className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-primary uppercase tracking-wider">Primary</span>
                  </div>
                  <p className="text-sm text-foreground/80 font-medium">
                    {PILLAR_LABELS[holon.pillar_mapping.primary_pillar] || holon.pillar_mapping.primary_pillar}
                  </p>
                </div>
                {holon.pillar_mapping.secondary_pillar && (
                  <div className="p-5 rounded-xl border border-border/50 bg-card/30">
                    <div className="flex items-center gap-2 mb-3">
                      <SecondaryIcon className="h-4 w-4 text-secondary" />
                      <span className="text-xs font-medium text-secondary uppercase tracking-wider">Secondary</span>
                    </div>
                    <p className="text-sm text-foreground/80 font-medium">
                      {PILLAR_LABELS[holon.pillar_mapping.secondary_pillar] || holon.pillar_mapping.secondary_pillar}
                    </p>
                  </div>
                )}
              </div>
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-center">
                <p className="text-sm text-foreground/80 font-medium">
                  Recommended Stack:{" "}
                  <span className="text-primary">{holon.pillar_mapping.armor_layer}</span>
                </p>
              </div>
              <div className="text-center">
                <MagneticButton asChild size="default" className="bg-primary text-primary-foreground hover:bg-primary/90 font-headline text-sm">
                  <Link href="/solutions#diagnostic">
                    Deploy This Armor
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </MagneticButton>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Trust Signal ── */}
      <section className="py-8 border-t border-border">
        <div className="container text-center">
          <p className="text-xs text-muted-foreground/40">
            This analysis was generated by Radbit's policy monitoring system, which tracks changes from {holon.metadata.trigger_source} and other regional regulatory bodies in real time.
          </p>
        </div>
      </section>
    </div>
  )
}
