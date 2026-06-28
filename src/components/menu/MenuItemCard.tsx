// src/components/menu/MenuItemCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { MenuItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ShoppingCart, XCircle } from "lucide-react";
import QuantitySelector from "../order/QuantitySelector";
import { useCart } from "@/context/CartContext";

interface MenuItemCardProps { item: MenuItem; }

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();

  const handleAddItemClick = () => { setQuantity(1); setIsAdding(true); };
  const handleCancelClick = () => { setIsAdding(false); setQuantity(1); };
  const handleConfirmClick = () => { addToCart(item, quantity); setIsAdding(false); setQuantity(1); };

  return (
    <Card className="group flex flex-col overflow-hidden transition-all duration-300 transform-gpu bg-card/50 backdrop-blur-sm border-white/10 hover:border-accent hover:shadow-[0_0_20px_0px_hsl(var(--accent)_/_0.7)]">
      <CardHeader className="p-0">
        <Link href={`/order/${item.id}`} className="cursor-pointer">
          <div className="relative w-full aspect-[3/2]">
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="(min-width:1280px) 25vw, (min-width:768px) 33vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              quality={85}
              priority={false}
              data-ai-hint={item.imageHint}
            />
          </div>
        </Link>
      </CardHeader>

      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl font-bold mb-2 tracking-tight">
          <Link href={`/order/${item.id}`} className="hover:underline">{item.name}</Link>
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">{item.description}</CardDescription>
      </CardContent>

      <CardFooter className="p-4 flex justify-between items-center">
        <p className="font-bold text-xl"><span className="text-primary">₹</span>{item.price.toFixed(2)}</p>
        {!isAdding ? (
          <Button size="sm" onClick={handleAddItemClick} variant="premium">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Item
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <QuantitySelector quantity={quantity} setQuantity={setQuantity} />
            <Button size="icon" className="h-8 w-8" onClick={handleConfirmClick} variant="premium">
              <ShoppingCart className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancelClick}>
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
