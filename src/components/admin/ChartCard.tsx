// src/components/admin/ChartCard.tsx
"use client";

import type { ChartData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ChartCardProps {
    title: string;
    data: ChartData[];
    dataKey: keyof ChartData;
    formatter?: (value: number) => string;
}

export default function ChartCard({ title, data, dataKey, formatter }: ChartCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} tickFormatter={formatter ? (value) => formatter(value).replace('₹', '') : undefined} />
                        <Tooltip
                            contentStyle={{
                                background: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "var(--radius)",
                            }}
                            cursor={{ fill: "hsl(var(--accent))", opacity: 0.5 }}
                            formatter={(value, name, props) => {
                                if (typeof value === 'number') {
                                    if (name === 'revenue') {
                                        return [`₹${value.toFixed(2)}`, 'Revenue'];
                                    }
                                    return [value, 'Orders'];
                                }
                                return [value, name];
                            }}
                        />
                        <Bar dataKey={dataKey} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
