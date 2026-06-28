
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle, Loader2, QrCode } from 'lucide-react';
import { toast } from "sonner"
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

type PaymentStatus = 'idle' | 'processing' | 'success';

export default function PaymentPage() {
  const router = useRouter();
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const { user } = useAuth();
  const { cartItems, cartSubtotal, clearCart, isCartLoading } = useCart();
  
  const tax = cartSubtotal * 0.08;
  const total = cartSubtotal + tax; // Assuming no discount for now
  const upiId = "prawinkumar514@oksbi"; // Replace with your actual UPI ID
  const upiUrl = `upi://pay?pa=${upiId}&pn=Campus%20Bites&am=${total.toFixed(2)}&cu=INR`;
  const [newOrderId, setNewOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'success' && newOrderId) {
      toast.success("Payment Successful!", {
        description: "Redirecting to your order tracker...",
      });
      const timer = setTimeout(() => {
        router.push(`/tracking/${newOrderId}`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, newOrderId, router]);

  async function handlePayment() {
    if (!user || cartItems.length === 0) {
      toast.error("Error", { description: "You must be logged in and have items in your cart." });
      return;
    }
    
    // Attempt to open the UPI deep link
    window.location.href = upiUrl;

    setStatus('processing');
    toast.info("Verifying Payment...", {
      description: "Please complete the payment in your UPI app. We're waiting for confirmation.",
    });

    // Simulate payment verification and order creation
    setTimeout(async () => {
      try {
        const orderData = {
          userId: user.uid,
          items: cartItems,
          subtotal: cartSubtotal,
          tax: tax,
          total: total,
          status: 'confirmed',
          createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, 'orders'), orderData);
        
        setNewOrderId(docRef.id);
        clearCart();
        setStatus('success');

      } catch (error) {
        console.error("Error creating order:", error);
        toast.error("Order Failed", { description: "Could not save your order. Please try again." });
        setStatus('idle');
      }
    }, 3000);
  }

  const renderButtonContent = () => {
    switch (status) {
      case 'processing':
        return (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Verifying Payment...
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="mr-2 h-5 w-5" />
            Payment Successful!
          </>
        );
      case 'idle':
      default:
        return 'Pay with UPI';
    }
  };
  
    if (isCartLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
  
    if (cartItems.length === 0 && status !== 'success') {
        return (
            <div className="container mx-auto max-w-md px-4 py-8 text-center">
                <Card>
                    <CardHeader>
                        <CardTitle>Your cart is empty</CardTitle>
                        <CardDescription>Add items to your cart before proceeding to payment.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push('/menu')}>Browse Menu</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      <Card className="animate-fade-in-down bg-gradient-to-b from-card to-background border-accent/20 shadow-accent/10 shadow-lg text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 text-primary w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <QrCode className="w-8 h-8"/>
          </div>
          <CardTitle>Complete Your Payment</CardTitle>
          <CardDescription>Scan the QR or use the button below to pay ₹{total.toFixed(2)}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
            <div className='bg-white p-2 rounded-lg'>
                <Image 
                    src="/images/QR IMG.jpeg" 
                    width={200} 
                    height={200} 
                    alt="UPI QR Code"
                    data-ai-hint="qr code" 
                />
            </div>
            <div className='text-center'>
                <p className='text-sm text-muted-foreground'>Or pay to UPI ID:</p>
                <p className='font-semibold text-primary'>{upiId}</p>
            </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handlePayment} 
            className="w-full" 
            size="lg" 
            disabled={status !== 'idle'} 
            variant={status === 'success' ? 'default' : 'premium'}
          >
            {renderButtonContent()}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
