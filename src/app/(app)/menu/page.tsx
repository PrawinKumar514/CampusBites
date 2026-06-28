// src/app/(app)/menu/page.tsx
"use client";

import { useState, useRef, MouseEvent, useEffect } from 'react';
import { menuItems as staticMenuItems } from '@/lib/data'; // Using static data for now
import type { MenuItem } from '@/lib/types';
import MenuItemCard from '@/components/menu/MenuItemCard';
import BuildWithGemini from '@/components/shared/BuildWithGemini';
import { Button } from '@/components/ui/button';
import MenuItemCardSkeleton from '@/components/menu/MenuItemCardSkeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const categories: { name: MenuItem['category'], emoji: string }[] = [
  { name: 'Snacks', emoji: '🥟' },
  { name: 'Drinks', emoji: '🥤' },
  { name: 'Lunch', emoji: '🍛' },
];

export default function MenuPage() {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const navRef = useRef<HTMLDivElement>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate fetching data
  useEffect(() => {
    const timer = setTimeout(() => {
      // In a real app, you would fetch from Firestore here.
      // For now, we use the static data and simulate a successful fetch.
      // If there was a firestore error, you would setError("message")
      setMenuItems(staticMenuItems);
      setLoading(false);
    }, 1500); // Simulate a 1.5 second network delay

    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!navRef.current) return;

    const rect = navRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    const yRotate = xPct * 5; // Reversed for natural feel
    const xRotate = -yPct * 5;

    setRotate({ x: xRotate, y: yRotate });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };
  
  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-12">
          {categories.map(category => (
            <section key={category.name} id={category.name.toLowerCase()} className="pt-8">
              <h2 className="text-3xl font-bold tracking-tight mb-6 pb-2 border-b-2 border-primary/20">
                <span className="mr-3">{category.emoji}</span>
                {category.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <MenuItemCardSkeleton key={index} />
                ))}
              </div>
            </section>
          ))}
        </div>
      );
    }

    if (error) {
       return (
          <Card className="text-center py-20">
            <CardHeader>
              <div className="mx-auto bg-destructive/10 text-destructive w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8"/>
              </div>
              <CardTitle className="text-destructive">Error Loading Menu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        );
    }
    
    if (menuItems.length === 0) {
      return (
        <Card className="text-center py-20">
          <CardHeader>
            <CardTitle>Menu Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Looks like the menu hasn't been set up yet. Please check back later!</p>
          </CardContent>
        </Card>
      );
    }

    return (
       <div className="space-y-12">
        {categories.map(category => {
          const items = menuItems.filter(item => item.category === category.name);
          if (items.length === 0) return null;

          return (
            <section key={category.name} id={category.name.toLowerCase()} className="pt-8">
              <h2 className="text-3xl font-bold tracking-tight mb-6 pb-2 border-b-2 border-primary/20">
                <span className="mr-3">{category.emoji}</span>
                {category.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map(item => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Delicious. Affordable. Right from your Campus Canteen.
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg animate-shine">
          Order From Anywhere, Pick Up At The Canteen. It's That Easy!
        </p>
      </header>

      <div
        ref={navRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1, 1, 1)`,
          transition: "transform 0.4s ease-out",
        }}
        className="bg-card/50 backdrop-blur-lg p-2 px-6 mb-8 flex items-center justify-between rounded-full border border-border/10 shadow-lg animated-glowing-border"
      >
        <span className="font-bold text-accent uppercase tracking-widest text-sm select-none">Menu</span>
        <nav className="flex items-center justify-center space-x-1">
          {categories.map((category) => (
            <Button asChild variant="ghost" key={category.name} className="rounded-full px-6 py-2 text-base hover:bg-primary hover:text-black hover:scale-105 transition-all duration-200">
                <a href={`#${category.name.toLowerCase()}`}>{category.name}</a>
            </Button>
          ))}
        </nav>
         {/* Empty span for spacing to keep nav centered */}
        <span className="font-bold text-accent uppercase tracking-widest text-sm select-none w-14"></span>
      </div>

      {renderContent()}

      <div className="mt-24">
        <BuildWithGemini />
      </div>
    </div>
  );
}
