"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  setQuantity: (quantity: number) => void;
}

export default function QuantitySelector({ quantity, setQuantity }: QuantitySelectorProps) {
  const increment = () => setQuantity(quantity + 1);
  const decrement = () => setQuantity(Math.max(1, quantity - 1));

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={decrement} disabled={quantity <= 1}>
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        className="w-16 h-8 text-center"
        value={quantity}
        onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
        min="1"
      />
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={increment}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
