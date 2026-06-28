// src/app/(app)/foryou/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { getRecommendations, RecommendationOutput } from '@/ai/flows/recommendation-flow';
import { Loader2, Sparkles, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { menuItems } from '@/lib/data';
import MenuItemCard from '@/components/menu/MenuItemCard';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function ForYouPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [recommendations, setRecommendations] = useState<RecommendationOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        const fetchRecommendations = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const ordersQuery = query(collection(db, 'orders'), where('userId', '==', user.uid));
                const querySnapshot = await getDocs(ordersQuery);
                
                // Convert Firestore Timestamps to serializable strings
                const orderHistory = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
                    } as Order;
                });

                if (orderHistory.length === 0) {
                     // No orders yet, maybe show popular items or just a friendly message
                    setError("Place your first order to get personalized recommendations!");
                    setIsLoading(false);
                    return;
                }

                const result = await getRecommendations({ orderHistory });
                setRecommendations(result);

            } catch (err) {
                console.error("Error fetching recommendations:", err);
                setError("Sorry, we couldn't fetch recommendations at this time. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecommendations();
    }, [user]);

    const recommendedMenuItems = recommendations?.recommendations.map(rec => {
        const menuItem = menuItems.find(item => item.id === rec.id);
        return menuItem ? { ...menuItem, reason: rec.reason } : null;
    }).filter(Boolean);


    return (
        <div className="container mx-auto px-4 py-8">
            <header className="mb-8 text-center">
                <Sparkles className="h-12 w-12 text-primary mx-auto mb-2" />
                <h1 className="text-4xl font-bold tracking-tight text-primary">Just For You</h1>
                <p className="text-muted-foreground mt-2">AI-powered suggestions based on your order history.</p>
            </header>
            
            {isLoading && (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                </div>
            )}

            {error && !isLoading && (
                <Card className="max-w-md mx-auto text-center">
                    <CardHeader>
                        <CardTitle>No Recommendations Yet</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                     <CardFooter>
                        <Button className="w-full" onClick={() => router.push('/menu')}>Browse Full Menu</Button>
                    </CardFooter>
                </Card>
            )}

            {!isLoading && !error && recommendedMenuItems && recommendedMenuItems.length > 0 && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recommendedMenuItems.map((item) => item && (
                        <div key={item.id}>
                            <Card className="mb-2 bg-primary/5 border-primary/20">
                                <CardHeader className="flex-row items-start gap-3 pb-2 pt-4 px-4">
                                     <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                                     <div>
                                        <CardTitle className="text-sm font-semibold mb-1">AI Recommendation</CardTitle>
                                        <CardDescription className="text-sm">{item.reason}</CardDescription>
                                     </div>
                                </CardHeader>
                            </Card>
                            <MenuItemCard item={item} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
