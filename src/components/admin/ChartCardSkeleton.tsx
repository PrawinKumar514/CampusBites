// src/components/admin/ChartCardSkeleton.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChartCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-48" />
      </CardHeader>
      <CardContent className="pl-2 h-[350px]">
        <Skeleton className="h-full w-full" />
      </CardContent>
    </Card>
  );
}
