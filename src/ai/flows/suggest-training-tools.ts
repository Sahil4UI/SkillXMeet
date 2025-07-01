'use server';

/**
 * @fileOverview AI agent that suggests relevant training tools based on the trainer's prompt.
 *
 * - suggestTrainingTools - A function that suggests training tools.
 * - SuggestTrainingToolsInput - The input type for the suggestTrainingTools function.
 * - SuggestTrainingToolsOutput - The return type for the suggestTrainingTools function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTrainingToolsInputSchema = z.object({
  prompt: z
    .string()
    .describe(
      'The prompt from the trainer, either text or voice, describing the training session or current needs.'
    ),
});
export type SuggestTrainingToolsInput = z.infer<typeof SuggestTrainingToolsInputSchema>;

const SuggestTrainingToolsOutputSchema = z.object({
  tools: z
    .array(z.string())
    .describe(
      'An array of suggested tools relevant to the training session, e.g., whiteboard, document, timer.'
    ),
  reasoning: z
    .string()
    .describe('The reasoning behind the tool suggestions.'),
});
export type SuggestTrainingToolsOutput = z.infer<typeof SuggestTrainingToolsOutputSchema>;

export async function suggestTrainingTools(input: SuggestTrainingToolsInput): Promise<SuggestTrainingToolsOutput> {
  return suggestTrainingToolsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTrainingToolsPrompt',
  input: {schema: SuggestTrainingToolsInputSchema},
  output: {schema: SuggestTrainingToolsOutputSchema},
  prompt: `You are an AI assistant that suggests relevant tools for online training sessions based on the trainer\'s prompt.\n\nGiven the following prompt from the trainer, suggest a list of tools that could be helpful for the session. Also, provide a brief reasoning for each suggested tool.\n\nPrompt: {{{prompt}}}\n\nOutput format:{
 tools: ["tool1", "tool2", ...], reasoning: "explanation"
}\n\nConsider tools like: whiteboard, document, timer, code editor, polls, quizzes, breakout rooms, etc.\n`,
});

const suggestTrainingToolsFlow = ai.defineFlow(
  {
    name: 'suggestTrainingToolsFlow',
    inputSchema: SuggestTrainingToolsInputSchema,
    outputSchema: SuggestTrainingToolsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
