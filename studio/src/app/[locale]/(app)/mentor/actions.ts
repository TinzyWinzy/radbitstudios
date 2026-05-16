
'use server';

import { aiBusinessMentor, AiBusinessMentorInput } from '@/ai/flows/ai-business-mentor';

/**
 * This is the Server Action that is called from the client.
 * Its only responsibility is to call the AI flow and return the result.
 */
export async function sendMessageAction(
  input: Omit<AiBusinessMentorInput, 'userId'>
): Promise<{ answer: string }> {

  if (!input.query?.trim()) {
    throw new Error('Message is empty.');
  }

  try {
    // Call the AI flow for generation
    const response = await aiBusinessMentor({
      query: input.query,
      businessName: input.businessName,
      industry: input.industry,
      businessDescription: input.businessDescription,
    });

    return { answer: response.answer };

  } catch (error: any) {
    console.error('Error in sendMessageAction:', error);
    // Re-throw the error so the client's try/catch block can handle it
    throw new Error(error.message || 'Sorry, the AI mentor encountered an error. Please try again.');
  }
}
