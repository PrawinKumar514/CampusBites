// src/app/(app)/admin/layout.tsx
"use client";

import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-lg">Verifying access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="max-w-md text-center border-destructive">
          <CardHeader>
            <div className="mx-auto bg-destructive/10 text-destructive w-16 h-16 rounded-full flex items-center justify-center mb-4">
               <ShieldAlert className="w-8 h-8"/>
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You do not have the required permissions to view this page. Please contact an administrator if you believe this is an error.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // If the user is an admin, render the requested admin page.
  return <>{children}</>;
}
