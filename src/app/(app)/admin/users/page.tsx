// src/app/(app)/admin/users/page.tsx
"use client";

import { useState, useEffect } from 'react';
import type { UserProfile } from '@/lib/types';
import { fetchAllUsers } from '@/lib/helpers';
import { columns } from '@/components/admin/users/columns';
import { DataTable } from '@/components/admin/users/data-table';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUsers = async () => {
            setLoading(true);
            try {
                const usersData = await fetchAllUsers();
                setUsers(usersData);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        getUsers();
    }, []);


    return (
        <div className="container mx-auto px-4 py-8">
            <header className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-primary">User Management</h1>
                <p className="text-muted-foreground mt-2">View and manage all registered users.</p>
            </header>
            
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>A list of all users in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                     {loading ? (
                         <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-16 w-16 animate-spin text-primary" />
                        </div>
                    ) : (
                        <DataTable columns={columns} data={users} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
