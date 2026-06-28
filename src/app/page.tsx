// src/app/page.tsx
"use client";
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const SignInForm = dynamic(() => import('@/components/auth/SignInForm'), { 
  ssr: false,
  loading: () => (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Skeleton className="h-10 w-48 mx-auto mb-4" />
        <Skeleton className="h-5 w-64 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-12 w-full mt-6" />
        <Skeleton className="h-5 w-48 mx-auto" />
      </CardContent>
    </Card>
  )
});

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <SignInForm />
    </div>
  );
}
