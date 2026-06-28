// src/components/shared/StatusBadge.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// This is the single source of truth for status styles
const statusStyles: { [key: string]: { variant: "default" | "secondary" | "outline" | "destructive" | "premium", className?: string } } = {
    completed: {
        variant: "outline",
        className: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
    },
    ready: {
        variant: "default", 
    },
    preparing: {
        variant: "outline",
        className: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
    },
    confirmed: {
        variant: "secondary", 
    },
    default: {
        variant: "secondary",
    }
};

export const StatusBadge = ({ status, className }: { status: string, className?: string }) => {
    const style = statusStyles[status] || statusStyles.default;
    return (
        <Badge variant={style.variant} className={cn("capitalize", style.className, className)}>
            {status}
        </Badge>
    );
};
