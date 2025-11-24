
'use server';
/**
 * @fileOverview An AI flow for generating personalized media recommendations.
 *
 * - getRecommendations - A function that returns AI-powered recommendations based on a user's watchlist.
 * - RecommendationsInput - The input type for the recommendations flow.
 * - RecommendationsOutput - The return type for the recommendations flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { searchMedia } from '@/lib/tmdb';
import { type Media } from '@/types/tmdb';

const MediaItemSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  name: z.string().optional(),
  media_type: z.string(),
});

const RecommendationsInputSchema = z.object({
  watchlist: z.array(MediaItemSchema).describe("A list of movies and TV shows in the user's watchlist."),
});
export type RecommendationsInput = z.infer<typeof RecommendationsInputSchema>;

// This is the output from the AI prompt ONLY
const AiRecommendationSchema = z.object({
    recommendations: z.array(
      z.object({
        title: z.string().describe('The title of the recommended movie or TV show.'),
        reason: z.string().describe('A short, compelling reason why the user might like this, based on their watchlist.'),
      })
    ),
  });

// This is the final, validated output from the flow
const RecommendationsOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      id: z.number().describe('The TMDB ID of the recommended media.'),
      media_type: z.enum(['movie', 'tv']).describe("The type of media, either 'movie' or 'tv'."),
      reason: z.string().describe('A short, compelling reason why the user might like this, based on their watchlist.'),
    })
  ),
});
export type RecommendationsOutput = z.infer<typeof RecommendationsOutputSchema>;


export async function getRecommendations(input: RecommendationsInput): Promise<RecommendationsOutput> {
  return recommendationsFlow(input);
}

const recommendationsPrompt = ai.definePrompt({
  name: 'recommendationsPrompt',
  input: { schema: RecommendationsInputSchema },
  output: { schema: AiRecommendationSchema },
  prompt: `You are a movie and TV show recommendation expert for an app called Willow.
Your goal is to provide 10 personalized recommendations based on the user's watchlist.

Analyze the genres, actors, and themes present in the user's watchlist below.
Based on this analysis, suggest 10 new movies or TV shows that they are likely to enjoy. 
For each one, provide a short, exciting reason (no more than 15 words) explaining why it's a good fit. For example, "Because you liked The Matrix, you'll love the mind-bending sci-fi in this." or "Fans of Stranger Things will enjoy this supernatural mystery."

Do not recommend items that are already in the user's watchlist.

User's Watchlist:
{{#each watchlist}}
- {{#if title}}{{title}}{{else}}{{name}}{{/if}} ({{media_type}})
{{/each}}
`,
});

const recommendationsFlow = ai.defineFlow(
  {
    name: 'recommendationsFlow',
    inputSchema: RecommendationsInputSchema,
    outputSchema: RecommendationsOutputSchema,
  },
  async (input) => {
    // If watchlist is empty, return no recommendations.
    if (input.watchlist.length === 0) {
      return { recommendations: [] };
    }

    const { output } = await recommendationsPrompt(input);
    
    if (!output?.recommendations || output.recommendations.length === 0) {
        return { recommendations: [] };
    }

    // Now, validate the AI's suggestions by searching for them.
    const validatedRecommendations: RecommendationsOutput['recommendations'] = [];

    for (const rec of output.recommendations) {
        if (validatedRecommendations.length >= 10) break;

        const searchResults = await searchMedia(rec.title, 1, 1);
        const topResult = searchResults.results[0];

        if (topResult) {
             // Avoid adding duplicates or items already in the watchlist
            const isInWatchlist = input.watchlist.some(item => item.id === topResult.id);
            const isAlreadyAdded = validatedRecommendations.some(item => item.id === topResult.id);

            if (!isInWatchlist && !isAlreadyAdded) {
                validatedRecommendations.push({
                    id: topResult.id,
                    media_type: topResult.media_type as 'movie' | 'tv',
                    reason: rec.reason,
                });
            }
        }
    }

    return { recommendations: validatedRecommendations };
  }
);
