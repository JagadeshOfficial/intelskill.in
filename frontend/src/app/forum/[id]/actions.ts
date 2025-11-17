'use server'

import { flagOffensiveContent } from '@/ai/flows/flag-offensive-content'

export async function flagPostAction(postId: string, content: string) {
  console.log(`Flagging post ${postId} with content: "${content}"`)
  try {
    const result = await flagOffensiveContent({ text: content });
    if (result.isOffensive) {
      // Here you would typically update your database to mark the post as flagged
      return { success: true, message: `Post flagged as offensive. Reason: ${result.reason}` };
    }
    return { success: true, message: 'Content reviewed and deemed not offensive.' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('Error flagging content:', errorMessage);
    return { success: false, message: 'Failed to analyze content.' };
  }
}
