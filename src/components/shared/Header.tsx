// src/components/shared/Header.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCart, UserCircle, UtensilsCrossed, LifeBuoy, Sparkles, LayoutDashboard } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useCart } from '@/context/CartContext';
import { Badge } from '../ui/badge';

export default function Header() {
  const { user, isAdmin } = useAdminAuth();
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/50 backdrop-blur-lg">
      <div className="flex h-20 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/menu" className="flex items-center space-x-2">
            <UtensilsCrossed className="h-8 w-8 text-primary" />
            <span className="font-bold text-2xl sm:inline-block">
              Campus Bites
            </span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-2">
          {isAdmin && (
             <Button variant="ghost" size="icon" asChild className="group">
              <Link href="/admin">
                <LayoutDashboard className="h-6 w-6 text-amber-500 transition-colors duration-200 group-hover:text-black" />
                <span className="sr-only">Admin</span>
              </Link>
            </Button>
          )}
           <Button variant="ghost" size="icon" asChild>
            <Link href="/foryou">
              <Sparkles className="h-6 w-6" />
              <span className="sr-only">For You</span>
            </Link>
          </Button>
           <Button variant="ghost" size="icon" asChild>
            <Link href="/help">
              <LifeBuoy className="h-6 w-6" />
              <span className="sr-only">Help</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart" className="relative">
              {totalItems > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs"
                >
                  {totalItems}
                </Badge>
              )}
              <ShoppingCart className="h-6 w-6" />
              <span className="sr-only">Cart</span>
            </Link>
          </Button>
          {user ? (
             <Button variant="ghost" size="icon" asChild>
              <Link href="/profile">
                <UserCircle className="h-6 w-6" />
                <span className="sr-only">Profile</span>
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <UserCircle className="h-6 w-6" />
                <span className="sr-only">Sign In</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
