
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import OrderStatusTracker from "@/components/tracking/OrderStatusTracker";
import { PartyPopper, Loader2 } from "lucide-react";
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { Order } from "@/lib/types";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

export default function TrackingPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided.");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
        } else {
          setError("Order not found.");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to fetch order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  if (error) {
    return <div className="container mx-auto max-w-2xl px-4 py-8 text-center text-destructive">{error}</div>;
  }

  if (!order) {
    return <div className="container mx-auto max-w-2xl px-4 py-8 text-center">Order details could not be loaded.</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 space-y-8">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 text-primary w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <PartyPopper className="w-8 h-8"/>
          </div>
          <CardTitle className="text-2xl">Order Details</CardTitle>
          <CardDescription>
            Tracking order <span className="font-semibold text-primary">#{order.id.substring(0, 7)}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrderStatusTracker orderId={order.id} />
          
          <Separator className="my-6"/>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Items Ordered</h3>
            <ul className="space-y-3">
              {order.items.map(item => (
                <li key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                      <Image src={item.imageUrl} alt={item.name} width={48} height={48} className="rounded-md" data-ai-hint={item.imageHint} />
                      <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                  </div>
                  <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <Separator className="my-6"/>

          <div className="space-y-2">
            <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
             <div className="flex justify-between text-muted-foreground">
                <span>Taxes & Fees</span>
                <span>₹{order.tax.toFixed(2)}</span>
            </div>
             <div className="flex justify-between font-bold text-lg">
                <span>Total Paid</span>
                <span>₹{order.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
