
// src/app/(app)/cart/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Trash2, Tag, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import QuantitySelector from '@/components/order/QuantitySelector';


export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartSubtotal } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const tax = cartSubtotal * 0.08;
  const total = cartSubtotal + tax - discount;

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'CAMPUS10') {
      const newDiscount = cartSubtotal * 0.1;
      setDiscount(newDiscount);
      toast.success("Promo Code Applied!", {
        description: `You saved ₹${newDiscount.toFixed(2)}.`,
      });
    } else {
      setDiscount(0);
      toast.error("Invalid Promo Code", {
        description: "The promo code you entered is not valid.",
      });
    }
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Your Cart</h1>
        <p className="text-muted-foreground mt-2">Review your items and Place Order.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Ordered Items</CardTitle>
            </CardHeader>
            <CardContent>
              {cartItems.length > 0 ? (
                <ul className="space-y-4">
                  {cartItems.map(item => (
                    <li key={item.id} className="flex items-start gap-4">
                      <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-md object-cover" data-ai-hint={item.imageHint}/>
                      <div className="flex-grow">
                        <p className="font-semibold">{item.name}</p>
                        <div className="mt-2">
                           <QuantitySelector quantity={item.quantity} setQuantity={(q) => updateQuantity(item.id, q)} />
                        </div>
                      </div>
                      <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                 <p className="text-muted-foreground text-center py-4">Your cart is empty.</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Promo Code</CardTitle>
              <CardDescription>Have a discount code? Enter it below.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex space-x-2">
                    <div className="relative flex-grow">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            type="text" 
                            placeholder="e.g., CAMPUS10" 
                            className="pl-10"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                        />
                    </div>
                    <Button onClick={applyPromoCode} variant="outline" disabled={cartItems.length === 0}>
                        Apply
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20 animated-glowing-border-themed overflow-visible border border-border/50">
            <CardHeader>
              <CardTitle>Total</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className='font-medium text-foreground'>₹{cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Taxes & Fees</span>
                <span className='font-medium text-foreground'>₹{tax.toFixed(2)}</span>
              </div>
               {discount > 0 && (
                <div className="flex justify-between text-green-500">
                  <span>Discount</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-xl">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" asChild variant="black" disabled={cartItems.length === 0}>
                <Link href="/payment">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Proceed to Payment
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
