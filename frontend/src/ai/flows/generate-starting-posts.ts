'use server';

/**
 * @fileOverview Flow for generating starting forum posts based on a prompt.
 *
 * - generateStartingPosts - A function that generates starting forum posts.
 * - GenerateStartingPostsInput - The input type for the generateStartingPosts function.
 * - GenerateStartingPostsOutput - The return type for the generateStartingPosts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStartingPostsInputSchema = z.object({
  prompt: z.string().describe('The prompt to generate starting forum posts from.'),
});
export type GenerateStartingPostsInput = z.infer<typeof GenerateStartingPostsInputSchema>;

const GenerateStartingPostsOutputSchema = z.object({
  posts: z.array(z.string()).describe('The generated starting forum posts.'),
});
export type GenerateStartingPostsOutput = z.infer<typeof GenerateStartingPostsOutputSchema>;

export async function generateStartingPosts(input: GenerateStartingPostsInput): Promise<GenerateStartingPostsOutput> {
  return generateStartingPostsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStartingPostsPrompt',
  input: {schema: GenerateStartingPostsInputSchema},
  output: {schema: GenerateStartingPostsOutputSchema},
  prompt: `You are an expert forum post generator. You will generate a list of forum posts based on the prompt provided.

Prompt: {{{prompt}}}

Please return a JSON array of strings. Each string should be a forum post. Return 3 forum posts.`,
});

const generateStartingPostsFlow = ai.defineFlow(
  {
    name: 'generateStartingPostsFlow',
    inputSchema: GenerateStartingPostsInputSchema,
    outputSchema: GenerateStartingPostsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
