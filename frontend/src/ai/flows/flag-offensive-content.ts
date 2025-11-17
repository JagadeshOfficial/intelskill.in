'use server';

/**
 * @fileOverview An AI agent for flagging offensive content in the forum.
 *
 * - flagOffensiveContent - A function that flags potentially offensive content.
 * - FlagOffensiveContentInput - The input type for the flagOffensiveContent function.
 * - FlagOffensiveContentOutput - The return type for the flagOffensiveContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FlagOffensiveContentInputSchema = z.object({
  text: z.string().describe('The text content to be checked for offensiveness.'),
});
export type FlagOffensiveContentInput = z.infer<typeof FlagOffensiveContentInputSchema>;

const FlagOffensiveContentOutputSchema = z.object({
  isOffensive: z.boolean().describe('Whether the content is considered offensive or inappropriate.'),
  reason: z.string().describe('The reason why the content is flagged as offensive.'),
});
export type FlagOffensiveContentOutput = z.infer<typeof FlagOffensiveContentOutputSchema>;

export async function flagOffensiveContent(input: FlagOffensiveContentInput): Promise<FlagOffensiveContentOutput> {
  return flagOffensiveContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'flagOffensiveContentPrompt',
  input: {schema: FlagOffensiveContentInputSchema},
  output: {schema: FlagOffensiveContentOutputSchema},
  prompt: `You are an AI content moderator tasked with identifying offensive or inappropriate content.

  Analyze the following text and determine if it violates community guidelines regarding hate speech, harassment, or other forms of inappropriate behavior.  Output a boolean value for whether the content is considered offensive or not, and a detailed reason.

  Text: {{{text}}}`,
});

const flagOffensiveContentFlow = ai.defineFlow(
  {
    name: 'flagOffensiveContentFlow',
    inputSchema: FlagOffensiveContentInputSchema,
    outputSchema: FlagOffensiveContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
