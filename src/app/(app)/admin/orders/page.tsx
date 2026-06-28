// src/app/(app)/admin/orders/page.tsx
"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { collection, onSnapshot, orderBy, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order, OrderWithUser, UserData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { columns } from '@/components/admin/orders/columns';
import { DataTable } from '@/components/admin/orders/data-table';
import KitchenSimulator from '@/components/admin/KitchenSimulator';

export default function AdminOrdersPage() {
  const [rawOrders, setRawOrders] = useState<Order[]>([]);
  const [usersMap, setUsersMap] = useState<Map<string, UserData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const newUsersMap = new Map<string, UserData>();
        usersSnapshot.forEach(doc => {
          newUsersMap.set(doc.id, doc.data() as UserData);
        });
        setUsersMap(newUsersMap);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchAllUsers();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setRawOrders(ordersData);

      // Set the first order as selected ONLY if no order is currently selected.
      // This prevents the selection from resetting on every update.
      if (!selectedOrderId && ordersData.length > 0) {
        setSelectedOrderId(ordersData[0].id);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error with real-time listener: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
    // This dependency array is now correct. It should not re-run when selectedOrderId changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ordersWithUsers = useMemo<OrderWithUser[]>(() => {
    return rawOrders.map(order => {
      const user = usersMap.get(order.userId);
      return {
        ...order,
        userEmail: user?.email || 'Unknown User',
      };
    });
  }, [rawOrders, usersMap]);

  const handleRowClick = useCallback((orderId: string) => {
    setSelectedOrderId(orderId);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-primary">Order Management</h1>
        <p className="text-muted-foreground mt-2">Select an order to view details and update its status.</p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                  <CardTitle>Incoming Orders</CardTitle>
                  <CardDescription>Click on an order to manage it. Updates are shown in real-time.</CardDescription>
              </CardHeader>
              <CardContent>
                  {loading ? (
                      <div className="flex items-center justify-center h-64">
                          <Loader2 className="h-16 w-16 animate-spin text-primary" />
                      </div>
                  ) : (
                      <DataTable 
                          columns={columns} 
                          data={ordersWithUsers}
                          onRowClick={handleRowClick}
                          selectedOrderId={selectedOrderId}
                      />
                  )}
              </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                  <CardTitle>Kitchen Control</CardTitle>
                  <CardDescription>Manage the status for the selected order.</CardDescription>
              </CardHeader>
              <CardContent>
                  {ordersWithUsers.length === 0 && !loading ? (
                      <div className="text-center text-muted-foreground p-4">No orders to display.</div>
                  ) : (
                      <KitchenSimulator orderId={selectedOrderId} />
                  )}
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
