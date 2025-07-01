'use server';

import { suggestTrainingTools, SuggestTrainingToolsInput, SuggestTrainingToolsOutput } from '@/ai/flows/suggest-training-tools';

export async function getToolSuggestions(
  prompt: string
): Promise<SuggestTrainingToolsOutput> {
  const input: SuggestTrainingToolsInput = { prompt };
  try {
    const result = await suggestTrainingTools(input);
    return result;
  } catch (error) {
    console.error("Error getting tool suggestions:", error);
    // In a real app, you'd want more robust error handling.
    // For now, we'll re-throw to be caught by the client.
    throw new Error("Failed to get suggestions from AI.");
  }
}
