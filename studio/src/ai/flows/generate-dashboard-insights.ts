
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating dynamic insights
 * for the user's dashboard, including daily tips and recommendations.
 *
 * - generateDashboardInsights - Generates personalized content for the dashboard.
 * - GenerateDashboardInsightsInput - The input type for the function.
 * - GenerateDashboardInsightsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { CacheService } from '@/services/cache-service';

const GenerateDashboardInsightsInputSchema = z.object({
  userId: z.string().describe("The unique ID of the user."),
  businessDescription: z.string().describe('A description of the user\'s business.'),
  industry: z.string().describe('The industry the user\'s business operates in (e.g., Agribusiness, Retail, Technology).'),
});
export type GenerateDashboardInsightsInput = z.infer<typeof GenerateDashboardInsightsInputSchema>;

const GenerateDashboardInsightsOutputSchema = z.object({
  dailyTips: z.array(z.string()).describe('A list of 2-3 short, actionable daily tips relevant to the user\'s industry.'),
  recommendations: z.array(z.string()).describe('A list of 2-3 personalized, strategic recommendations based on the user\'s business description.'),
});
export type GenerateDashboardInsightsOutput = z.infer<typeof GenerateDashboardInsightsOutputSchema>;

// Initialize a cache for this flow. Cache results for 4 hours (14400 seconds).
const insightsCache = new CacheService<GenerateDashboardInsightsOutput>(14400);

export async function generateDashboardInsights(
  input: GenerateDashboardInsightsInput
): Promise<GenerateDashboardInsightsOutput> {
  return generateDashboardInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDashboardInsightsPrompt',
  input: {schema: GenerateDashboardInsightsInputSchema},
  output: {schema: GenerateDashboardInsightsOutputSchema},
  prompt: `You are an expert business consultant for Zimbabwean SMEs. Your task is to generate personalized content for a user's dashboard based on their business profile.

User's Business Industry: {{{industry}}}
User's Business Description: {{{businessDescription}}}

Generate the following content:
1.  **Daily Tips**: Create a list of exactly 3 short, actionable daily tips. These tips should be general enough for the specified industry but still highly relevant and practical for a small business in Zimbabwe.
2.  **AI Recommendations**: Create a list of exactly 2 strategic, personalized recommendations. These should be directly inspired by the user's specific business description and offer clear, next-step advice.

Keep the language encouraging, simple, and direct.
`,
});

const generateDashboardInsightsFlow = ai.defineFlow(
  {
    name: 'generateDashboardInsightsFlow',
    inputSchema: GenerateDashboardInsightsInputSchema,
    outputSchema: GenerateDashboardInsightsOutputSchema,
  },
  async (input) => {
    const cacheKey = input.userId;
    try {
      const cachedInsights = insightsCache.get(cacheKey);

      if (cachedInsights) {
        console.log(`[Cache HIT] Returning cached insights for user ${cacheKey}`);
        return cachedInsights;
      }

      console.log(`[Cache MISS] Generating new insights for user ${cacheKey}`);
      const {output} = await prompt(input);

      if (output) {
        insightsCache.set(cacheKey, output);
      }
      
      return output ?? {dailyTips: [], recommendations: []};
    } catch (error) {
      console.error('[generateDashboardInsightsFlow] Error:', error);
      throw new Error(
        `Dashboard insights generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
);
