import { NextRequest, NextResponse } from 'next/server';
import { aiGateway } from '@/services/ai/ai-gateway';

interface DiagnoseRequest {
  workflowDescription: string;
  holonContext: {
    trigger_event?: string;
    trigger_source?: string;
    target_keyword?: string;
    pillar_mapping?: {
      primary_pillar?: string;
      armor_layer?: string;
    };
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: DiagnoseRequest = await req.json();

    if (!body.workflowDescription?.trim()) {
      return NextResponse.json({ error: 'Workflow description is required' }, { status: 400 });
    }

    const systemPrompt = `You are the Radbit Diagnostic Engine. You analyze an SME's current workflow against a specific regulatory threat or operational requirement and generate a brutally honest diagnostic assessment.

## Diagnostic Rules
- Identify 3 specific gaps between their described workflow and what the regulation/requirement demands
- For each gap, state the concrete risk (lost tender, fine, disqualification, delay)
- Map each gap to a Radbit solution in plain language
- Tone: direct, clinical, urgent. No fluff.
- Output as a JSON object with this exact shape:
{
  "overall_verdict": "One sentence verdict — are they prepared or not?",
  "gaps": [
    {
      "title": "Short gap name",
      "description": "What's missing in their workflow",
      "risk": "The concrete business consequence",
      "radbit_solution": "How Radbit closes this gap"
    }
  ],
  "readiness_score": "number between 1-100"
}`;

    const prompt = `Analyze this SME workflow against the following context:

Workflow Description:
${body.workflowDescription}

Regulatory Context:
- Trigger Event: ${body.holonContext.trigger_event || 'N/A'}
- Trigger Source: ${body.holonContext.trigger_source || 'N/A'}
- Target Keyword: ${body.holonContext.target_keyword || 'N/A'}
- Primary Pillar: ${body.holonContext.pillar_mapping?.primary_pillar || 'N/A'}
- Armor Layer: ${body.holonContext.pillar_mapping?.armor_layer || 'N/A'}

Identify the critical gaps between their current workflow and what is required. Be specific and direct.`;

    const result = await aiGateway.generate({
      prompt,
      systemPrompt,
      difficulty: 'simple',
      maxTokens: 1024,
      temperature: 0.3,
      jsonMode: true,
    });

    let diagnosis;
    try {
      diagnosis = JSON.parse(result.content);
    } catch {
      diagnosis = {
        overall_verdict: 'Analysis completed but output parsing failed. Please try again.',
        gaps: [],
        readiness_score: 0,
      };
    }

    return NextResponse.json({ diagnosis });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to run diagnostic';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
