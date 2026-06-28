// src/app/(app)/profile/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOut,
  Mail,
  User,
  Edit2,
  Loader2,
  Phone,
  ShoppingBasket,
  Save,
  ShieldAlert,
  Trash2,
  ChevronRight,
  View,
  KeyRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  signOut,
  updateProfile,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  updatePassword,
} from "firebase/auth";
import { auth, storage, db } from "@/lib/firebase";
import { toast } from "sonner";
import { useRef, useState, ChangeEvent, useEffect } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  writeBatch,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import type { Order } from "@/lib/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import Link from "next/link";

interface UserProfileData {
  fullName: string;
  mobileNumber: string;
  email: string;
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);

  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [isFetchingOrders, setIsFetchingOrders] = useState(true);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  // State for changing password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const fetchUserData = async () => {
    if (!user) return;
    setIsFetchingData(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfileData;
        setProfileData(data);
        setDisplayName(data.fullName);
        setPhoneNumber(data.mobileNumber || "");
      } else {
        // Fallback to auth data if firestore doc is missing, but don't try to create it here.
        console.warn("User document not found in Firestore for UID:", user.uid);
        const fallbackData: UserProfileData = {
          fullName: user.displayName || "New User",
          email: user.email || "No email",
          mobileNumber: user.phoneNumber || "",
        };
        setProfileData(fallbackData);
        setDisplayName(fallbackData.fullName);
        setPhoneNumber(fallbackData.mobileNumber);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Error", { description: "Could not fetch your profile data." });
    } finally {
      setIsFetchingData(false);
    }
  };

  const fetchOrderHistory = async () => {
    if (!user) return;
    setIsFetchingOrders(true);
    try {
      const ordersQuery = query(
        collection(db, "orders"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(ordersQuery);
      const userOrders = querySnapshot.docs.map(
        (d) =>
          ({
            id: d.id,
            ...d.data(),
          } as Order)
      );

      // Client-side sort by createdAt desc
      userOrders.sort((a, b) => {
        const dateA = (a.createdAt as Timestamp)?.toDate() || new Date(0);
        const dateB = (b.createdAt as Timestamp)?.toDate() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setOrders(userOrders);
    } catch (error) {
      console.error("Error fetching order history:", error);
      toast.error("Error", { description: "Could not fetch your order history." });
    } finally {
      setIsFetchingOrders(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchOrderHistory();
    } else if (!loading) {
      setIsFetchingData(false);
      setIsFetchingOrders(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success("Signed Out", {
        description: "You have been successfully signed out.",
      });
      router.push("/");
    } catch (error) {
      toast.error("Sign Out Failed", {
        description: "There was a problem signing you out.",
      });
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;

    const file = e.target.files[0];
    setIsUploading(true);
    toast.info("Uploading...", {
      description: "Your new profile picture is being uploaded.",
    });

    const storageRef = ref(storage, `avatars/${user.uid}`);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(snapshot.ref);
      await updateProfile(user, { photoURL });
      // Optional: force refresh if the UI doesn't reflect immediately
      await auth.currentUser?.reload();
      toast.success("Success!", {
        description: "Your profile picture has been updated.",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Upload Failed", {
        description: "There was a problem uploading your image.",
      });
    } finally {
      setIsUploading(false);
      // allow re-selecting the same file
      e.target.value = "";
    }
  };

  const handleProfileUpdate = async (field: "fullName" | "mobileNumber") => {
    if (!user) return;
    setIsSaving(true);
    toast.info("Saving...", { description: "Updating your profile information." });

    try {
      const userDocRef = doc(db, "users", user.uid);
      const updateData: Partial<UserProfileData> = {};

      if (field === "fullName") {
        updateData.fullName = displayName;
        if (user.displayName !== displayName) {
          await updateProfile(user, { displayName: displayName });
        }
      }
      if (field === "mobileNumber") {
        updateData.mobileNumber = phoneNumber;
      }

      await updateDoc(userDocRef, updateData);

      toast.success("Profile Updated!", {
        description: "Your information has been saved.",
      });
      if (field === "fullName") setIsEditingName(false);
      if (field === "mobileNumber") setIsEditingPhone(false);
      await fetchUserData();
    } catch (error) {
      console.error("Error updating profile: ", error);
      toast.error("Update Failed", { description: "Could not save your changes." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !user.email) return;
    setIsDeleting(true);
    toast.info("Deleting Account...", { description: "Please wait." });

    try {
      const credential = EmailAuthProvider.credential(user.email, deletePassword);
      await reauthenticateWithCredential(user, credential);

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const batch = writeBatch(db);
        const deletedUserRef = doc(db, "deleted_users", user.uid);

        batch.set(deletedUserRef, { ...userData, deletedAt: new Date() });
        batch.delete(userDocRef);
        await batch.commit();
      }

      await deleteUser(user);

      toast.success("Account Deleted", {
        description: "Your account has been permanently deleted.",
      });
      router.push("/");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      let description = "An unexpected error occurred.";
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        description = "Incorrect password. Please try again.";
      }
      toast.error("Deletion Failed", { description });
    } finally {
      setIsDeleting(false);
      setDeletePassword("");
    }
  };

  const handleChangePassword = async () => {
    if (!user || !user.email) return;

    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password too short", {
        description: "New password must be at least 6 characters.",
      });
      return;
    }

    setIsChangingPassword(true);
    toast.info("Updating Password...", { description: "Please wait." });

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      toast.success("Password Updated!", {
        description: "Your password has been changed successfully.",
      });
      setIsPasswordDialogOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: any) {
      console.error("Error changing password:", error);
      let description = "An unexpected error occurred.";
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        description = "Incorrect current password. Please try again.";
      }
      toast.error("Password Change Failed", { description });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user || !user.email) return;
    setIsSendingReset(true);
    toast.info("Sending...", { description: "Sending password reset email." });

    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.success("Email Sent!", {
        description: "Check your inbox for a password reset link.",
      });
    } catch (error) {
      console.error("Error sending password reset email:", error);
      toast.error("Error", {
        description: "Could not send password reset email. Please try again later.",
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  if (loading || isFetchingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profileData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p>Could not load user profile.</p>
        <Button onClick={() => router.push("/")}>Go to Homepage</Button>
      </div>
    );
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "??";
    const names = name.split(" ");
    if (names.length > 1 && names[0] && names[1]) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const displayedOrders = showAllOrders ? orders : orders.slice(0, 5);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8 w-full">
        <Card className="lg:col-span-2 bg-gradient-to-b from-card to-background">
          <CardHeader className="text-center items-center pb-8 pt-10">
            <div
              className="relative w-32 h-32 mx-auto mb-4 group cursor-pointer"
              onClick={handleAvatarClick}
            >
              <Avatar className="w-32 h-32 border-4 border-primary shadow-lg transition-opacity duration-300 group-hover:opacity-75">
                <AvatarImage
                  src={user.photoURL ?? undefined}
                  alt={profileData.fullName}
                />
                <AvatarFallback className="text-4xl font-bold bg-black text-white">
                  {getInitials(user.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {isUploading ? (
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                ) : (
                  <Edit2 className="w-10 h-10 text-white transition-all duration-300 group-hover:scale-110" />
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg"
                disabled={isUploading}
              />
            </div>
            <CardTitle className="text-3xl font-bold">
              {profileData.fullName}
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground/80">
              Manage your account details and preferences.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border border-border/50">
                <User className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div className="flex-grow">
                  <p className="text-sm font-semibold text-muted-foreground">
                    Full Name
                  </p>
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="text-lg"
                      />
                      <Button
                        onClick={() => handleProfileUpdate("fullName")}
                        size="icon"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="animate-spin h-4 w-4" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-lg font-medium">{profileData.fullName}</p>
                  )}
                </div>
                {!isEditingName && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditingName(true)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg border border-border/50">
                <Mail className="h-6 w-6 text-primary mt-1" />
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">
                    Email Address
                  </p>
                  <p className="text-lg font-medium">{profileData.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border border-border/50">
                <Phone className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div className="flex-grow">
                  <p className="text-sm font-semibold text-muted-foreground">
                    Mobile Number
                  </p>
                  {isEditingPhone ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="text-lg"
                        type="tel"
                      />
                      <Button
                        onClick={() => handleProfileUpdate("mobileNumber")}
                        size="icon"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="animate-spin h-4 w-4" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-lg font-medium">
                      {profileData.mobileNumber || "Not Set"}
                    </p>
                  )}
                </div>
                {!isEditingPhone && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditingPhone(true)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border border-border/50">
                <KeyRound className="h-6 w-6 text-primary flex-shrink-0" />
                <div className="flex-grow">
                  <p className="text-sm font-semibold text-muted-foreground">
                    Password & Security
                  </p>
                  <p className="text-lg font-medium">••••••••••</p>
                </div>
                <AlertDialog
                  open={isPasswordDialogOpen}
                  onOpenChange={setIsPasswordDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button variant="secondary">Change Password</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Change Your Password</AlertDialogTitle>
                      <AlertDialogDescription>
                        Enter your current password and a new password below.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input
                          id="current-password"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter your current password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter your new password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-new-password">
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirm-new-password"
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Confirm your new password"
                        />
                      </div>
                    </div>
                    <AlertDialogFooter className="sm:justify-between items-center gap-2">
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto"
                        onClick={handlePasswordReset}
                        disabled={isSendingReset}
                      >
                        {isSendingReset ? (
                          <Loader2 className="animate-spin h-4 w-4" />
                        ) : (
                          "I forgot my password"
                        )}
                      </Button>
                      <div className="flex gap-2">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleChangePassword}
                          disabled={
                            isChangingPassword ||
                            !currentPassword ||
                            !newPassword ||
                            !confirmNewPassword
                          }
                        >
                          {isChangingPassword ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Save Changes
                        </AlertDialogAction>
                      </div>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="border-t border-dashed pt-6 mt-6 flex items-center gap-4">
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="lg"
                className="w-full text-base"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Sign Out
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="lg"
                    className="w-full text-base"
                  >
                    <Trash2 className="mr-2 h-5 w-5" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <ShieldAlert className="h-6 w-6 text-destructive" />
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and remove your data from our servers. To
                      confirm, please enter your password.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-2">
                    <Label htmlFor="delete-password">Password</Label>
                    <Input
                      id="delete-password"
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Enter your password"
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={isDeleting || deletePassword.length < 6}
                      className={buttonVariants({ variant: "destructive" })}
                    >
                      {isDeleting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      I understand, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-b from-card to-background border-accent/20 shadow-accent/10 shadow-lg flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <ShoppingBasket className="h-6 w-6 text-primary" />
              Order History
            </CardTitle>
            <CardDescription>
              A list of your past orders from Campus Bites.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {isFetchingOrders ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : orders.length > 0 ? (
              <ul className="space-y-4">
                {displayedOrders.map((order) => (
                  <li key={order.id}>
                    <Link
                      href={`/tracking/${order.id}`}
                      className="block p-4 rounded-lg bg-muted/50 border border-border/50 hover:bg-accent/10 hover:border-accent transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-primary">
                            Order #{order.id.substring(0, 7)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {(order.createdAt as Timestamp)
                              ?.toDate()
                              .toLocaleDateString()}{" "}
                            - {order.items.length} items
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            ₹{order.total.toFixed(2)}
                          </p>
                          <StatusBadge status={order.status} className="mt-1" />
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-muted-foreground py-8 h-full flex flex-col justify-center items-center">
                <p>You haven't placed any orders yet.</p>
                <p className="text-sm">
                  Start browsing the menu to place your first order!
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2">
            {orders.length > 5 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAllOrders((prev) => !prev)}
              >
                <View className="mr-2 h-4 w-4" />
                {showAllOrders ? "Show Less" : "View All Orders"}
              </Button>
            )}
            <Button
              variant="premium"
              className="w-full"
              onClick={() => router.push("/menu")}
            >
              Browse Menu
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
