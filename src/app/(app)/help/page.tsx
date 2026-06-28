
// src/app/(app)/help/page.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LifeBuoy, Sparkles, User, Bot, Loader2, CornerDownLeft, ShoppingCart, CheckCircle } from 'lucide-react';
import { askQuestion } from '@/ai/flows/help-flow';
import type { CartAction } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { menuItems } from '@/lib/data';
import Link from 'next/link';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  cartActions?: CartAction[];
}

export default function HelpPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart } = useCart();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await askQuestion({ query: input });
      const aiMessage: Message = { sender: 'ai', text: result.response, cartActions: result.cartActions };
      setMessages(prev => [...prev, aiMessage]);

      // Process cart actions if the AI returns any
      if (result.cartActions && result.cartActions.length > 0) {
        for (const action of result.cartActions) {
          const menuItem = menuItems.find(item => item.id === action.itemId);
          if (menuItem) {
            addToCart(menuItem, action.quantity);
          }
        }
      }

    } catch (error) {
      console.error("Error asking question:", error);
      const errorMessage: Message = { sender: 'ai', text: "Sorry, I'm having trouble connecting. Please try again in a moment." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-2xl h-full flex flex-col">
        <CardHeader className="text-center border-b">
          <div className="flex justify-center items-center gap-2 mb-2">
            <LifeBuoy className="h-7 w-7 text-primary" />
            <CardTitle className="text-3xl font-bold tracking-tight">AI Help & Ordering</CardTitle>
          </div>
          <CardDescription>
            Ask me anything, or just tell me what to order!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground h-full flex flex-col justify-center items-center">
              <Bot className="h-16 w-16 mb-4" />
              <p className="text-lg">I'm here to help!</p>
              <p>Ask about menu items, or place an order directly.</p>
               <p className="text-sm mt-4">e.g., "order me 2 veg puffs" or "how much is a coffee?"</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`flex flex-col gap-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {msg.sender === 'ai' && (
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    )}
                    <div className={`rounded-lg p-3 max-w-md ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    {msg.sender === 'user' && (
                    <div className="p-2 bg-muted rounded-full">
                        <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    )}
                </div>
                {msg.sender === 'ai' && msg.cartActions && msg.cartActions.length > 0 && (
                    <div className="ml-12 mt-1 space-y-2">
                        {msg.cartActions.map((action, actionIndex) => (
                            <div key={actionIndex} className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <p className="text-green-300">
                                    Added <span className='font-bold'>{action.quantity}x {action.name}</span> to your cart.
                                </p>
                            </div>
                        ))}
                         <Button variant="link" size="sm" asChild className='text-accent'>
                            <Link href="/cart">View Cart <ShoppingCart className='ml-1 h-4 w-4'/></Link>
                         </Button>
                    </div>
                )}
              </div>
            ))
          )}
           {isLoading && (
              <div className="flex items-start gap-3">
                 <div className="p-2 bg-primary/10 rounded-full">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                <div className="rounded-lg p-3 bg-muted flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm">Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
        </CardContent>
        <CardFooter className="p-4 border-t">
          <div className="relative w-full">
            <Input
              type="text"
              placeholder="Ask or order something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="pr-12 h-12 text-base"
            />
            <Button
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9"
              onClick={handleSendMessage}
              disabled={isLoading || input.trim() === ''}
              variant="premium"
            >
              <CornerDownLeft className="h-5 w-5" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
