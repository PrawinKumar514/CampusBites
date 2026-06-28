
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { OrderItem, MenuItem } from '@/lib/types';
import { toast } from 'sonner';

interface CartContextType {
  cartItems: OrderItem[];
  addToCart: (item: MenuItem, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartSubtotal: number;
  totalItems: number;
  isCartLoading: boolean; // <-- Expose loading state
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [isCartLoading, setIsCartLoading] = useState(true);

  // Load cart from localStorage on initial client-side mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('campus-bites-cart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
    } finally {
      setIsCartLoading(false); // Finished loading
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    // We don't want to save the initial empty array to localStorage before we've loaded
    if (!isCartLoading) {
      localStorage.setItem('campus-bites-cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isCartLoading]);

  const addToCart = (item: MenuItem, quantity: number) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        // If item is already in cart, just update its quantity
        return prevItems.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prevItems, { ...item, quantity }];
    });
     toast.success("Item Added to Cart", {
      description: `${quantity}x ${item.name} has been added.`,
    });
  };

  const removeFromCart = (itemId: string) => {
    const itemToRemove = cartItems.find(item => item.id === itemId);
    if(itemToRemove) {
      toast.error("Item Removed", {
          description: `${itemToRemove.name} has been removed from your cart.`,
      })
    }
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };
  
  const clearCart = () => {
    setCartItems([]);
  }

  // Calculations are now safe from hydration errors
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartTotal = cartSubtotal; // For now, total is same as subtotal. Can add taxes/fees later.
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartSubtotal, totalItems, isCartLoading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
