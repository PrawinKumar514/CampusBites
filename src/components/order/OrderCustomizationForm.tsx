
"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { MenuItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import QuantitySelector from './QuantitySelector';
import { useCart } from '@/context/CartContext';

interface OrderCustomizationFormProps {
  item: MenuItem;
}

export default function OrderCustomizationForm({ item }: OrderCustomizationFormProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  
  const handleAddToCart = () => {
    addToCart(item, quantity);
    router.push('/cart');
  };

  return (
    <div>
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/menu"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Menu</Link>
      </Button>

      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-video md:aspect-square">
            <Image 
              src={item.imageUrl} 
              alt={item.name} 
              width={600} 
              height={600}
              className="object-cover" 
              data-ai-hint={item.imageHint} 
            />
          </div>
          <div className="p-6 md:p-8 flex flex-col">
            <Badge variant="secondary" className="w-fit mb-2">{item.category}</Badge>
            <h1 className="text-3xl font-bold mb-2">{item.name}</h1>
            <p className="text-muted-foreground mb-4">{item.description}</p>
            <p className="text-3xl font-bold mb-6">₹{(item.price * quantity).toFixed(2)}</p>

            <div className="space-y-6 flex-grow">
              <div>
                <label className="text-sm font-medium mb-2 block">Quantity</label>
                <QuantitySelector quantity={quantity} setQuantity={setQuantity} />
              </div>
            </div>

            <div className="mt-8">
              <Button size="lg" className="w-full" onClick={handleAddToCart} variant="premium">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
