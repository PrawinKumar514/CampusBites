// src/components/tracking/OrderStatusTracker.tsx
"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Check, ChefHat, ShoppingBasket, PartyPopper, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const statuses = [
  { name: "Order Confirmed", key: "confirmed", icon: Check },
  { name: "In the Kitchen", key: "preparing", icon: ChefHat },
  { name: "Ready for Pickup", key: "ready", icon: ShoppingBasket },
  { name: "Completed", key: "completed", icon: PartyPopper },
];

interface OrderStatusTrackerProps {
  orderId: string;
}

export default function OrderStatusTracker({ orderId }: OrderStatusTrackerProps) {
  const [currentStatusKey, setCurrentStatusKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const ref = doc(db, "orders", orderId);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const s = snap.data()?.status ?? null;
          setCurrentStatusKey(typeof s === "string" ? s : null);
        } else {
          setCurrentStatusKey(null);
        }
        setLoading(false);
      },
      () => {
        // On error, keep UI safe
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orderId]);

  const currentStatusIndex = statuses.findIndex((s) => s.key === currentStatusKey);
  const safeIndex = Math.max(0, currentStatusIndex); // if -1, keep bar at start

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full" role="status" aria-live="polite">
      <div className="flex justify-between items-center relative">
        {statuses.map((status, index) => {
          const active = index <= safeIndex;
          const Icon = status.icon;
          return (
            <div key={status.key} className="flex flex-col items-center z-10 w-1/4">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-500",
                  active
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-muted border-border text-muted-foreground"
                )}
                aria-label={`${status.name}${active ? " (done)" : ""}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <p
                className={cn(
                  "text-xs md:text-sm text-center mt-2 font-medium transition-colors duration-500",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {status.name}
              </p>
            </div>
          );
        })}

        <div className="absolute top-5 left-0 w-full h-0.5 bg-border transform -translate-y-1/2" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-primary transform -translate-y-1/2 transition-all duration-500"
          style={{ width: `${(safeIndex / (statuses.length - 1)) * 100}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
