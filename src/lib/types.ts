import { Timestamp } from "firebase/firestore";
import { z } from "zod";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Snacks' | 'Drinks' | 'Lunch';
  imageUrl: string;
  imageHint: string;
}

export interface OrderItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: 'confirmed' | 'preparing' | 'ready' | 'completed';
  createdAt: Timestamp | Date | string; // Allow both for client-side creation and server-side retrieval
  total: number;
  subtotal: number;
  tax: number;
}

// Extends Order with user email for admin view
export interface OrderWithUser extends Order {
  userEmail: string;
}

// For user profile data in Firestore
export interface UserProfile {
    uid: string;
    fullName: string;
    email: string;
    mobileNumber: string;
    photoURL?: string;
    role?: 'admin' | 'user';
    createdAt: any;
}

// A simpler user type for the admin user map
export interface UserData {
  fullName: string;
  email: string;
}

export interface ChartData {
  name: string;
  orders: number;
  revenue: number;
}

export type TimeRange = '7d' | '30d' | '12m';


// Types for the AI Help Flow
export const HelpInputSchema = z.object({
  query: z.string().describe("The user's question."),
});
export type HelpInput = z.infer<typeof HelpInputSchema>;

export const CartActionSchema = z.object({
  itemId: z.string().describe("The ID of the menu item to add to the cart."),
  quantity: z.number().describe("The quantity of the item to add."),
  name: z.string().describe("The name of the item."),
});
export type CartAction = z.infer<typeof CartActionSchema>;

export const HelpOutputSchema = z.object({
  response: z.string().describe("The AI's text response to the user's question or command."),
  cartActions: z.array(CartActionSchema).optional().describe("A list of actions to perform on the shopping cart."),
});
export type HelpOutput = z.infer<typeof HelpOutputSchema>;

    