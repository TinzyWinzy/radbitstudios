"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Truck,
  Store,
  Factory,
  Wheat,
  Shield,
  Droplets,
  Users,
  Globe,
  ChevronRight,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { MagneticButton } from "@/components/magnetic-button"

type Industry = "logistics" | "retail" | "manufacturing" | "agribusiness" | null
type FailurePoint = "compliance" | "leakage" | "employee-error" | "cross-border-friction" | null
type Step = "industry" | "failure" | "result"

const INDUSTRIES: { id: Industry; label: string; icon: typeof Truck; description: string }[] = [
  { id: "logistics", label: "Logistics", icon: Truck, description: "Fleet, warehousing, cross-border haulage" },
  { id: "retail", label: "Retail", icon: Store, description: "Wholesale, retail chains, informal trade" },
  { id: "manufacturing", label: "Manufacturing", icon: Factory, description: "Processing, assembly, industrial production" },
  { id: "agribusiness", label: "Agribusiness", icon: Wheat, description: "Farming, agro-processing, export crops" },
]

const FAILURE_POINTS: { id: FailurePoint; label: string; icon: typeof Shield; description: string }[] = [
  { id: "compliance", label: "Compliance", icon: Shield, description: "Tenders rejected, regulatory fines, missed filings" },
  { id: "leakage", label: "Leakage", icon: Droplets, description: "Inventory theft, margin erosion, unauthorized discounts" },
  { id: "employee-error", label: "Employee Error", icon: Users, description: "Manual data entry mistakes, process deviation, fraud" },
  { id: "cross-border-friction", label: "Cross-Border Friction", icon: Globe, description: "Customs delays, forex barriers, partner verification" },
]

const DIAGNOSTIC_RESPONSES: Record<string, Record<string, { headline: string; insight: string; prescription: string; armor: string; href: string }>> = {
  logistics: {
    compliance: {
      headline: "Your Compliance Surface Area Is Bleeding Tenders.",
      insight: "Logistics operators in SADC lose an estimated 34% of eligible government tenders on technical compliance grounds alone — missing PRAZ forms, expired tax clearances, or incorrect tariff classifications. Your operations may be sound; your paper trail is not.",
      prescription: "Radbit's Compliance Shield simulates the procurement officer's disqualification sequence against every active tender in your category. It flags gaps before submission, not after rejection.",
      armor: "Recommended: Tender Intelligence Suite + Regulatory Command Centre",
      href: "/tenders",
    },
    leakage: {
      headline: "Fuel, Spares, and Time Are Leaving Silently.",
      insight: "Logistics enterprises in the region report 8-15% operational leakage from unauthorized route deviations, unrecorded fuel usage, and ghost trips. These are not theft events — they are delegation gaps. Your protocols are not being enforced.",
      prescription: "Radbit's Executive Multiplier drops digital shadows onto your fleet and inventory systems. Every liter, every kilometer, every loading bay is reconciled against your rules. Alerts fire on anomalies, not activity.",
      armor: "Recommended: Operational Multipliers + Asset & Margin Protection",
      href: "/solutions",
    },
    "employee-error": {
      headline: "Your Dispatchers Are Making Decisions You Cannot Afford.",
      insight: "In high-volume logistics, manual dispatching errors compound into 6-figure annual losses — wrong routes, missed cross-border windows, incorrect customs declarations. Your people are good; the system is asking them to do machine work with human tools.",
      prescription: "Radbit's Agentic Automation replaces manual dispatching logic with Vertex AI pipelines that enforce your margin rules, customs protocols, and delivery SLAs automatically. Humans supervise exceptions, not transactions.",
      armor: "Recommended: Agentic System Automation + Operational Multipliers",
      href: "/solutions",
    },
    "cross-border-friction": {
      headline: "Your Trucks Are Waiting at the Border While Capital Moves Past You.",
      insight: "SADC logistics operators lose 12-20 days per cross-border shipment to customs delays, missing documentation, and buyer-side verification holds. The friction is not physical — it is informational. Your counterparties cannot verify your operational history fast enough.",
      prescription: "Radbit's Global Partner Passport transforms your dispatch records, customs filings, and trade history into an immutable blockchain track record. Border agents and buyers verify in minutes, not weeks.",
      armor: "Recommended: Global Partner Passport + Tender Intelligence Suite",
      href: "/solutions",
    },
  },
  retail: {
    compliance: {
      headline: "ZIMRA Is Not Your Problem. The Gaps You Cannot See Are.",
      insight: "Retail enterprises face the highest audit frequency in Zimbabwe. Manual till reconciliation, missing EFD receipts, and inconsistent tax filings create liability surfaces that compound silently across multiple branches. One audit spiral can erase a quarter's margin.",
      prescription: "Radbit's Compliance Shield connects directly to your POS and inventory systems, reconciling every transaction against ZIMRA FDMS requirements in real time. Exceptions surface before the auditor arrives.",
      armor: "Recommended: Asset & Margin Protection + Operational Multipliers",
      href: "/solutions",
    },
    leakage: {
      headline: "Your Inventory Is Leaking From Inside the Store.",
      insight: "Retailers in the SADC region report 12-20% inventory shrinkage from theft, supplier short-counts, and unauthorized discounts. These are not random events — they are delegation failures. Your staff have access; your system lacks enforcement.",
      prescription: "Radbit's Operational Multipliers deploy digital shadows across your stock rooms, tills, and supplier invoices. Every unit is tracked. Every discount is verified against your rules. Exceptions reach you instantly.",
      armor: "Recommended: Operational Multipliers + Asset & Margin Protection",
      href: "/solutions",
    },
    "employee-error": {
      headline: "Your Till Operators Are Costing You Margin Per Transaction.",
      insight: "Human error in retail — incorrect pricing, wrong change, unapproved discounts — compounds across thousands of daily transactions. The problem is not training; it is that manual processes cannot enforce your margin rules at scale.",
      prescription: "Radbit's Agentic Automation overlays your pricing and margin rules onto every POS transaction. Deviations are blocked or flagged in real time. Your operators work within a system that enforces your commercial intent.",
      armor: "Recommended: Agentic System Automation + Operational Multipliers",
      href: "/solutions",
    },
    "cross-border-friction": {
      headline: "Suppliers Are Credentialing You Out of the Supply Chain.",
      insight: "Regional retailers seeking to source directly from South African, Botswanan, or Zambian producers are blocked by a lack of verifiable payment histories, auditable financials, and trade compliance records. The goods exist; the trust does not.",
      prescription: "Radbit's Global Partner Passport publishes your payment discipline, supplier ratings, and trade volumes as an immutable credential. Suppliers verify your institutional reliability before the first invoice.",
      armor: "Recommended: Global Partner Passport + Tender Intelligence Suite",
      href: "/solutions",
    },
  },
  manufacturing: {
    compliance: {
      headline: "Your Factory Passes Inspection. Your Paperwork Does Not.",
      insight: "Manufacturers lose government and corporate procurement contracts not because their product is inferior, but because their environmental compliance, NSSA filings, or tax clearances have gaps. The buyer's compliance team eliminates you before engineering evaluates you.",
      prescription: "Radbit's Compliance Shield continuously monitors your regulatory surface area — NSSA, ZIMRA, EMA, Labour Act — and pre-flags every gap against active tender requirements. You arrive at evaluation complete.",
      armor: "Recommended: Tender Intelligence Suite + Regulatory Command Centre",
      href: "/tenders",
    },
    leakage: {
      headline: "Raw Materials Are Disappearing Into the Process.",
      insight: "Zimbabwean manufacturers report 6-14% material leakage between procurement and finished output — from unrecorded scrap, unauthorized machine usage, and supplier short-counts. These are gaps in your delegation architecture, not theft events.",
      prescription: "Radbit's Operational Multipliers track every input unit from supplier invoice to finished pallet. Variance alerts fire automatically when material consumption deviates from your standards.",
      armor: "Recommended: Operational Multipliers + Asset & Margin Protection",
      href: "/solutions",
    },
    "employee-error": {
      headline: "Your Production Targets Are Being Undermined by Manual Handoffs.",
      insight: "Manufacturing depends on precise specification transfer from procurement to production floor to QA. Each manual handoff introduces error — wrong materials ordered, incorrect tolerances set, missed batch records. These errors compound into rejected orders.",
      prescription: "Radbit's Agentic System Automation encodes your production protocols as executable rules. Materials, tolerances, and QA checks are enforced by Vertex AI pipelines, not clipboard checklists.",
      armor: "Recommended: Agentic System Automation + Custom Enterprise Architectures",
      href: "/solutions",
    },
    "cross-border-friction": {
      headline: "Your Products Are Ready. Your Credentials Are Not.",
      insight: "SADC manufacturers targeting export markets face repeated verification delays — buyers require auditable quality certifications, consistent lot records, and verifiable supply chain ethics. Your production quality is high; your documentation is not structured for institutional scrutiny.",
      prescription: "Radbit's Global Partner Passport structures your quality records, batch histories, and supplier audits into an immutable verifiable profile. International buyers verify your manufacturing credentials in hours, not weeks.",
      armor: "Recommended: Global Partner Passport + Agentic System Automation",
      href: "/solutions",
    },
  },
  agribusiness: {
    compliance: {
      headline: "Export Compliance Is Rejecting Your Shipments Before They Leave.",
      insight: "Agribusiness exporters lose an estimated 18% of cross-border shipments to phytosanitary documentation errors, incorrect tariff classification, or missing certificate of origin. The crop is fine; the paper trail fails at the border.",
      prescription: "Radbit's Compliance Shield pre-audits every export consignment against SADC and AfCFTA phytosanitary requirements, rules of origin, and buyer-specific compliance matrices. Exceptions surface before loading.",
      armor: "Recommended: Tender Intelligence Suite + Global Partner Passport",
      href: "/tenders",
    },
    leakage: {
      headline: "Post-Harvest Loss Is a Delegation Problem, Not a Storage Problem.",
      insight: "Agribusinesses report 20-40% post-harvest loss, but cold chain infrastructure is only part of the equation. The larger gap is poor coordination between harvest timing, transport booking, and buyer readiness — manual delegation failures across disconnected stakeholders.",
      prescription: "Radbit's Operational Multipliers connect your entire value chain — field supervisors, transporters, cold storage, and buyers — into a single coordination protocol. Harvest-to-dispatch windows are enforced automatically.",
      armor: "Recommended: Operational Multipliers + Asset & Margin Protection",
      href: "/solutions",
    },
    "employee-error": {
      headline: "Field Data Is Being Lost Between the Soil and the Spreadsheet.",
      insight: "Agribusiness decisions — planting windows, input application, harvest timing — depend on accurate field data. Manual recording introduces errors that cascade into wrong input orders, missed pest windows, and misreported yields.",
      prescription: "Radbit's Agentic System Automation deploys mobile-first data collection protocols that enforce field reporting standards. AI pipelines validate incoming data against historical patterns and flag anomalies before they become decisions.",
      armor: "Recommended: Agentic System Automation + Custom Enterprise Architectures",
      href: "/solutions",
    },
    "cross-border-friction": {
      headline: "Diaspora Buyers Want Your Crop. They Cannot Trust Your Ledger.",
      insight: "Diaspora investors and international buyers increasingly require auditable farm-to-export records — provenance tracking, fair labor certification, environmental compliance. Without institutional-grade records, your premium product gets commodity pricing.",
      prescription: "Radbit's Global Partner Passport records every stage of your value chain as an immutable credential — from seed purchase to export clearance. Buyers verify your entire history before the first negotiation.",
      armor: "Recommended: Global Partner Passport + Tender Intelligence Suite",
      href: "/solutions",
    },
  },
}

export function OperationalStressTester() {
  const [step, setStep] = useState<Step>("industry")
  const [industry, setIndustry] = useState<Industry>(null)
  const [failurePoint, setFailurePoint] = useState<FailurePoint>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleIndustrySelect = useCallback((id: Industry) => {
    setIndustry(id)
    setStep("failure")
  }, [])

  const handleFailureSelect = useCallback((id: FailurePoint) => {
    setFailurePoint(id)
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setStep("result")
    }, 1200)
  }, [])

  const handleReset = useCallback(() => {
    setStep("industry")
    setIndustry(null)
    setFailurePoint(null)
  }, [])

  const result =
    industry && failurePoint ? DIAGNOSTIC_RESPONSES[industry]?.[failurePoint] : null

  return (
    <div className="w-full max-w-2xl mx-auto" id="diagnostic">
      <AnimatePresence mode="wait">
        {step === "industry" && (
          <motion.div
            key="industry"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium">
                <AlertTriangle className="h-3 w-3" />
                Step 1 of 2
              </div>
              <h3 className="font-headline text-xl font-bold text-foreground">What Industry Are You In?</h3>
              <p className="text-sm text-muted-foreground">
                Your diagnostic is calibrated to your specific operational reality.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {INDUSTRIES.map((ind) => {
                const Icon = ind.icon
                return (
                  <button
                    key={ind.id}
                    onClick={() => handleIndustrySelect(ind.id)}
                    className="group relative p-4 md:p-5 rounded-xl border border-border/60 bg-card/30 hover:border-primary/40 hover:bg-primary/[0.03] transition-all duration-200 text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h4 className="font-headline font-bold text-foreground text-sm mb-0.5">{ind.label}</h4>
                    <p className="text-xs text-muted-foreground/60">{ind.description}</p>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {step === "failure" && (
          <motion.div
            key="failure"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium">
                <AlertTriangle className="h-3 w-3" />
                Step 2 of 2
              </div>
              <h3 className="font-headline text-xl font-bold text-foreground">Where Is the Pressure Point?</h3>
              <p className="text-sm text-muted-foreground">
                Select the failure mode that costs your enterprise the most.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {FAILURE_POINTS.map((fp) => {
                const Icon = fp.icon
                return (
                  <button
                    key={fp.id}
                    onClick={() => handleFailureSelect(fp.id)}
                    className="group relative p-4 md:p-5 rounded-xl border border-border/60 bg-card/30 hover:border-red-500/40 hover:bg-red-500/[0.03] transition-all duration-200 text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 mb-3 group-hover:bg-red-500/20 transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h4 className="font-headline font-bold text-foreground text-sm mb-0.5">{fp.label}</h4>
                    <p className="text-xs text-muted-foreground/60">{fp.description}</p>
                  </button>
                )
              })}
            </div>
            <div className="text-center">
              <button
                onClick={handleReset}
                className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                ← Back to industry selection
              </button>
            </div>
          </motion.div>
        )}

        {step === "result" && isGenerating && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16 space-y-4"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Calibrating diagnostic to your operational profile...</p>
          </motion.div>
        )}

        {step === "result" && !isGenerating && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-xl border border-primary/20 bg-primary/[0.03] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-medium text-primary uppercase tracking-wider">
                    <BarChart3 className="h-3 w-3" />
                    Diagnostic Complete
                  </div>
                  <p className="text-xs text-muted-foreground/60">
                    {INDUSTRIES.find((i) => i.id === industry)?.label} &middot;{" "}
                    {FAILURE_POINTS.find((f) => f.id === failurePoint)?.label}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-headline text-lg font-bold text-foreground leading-snug">
                  {result.headline}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.insight}</p>
                <div className="p-3 rounded-lg border border-border/50 bg-card/50">
                  <p className="text-sm text-foreground/80 font-medium leading-relaxed">
                    <span className="text-primary">Radbit&apos;s prescription: </span>
                    {result.prescription}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-primary/70">
                  <Shield className="h-3 w-3" />
                  <span>{result.armor}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <MagneticButton asChild size="default" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-headline text-sm">
                <Link href={result.href}>
                  Deploy This Armor
                  <ChevronRight className="ml-1.5 h-4 w-4" />
                </Link>
              </MagneticButton>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              >
                Run Another Diagnostic
              </button>
            </div>

            <p className="text-center text-[10px] text-muted-foreground/40">
              This diagnostic uses a Vertex AI RAG pipeline grounded in SADC market parameters. No personal data is collected at this stage.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}