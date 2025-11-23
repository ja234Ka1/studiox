
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
  prompt: `You are a helpful assistant integrated into a movie and TV show application called Willow. Respond to the user's message concisely.

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
