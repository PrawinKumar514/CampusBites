
// src/components/admin/KitchenSimulator.tsx
"use client";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface KitchenSimulatorProps {
  orderId: string | null;
}

export default function KitchenSimulator({ orderId }: KitchenSimulatorProps) {

  const handleStatusUpdate = async (newStatus: string) => {
    if (!orderId) {
      toast.error("Error", { description: "No Order ID provided."});
      return;
    }
    
    const orderRef = doc(db, "orders", orderId);
    
    try {
      await updateDoc(orderRef, { status: newStatus });
      toast.success("Success", { description: `Order #${orderId.substring(0,7)} status updated to: ${newStatus}`});
    } catch (error) {
      console.error("Error updating document: ", error);
      toast.error("Error", { description: "Failed to update status."});
    }
  };

  if (!orderId) {
    return (
        <div className="p-4 border-2 border-dashed rounded-lg bg-muted/50 h-full flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-bold">No Order Selected</h3>
            <p className="text-sm text-muted-foreground mt-2">Please click on an order from the list to manage its status.</p>
        </div>
    )
  }

  return (
    <div className="p-4 border-2 border-dashed rounded-lg bg-card space-y-4">
      <div>
          <h3 className="text-lg font-bold">Update Status</h3>
          <p className="text-sm text-muted-foreground">Order ID: <span className="font-mono text-primary">{orderId.substring(0,7)}</span></p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => handleStatusUpdate('confirmed')} variant="secondary" size="sm">Confirmed</Button>
        <Button onClick={() => handleStatusUpdate('preparing')} variant="secondary" size="sm">Preparing</Button>
        <Button onClick={() => handleStatusUpdate('ready')} variant="secondary" size="sm">Ready</Button>
        <Button onClick={() => handleStatusUpdate('completed')} variant="secondary" size="sm">Completed</Button>
      </div>
    </div>
  );
}
