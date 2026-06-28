
'use server';
/**
 * @fileOverview A Genkit flow for a helpful AI assistant that can also manage a shopping cart.
 *
 * - askQuestion - A function that handles user questions and commands.
 */

import { ai } from '@/ai/genkit';
import { menuItems } from '@/lib/data';
import type { HelpInput, HelpOutput } from '@/lib/types';
import { HelpInputSchema, HelpOutputSchema, CartActionSchema } from '@/lib/types';
import { z } from 'zod';


// Define the tool for cart manipulation
const updateCartTool = ai.defineTool(
  {
    name: 'updateCartTool',
    description: "Use this tool to add, remove, or update items in the user's shopping cart based on their request. You can add multiple items in one call.",
    inputSchema: z.object({
      actions: z.array(CartActionSchema),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async ({ actions }) => {
    // In a real app, you might interact with a database or session here.
    // For this prototype, we're just confirming the action was received.
    console.log("Updating cart with actions:", actions);
    return {
      success: true,
      message: `Cart updated successfully with ${actions.length} actions.`,
    };
  }
);


export async function askQuestion(input: HelpInput): Promise<HelpOutput> {
  return helpFlow(input);
}

const helpFlow = ai.defineFlow(
  {
    name: 'helpFlow',
    inputSchema: HelpInputSchema,
    outputSchema: HelpOutputSchema,
  },
  async ({ query }) => {

    const prompt = `You are a friendly and helpful AI assistant for "Campus Bites", a food ordering app for a university campus.
Your primary role is to answer user questions and to help them build and modify their food order.

You have two main capabilities:
1.  **Answering Questions:** You can answer questions about food items, prices, categories, and how the app works. Be accurate and concise.
2.  **Managing the Cart:** You can add or remove items from the user's shopping cart. When a user asks to order something (e.g., "add a veg puff," "get me two coffees"), you MUST use the \`updateCartTool\` to fulfill their request.

**IMPORTANT INSTRUCTIONS:**
- When a user asks to order an item, find the corresponding item from the menu below to get the correct \`itemId\`.
- If a user's request is ambiguous (e.g., "add a puff"), ask for clarification (e.g., "Sure, which puff would you like? We have Veg, Egg, and Chicken puffs.").
- When you use the tool, also provide a friendly confirmation message in the \`response\` field (e.g., "I've added 2 Veg Puffs to your cart.").
- If a question is outside the scope of the Campus Bites app, politely state that you cannot answer it.

Here is the full menu. Use it to find the correct \`itemId\` for the tool calls:
${JSON.stringify(menuItems, null, 2)}

User's command: "${query}"
`;
    
    const llmResponse = await ai.generate({
      prompt: prompt,
      tools: [updateCartTool],
      output: {
        schema: HelpOutputSchema,
      },
       config: {
        temperature: 0.2,
      },
    });

    const output = llmResponse.output;
    if (!output) {
      return { response: "Sorry, I had trouble understanding that. Could you try again?" };
    }
    
    // The model's response text is already in output.response
    // The tool actions are in output.cartActions
    return output;
  }
);
