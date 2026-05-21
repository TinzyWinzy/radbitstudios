export type MaturityLevel = "early_stage" | "getting_started" | "building_momentum" | "digitally_ready";

export interface MaturityLevelInfo {
  key: MaturityLevel;
  label: string;
  minScore: number;
  maxScore: number;
  color: string;
  description: string;
  nextAction: string;
}

export const MATURITY_LEVELS: MaturityLevelInfo[] = [
  {
    key: "early_stage",
    label: "Early Stage",
    minScore: 0,
    maxScore: 39,
    color: "#EF4444",
    description: "Your business is at the beginning of its digital journey.",
    nextAction: "Focus on establishing basic digital tools — email, online presence, and digital record-keeping.",
  },
  {
    key: "getting_started",
    label: "Getting Started",
    minScore: 40,
    maxScore: 59,
    color: "#F97316",
    description: "You've taken the first steps toward digital adoption.",
    nextAction: "Build on your foundation — explore digital marketing, online payments, and cloud-based tools.",
  },
  {
    key: "building_momentum",
    label: "Building Momentum",
    minScore: 60,
    maxScore: 79,
    color: "#EAB308",
    description: "Your business is actively adopting digital solutions.",
    nextAction: "Optimize and integrate — connect your systems, automate processes, and strengthen cybersecurity.",
  },
  {
    key: "digitally_ready",
    label: "Digitally Ready",
    minScore: 80,
    maxScore: 100,
    color: "#22C55E",
    description: "Your business is digitally mature and well-positioned for growth.",
    nextAction: "Innovate and scale — explore AI-driven insights, advanced analytics, and new digital revenue streams.",
  },
];

export type BadgeId =
  | "profile_complete"
  | "assessment_complete"
  | "early_stage"
  | "building_momentum"
  | "digitally_ready"
  | "repeat_assessment"
  | "score_improver";

export interface BadgeInfo {
  id: BadgeId;
  label: string;
  description: string;
  icon: string;
}

export const BADGE_DEFINITIONS: Record<BadgeId, BadgeInfo> = {
  profile_complete: {
    id: "profile_complete",
    label: "Profile Complete",
    description: "Filled in your business profile details.",
    icon: "CheckCircle2",
  },
  assessment_complete: {
    id: "assessment_complete",
    label: "Assessment Done",
    description: "Completed your first Digital Readiness Assessment.",
    icon: "ClipboardCheck",
  },
  early_stage: {
    id: "early_stage",
    label: "Early Stage",
    description: "Scored in the Early Stage range on your assessment.",
    icon: "Sprout",
  },
  building_momentum: {
    id: "building_momentum",
    label: "Building Momentum",
    description: "Scored in the Building Momentum range on your assessment.",
    icon: "TrendingUp",
  },
  digitally_ready: {
    id: "digitally_ready",
    label: "Digitally Ready",
    description: "Achieved a Digitally Ready score of 80 or higher.",
    icon: "Award",
  },
  repeat_assessment: {
    id: "repeat_assessment",
    label: "Repeat Assessment",
    description: "Taken the assessment 2 or more times to track progress.",
    icon: "RefreshCw",
  },
  score_improver: {
    id: "score_improver",
    label: "Score Improver",
    description: "Improved your overall score from a previous assessment.",
    icon: "ArrowUpCircle",
  },
};
