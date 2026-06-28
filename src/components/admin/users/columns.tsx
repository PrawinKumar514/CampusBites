
// src/components/admin/users/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { UserProfile } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { setUserAdminRole } from "@/lib/actions"
import { useAuth } from "@/context/AuthContext"

const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[1]) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

const UserActions = ({ user }: { user: UserProfile }) => {
    const { user: currentUser } = useAuth();
    
    // Prevent admin from changing their own role
    const isCurrentUser = currentUser?.uid === user.uid;

    const handleRoleChange = async (isAdmin: boolean) => {
        if (isCurrentUser) {
            toast.error("Action Not Allowed", { description: "You cannot change your own role." });
            return;
        }

        const action = isAdmin ? "Making" : "Removing";
        const role = isAdmin ? "admin" : "user";
        toast.info("Please wait...", { description: `${action} ${user.fullName} an ${role}.` });
        try {
            await setUserAdminRole(user.uid, isAdmin);
            toast.success("Success!", { description: `${user.fullName}'s role has been updated.` });
        } catch (error) {
            toast.error("Error", { description: "Failed to update user role." });
            console.error("Failed to update role:", error);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === 'admin' ? (
                    <DropdownMenuItem onClick={() => handleRoleChange(false)} disabled={isCurrentUser}>Remove Admin</DropdownMenuItem>
                ) : (
                    <DropdownMenuItem onClick={() => handleRoleChange(true)} disabled={isCurrentUser}>Make Admin</DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const columns: ColumnDef<UserProfile>[] = [
  {
    accessorKey: "fullName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
        const user = row.original;
        return (
            <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage src={user.photoURL} />
                    <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                </Avatar>
                <div>
                    <span className="font-medium">{user.fullName}</span>
                    <p className="text-xs text-muted-foreground">{user.uid}</p>
                </div>
            </div>
        )
    }
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
        const role = row.original.role || 'user';
        return <Badge variant={role === 'admin' ? 'premium' : 'secondary'} className="capitalize">{role}</Badge>;
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <UserActions user={row.original} />,
  },
]
