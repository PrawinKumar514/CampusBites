// src/app/(app)/admin/page.tsx
"use client";

import { useEffect, useState, useCallback } from 'react';
import { collection, onSnapshot, query, Timestamp, orderBy } from 'firebase/firestore';
import { startOfDay, subDays, subMonths, subYears, startOfMonth, getMonth, getYear, format } from 'date-fns';
import { db } from '@/lib/firebase';
import type { Order, ChartData, UserProfile, TimeRange } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { IndianRupee, ShoppingBasket, Users, Loader2, BarChart2, ExternalLink } from 'lucide-react';
import { fetchAllUsers } from '@/lib/helpers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ChartCardSkeleton from '@/components/admin/ChartCardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

type ActiveChart = 'orders' | 'revenue';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  description?: string;
}

const StatCard = ({ title, value, icon: Icon, description }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
       {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
);

const DynamicChartCard = dynamic(() => import('@/components/admin/ChartCard'), {
  ssr: false,
  loading: () => <ChartCardSkeleton />
});

const StatCardsSkeleton = () => (
    <>
        <Card><CardHeader><Skeleton className="h-5 w-32 mb-2"/><Skeleton className="h-4 w-24"/></CardHeader><CardContent><Skeleton className="h-8 w-24"/></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-5 w-32 mb-2"/><Skeleton className="h-4 w-24"/></CardHeader><CardContent><Skeleton className="h-8 w-24"/></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-5 w-32 mb-2"/><Skeleton className="h-4 w-24"/></CardHeader><CardContent><Skeleton className="h-8 w-24"/></CardContent></Card>
    </>
);

const DynamicStatCards = dynamic(() => Promise.resolve(({ revenue, ordersCount, users, timeRange, timeRangeDescriptions }: any) => (
    <>
        <StatCard title="Total Revenue" value={`₹${revenue.toFixed(2)}`} icon={IndianRupee} description={`Revenue ${timeRangeDescriptions[timeRange]}`}/>
        <StatCard title="Total Orders" value={`${ordersCount}`} icon={ShoppingBasket} description={`Orders ${timeRangeDescriptions[timeRange]}`}/>
        <StatCard title="Total Users" value={`${users.length}`} icon={Users} description="All registered users"/>
    </>
)), {
    ssr: false,
    loading: () => <StatCardsSkeleton />
});


export default function AdminDashboardPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [revenue, setRevenue] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [activeChart, setActiveChart] = useState<ActiveChart>('orders');

  // Effect 1: Fetch all users once, and set up real-time listener for orders.
  useEffect(() => {
    const bootstrapData = async () => {
        // Fetch all users (constant)
        try {
          const usersData = await fetchAllUsers();
          setUsers(usersData);
        } catch (error) {
           console.error("Error fetching users:", error);
        }
    };
    bootstrapData();
    
    // Set up the real-time listener for orders.
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setAllOrders(ordersData);
        setLoading(false); // Turn off initial loader
    }, (error) => {
        console.error("Error with real-time order listener: ", error);
        setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Effect 2: This effect recalculates stats whenever the time range or the base order data changes
  useEffect(() => {
        if (loading) return; // Don't calculate stats until initial load is done

        const calculateStats = () => {
            setLoadingStats(true);
            const now = new Date();
            let startDate: Date;

            if (timeRange === '7d') {
                startDate = subDays(now, 6);
            } else if (timeRange === '30d') {
                startDate = subDays(now, 29);
            } else { // 12m
                startDate = subYears(now, 1);
                startDate = startOfMonth(startDate);
            }

            const filteredOrders = allOrders.filter(order => {
                const orderDate = (order.createdAt as Timestamp)?.toDate();
                return orderDate && orderDate >= startOfDay(startDate);
            });

            const newRevenue = filteredOrders.reduce((acc, order) => order.status === 'completed' ? acc + order.total : acc, 0);
            const newOrdersCount = filteredOrders.length;
            
            setRevenue(newRevenue);
            setOrdersCount(newOrdersCount);

            // Process data for charts
            let newChartData: ChartData[] = [];
            if (timeRange === '12m') {
                const monthlyData = Array.from({ length: 12 }).map((_, i) => {
                    const date = subMonths(now, 11 - i);
                    return { name: format(date, 'MMM yy'), orders: 0, revenue: 0 };
                });
                
                filteredOrders.forEach(order => {
                    if (order.createdAt) {
                        const orderDate = (order.createdAt as Timestamp).toDate();
                        const monthIndex = (getYear(orderDate) - getYear(startDate)) * 12 + (getMonth(orderDate) - getMonth(startDate));
                        if (monthIndex >= 0 && monthIndex < 12) {
                              monthlyData[monthIndex].orders += 1;
                              if(order.status === 'completed') monthlyData[monthIndex].revenue += order.total;
                        }
                    }
                });
                newChartData = monthlyData;
            } else { // 7d or 30d
                const days = timeRange === '7d' ? 7 : 30;
                const dailyData = Array.from({ length: days }).map((_, i) => {
                    const date = subDays(now, days - 1 - i);
                    return { name: format(date, 'MMM d'), orders: 0, revenue: 0 };
                });

                filteredOrders.forEach(order => {
                    if (order.createdAt) {
                        const orderDate = (order.createdAt as Timestamp).toDate();
                        const dayStr = format(orderDate, 'MMM d');
                        const dayData = dailyData.find(d => d.name === dayStr);
                        if (dayData) {
                            dayData.orders += 1;
                            if(order.status === 'completed') dayData.revenue += order.total;
                        }
                    }
                });
                newChartData = dailyData;
            }
            setChartData(newChartData);
            setLoadingStats(false);
        };
        
        calculateStats();

    }, [timeRange, allOrders, loading]);
  
    const revenueFormatter = (value: number) => `₹${value.toFixed(0)}`;
  
    const timeRangeDescriptions: Record<TimeRange, string> = {
      '7d': 'in the last 7 days',
      '30d': 'in the last 30 days',
      '12m': 'in the last 12 months'
    };

    if (loading) {
        return <div className="flex items-center justify-center h-[calc(100vh-4rem)]"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <header>
                    <h1 className="text-4xl font-bold tracking-tight text-primary">Admin Dashboard</h1>
                    <p className="text-muted-foreground mt-2">An overview of your application's key metrics.</p>
                </header>
                 <Button asChild>
                    <Link href="/admin/orders">
                        Manage Orders
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
            <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)} className="w-full">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
                        <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
                        <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
                        <TabsTrigger value="12m">Last 12 Months</TabsTrigger>
                    </TabsList>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                     <DynamicStatCards 
                        revenue={revenue}
                        ordersCount={ordersCount}
                        users={users}
                        timeRange={timeRange}
                        timeRangeDescriptions={timeRangeDescriptions}
                    />
                </div>
            
                <TabsContent value={timeRange} className="space-y-4 mt-4">
                    <div className="flex justify-center">
                        <ToggleGroup 
                            type="single" 
                            defaultValue="orders"
                            value={activeChart}
                            onValueChange={(value: ActiveChart) => {
                                if (value) setActiveChart(value);
                            }}
                            className="bg-muted rounded-full p-1"
                        >
                            <ToggleGroupItem value="orders" aria-label="Toggle orders" className="flex items-center gap-2 px-6 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm rounded-full">
                                <BarChart2 className="h-4 w-4"/>
                                Order Volume
                            </ToggleGroupItem>
                            <ToggleGroupItem value="revenue" aria-label="Toggle revenue" className="flex items-center gap-2 px-6 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm rounded-full">
                                <IndianRupee className="h-4 w-4"/>
                                Revenue Volume
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                    {loadingStats ? (
                         <ChartCardSkeleton />
                        ) : (
                        <DynamicChartCard 
                            title={activeChart === 'orders' ? 'Order Volume' : 'Revenue Volume'}
                            data={chartData}
                            dataKey={activeChart}
                            formatter={activeChart === 'revenue' ? revenueFormatter : undefined}
                        />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
