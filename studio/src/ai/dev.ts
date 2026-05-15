
import { config } from 'dotenv';
config();

import '@/ai/flows/curate-tenders-news.ts';
import '@/ai/flows/moderate-community-content.ts';
import '@/ai/flows/ai-business-mentor.ts';
import '@/ai/flows/generate-assessment-summary.ts';
import '@/ai/flows/generate-dashboard-insights.ts';
import '@/ai/flows/generate-business-insight.ts';
