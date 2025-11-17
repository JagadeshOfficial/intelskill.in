import { config } from 'dotenv';
config();

import '@/ai/flows/generate-starting-posts.ts';
import '@/ai/flows/summarize-thread.ts';
import '@/ai/flows/flag-offensive-content.ts';