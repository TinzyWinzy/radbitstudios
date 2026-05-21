export interface QualityCheck {
  passed: boolean;
  issues: string[];
}

export interface QualityThresholds {
  minChars?: number;
  requiredPhrases?: string[];
  maxRepetitionRatio?: number;
}

export function checkTextQuality(
  text: string,
  thresholds: QualityThresholds = {}
): QualityCheck {
  const issues: string[] = [];

  if (thresholds.minChars && text.length < thresholds.minChars) {
    issues.push(
      `Too short (${text.length} chars, minimum ${thresholds.minChars})`
    );
  }

  if (thresholds.requiredPhrases) {
    const lower = text.toLowerCase();
    for (const phrase of thresholds.requiredPhrases) {
      if (!lower.includes(phrase.toLowerCase())) {
        issues.push(`Missing required theme: "${phrase}"`);
      }
    }
  }

  if (thresholds.maxRepetitionRatio) {
    const words = text.split(/\s+/);
    if (words.length > 5) {
      const freq: Record<string, number> = {};
      for (const w of words) {
        const key = w.toLowerCase().replace(/[^a-z]/g, "");
        if (key.length > 2) {
          freq[key] = (freq[key] ?? 0) + 1;
        }
      }
      const maxFreq = Math.max(...Object.values(freq), 0);
      if (words.length > 0 && maxFreq / words.length > thresholds.maxRepetitionRatio) {
        issues.push(`Excessive word repetition detected`);
      }
    }
  }

  return { passed: issues.length === 0, issues };
}

export function checkListQuality(
  items: string[],
  label: string,
  thresholds: QualityThresholds = {}
): QualityCheck {
  const issues: string[] = [];

  if (items.length === 0) {
    issues.push(`${label} is empty`);
    return { passed: false, issues };
  }

  for (let i = 0; i < items.length; i++) {
    const itemCheck = checkTextQuality(items[i], thresholds);
    for (const issue of itemCheck.issues) {
      issues.push(`${label}[${i}]: ${issue}`);
    }
  }

  return { passed: issues.length === 0, issues };
}

export function buildRegenerationPrompt(
  originalPrompt: string,
  issues: string[]
): string {
  return `${originalPrompt}\n\nIMPORTANT: The previous response had quality issues:\n${issues.map((i) => `- ${i}`).join("\n")}\n\nPlease provide a revised version that addresses each issue above. Be specific, detailed, and directly relevant to the Zimbabwean SME context.`;
}

export const SUMMARY_QUALITY_THRESHOLDS: QualityThresholds = {
  minChars: 150,
  requiredPhrases: ["strength", "recommend"],
  maxRepetitionRatio: 0.15,
};

export const TIP_QUALITY_THRESHOLDS: QualityThresholds = {
  minChars: 30,
  maxRepetitionRatio: 0.2,
};
