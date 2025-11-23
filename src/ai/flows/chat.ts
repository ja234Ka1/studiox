
'use server';
/**
 * @fileOverview A simple chat flow that responds to user messages.
 *
 * - chat - A function that handles the chat interaction.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { searchMedia as searchTmdb } from '@/lib/tmdb';
import { type Media } from '@/types/tmdb';


// Define a tool for the AI to search for media
const searchMediaTool = ai.defineTool(
    {
      name: 'searchMedia',
      description: 'Search for movies and TV shows. Use this to answer any user questions about media.',
      inputSchema: z.object({
        query: z.string().describe('The search query for the movie or TV show.'),
      }),
      outputSchema: z.array(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          name: z.string().optional(),
          media_type: z.string(),
        })
      ),
    },
    async (input) => {
        console.log(`[searchMediaTool] Searching for: ${input.query}`);
        const results = await searchTmdb(input.query, 1, 5); // Fetch top 5 results
        return results.results.map((item: Media) => ({
            id: item.id,
            title: item.title,
            name: item.name,
            media_type: item.media_type,
        }));
    }
);


const ChatInputSchema = z.object({
  message: z.string().describe('The user\'s message.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The AI\'s response message.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// Exported wrapper function to be called from the client
export async function chat(input: ChatInput): Promise<ChatOutput> {
  const output = await chatFlow(input);
  return output;
}

const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  tools: [searchMediaTool],
  prompt: `You are a helpful and friendly assistant integrated into a movie and TV show application called Willow. Respond to the user's message concisely.

When recommending movies or shows, you MUST use the searchMedia tool to find relevant media.

Based on the tool's output, you MUST format your response using markdown links for each movie or show you recommend.
The link format is: **[Title](/{media_type}/{id})**. For example, a movie recommendation would look like: **[The Matrix](/movie/603)**.

If the tool returns no results, inform the user you couldn't find anything for their query. Do not invent movies.

User Message:
{{{message}}}`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { output } = await chatPrompt(input);
    if (!output) {
      return { response: "I'm sorry, I couldn't generate a response." };
    }
    return output;
  }
);
