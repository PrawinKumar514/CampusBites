
'use server';
/**
 * @fileOverview An AI flow for generating personalized food recommendations.
 *
 * - getRecommendations - A function that returns food recommendations for a user.
 * - RecommendationInput - The input type for the getRecommendations function.
 * - RecommendationOutput - The return type for the getRecommendations function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { menuItems } from '@/lib/data';
import type { MenuItem, Order } from '@/lib/types';

const RecommendationInputSchema = z.object({
  orderHistory: z.any().describe("The user's past orders."),
});
export type RecommendationInput = z.infer<typeof RecommendationInputSchema>;

const RecommendedItemSchema = z.object({
    id: z.string().describe('The ID of the recommended menu item.'),
    name: z.string().describe('The name of the recommended menu item.'),
    reason: z.string().describe('A short, friendly reason why this item is being recommended to the user.'),
});

const RecommendationOutputSchema = z.object({
  recommendations: z.array(RecommendedItemSchema).describe('A list of personalized menu item recommendations.'),
});
export type RecommendationOutput = z.infer<typeof RecommendationOutputSchema>;


export async function getRecommendations(input: RecommendationInput): Promise<RecommendationOutput> {
  return recommendationFlow(input);
}

const recommendationFlow = ai.defineFlow(
  {
    name: 'recommendationFlow',
    inputSchema: RecommendationInputSchema,
    outputSchema: RecommendationOutputSchema,
  },
  async (input) => {

    const prompt = `You are a friendly and insightful food recommendation expert for a campus canteen called "Campus Bites".
Your goal is to help students discover new food they'll love.

You will be given a user's order history and the full menu.
Analyze the user's past orders to understand their preferences. Consider things like:
- What categories do they order from most (Snacks, Lunch, Drinks)?
- Do they seem to prefer vegetarian or non-vegetarian items?
- Are there any recurring flavors or types of food (e.g., spicy, fried, rice-based)?

Based on this analysis, you must recommend exactly 3 items from the full menu that the user has NOT ordered before.
For each recommendation, provide a short, compelling, and friendly reason why the user would enjoy it, connecting it to their past preferences.

Here is the full menu available at the canteen:
${JSON.stringify(menuItems, null, 2)}

Here is the user's order history:
${JSON.stringify(input.orderHistory, null, 2)}

Please return your 3 recommendations in the specified JSON format. Do not include items the user has already ordered.
`;

    const llmResponse = await ai.generate({
      prompt: prompt,
      output: {
        schema: RecommendationOutputSchema,
      },
       config: {
        temperature: 0.8,
      },
    });

    return llmResponse.output || { recommendations: [] };
  }
);
