'use server';

/**
 * @fileOverview This file defines a Genkit flow for summarizing forum threads.
 *
 * - summarizeThread - A function that takes the content of a forum thread and returns a summary.
 * - SummarizeThreadInput - The input type for the summarizeThread function.
 * - SummarizeThreadOutput - The return type for the summarizeThread function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeThreadInputSchema = z.object({
  threadContent: z.string().describe('The complete text content of the forum thread.'),
});

export type SummarizeThreadInput = z.infer<typeof SummarizeThreadInputSchema>;

const SummarizeThreadOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the main points in the forum thread.'),
});

export type SummarizeThreadOutput = z.infer<typeof SummarizeThreadOutputSchema>;

export async function summarizeThread(input: SummarizeThreadInput): Promise<SummarizeThreadOutput> {
  return summarizeThreadFlow(input);
}

const summarizeThreadPrompt = ai.definePrompt({
  name: 'summarizeThreadPrompt',
  input: {schema: SummarizeThreadInputSchema},
  output: {schema: SummarizeThreadOutputSchema},
  prompt: `You are an expert forum thread summarizer. Please provide a concise summary of the following forum thread content, highlighting the main points and key discussion topics.\n\nThread Content:\n{{{threadContent}}}`, 
});

const summarizeThreadFlow = ai.defineFlow(
  {
    name: 'summarizeThreadFlow',
    inputSchema: SummarizeThreadInputSchema,
    outputSchema: SummarizeThreadOutputSchema,
  },
  async input => {
    const {output} = await summarizeThreadPrompt(input);
    return output!;
  }
);
