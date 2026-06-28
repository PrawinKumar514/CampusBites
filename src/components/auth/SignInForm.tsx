// src/components/auth/SignInForm.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, Lock, UtensilsCrossed, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

const signInFormSchema = z.object({
  email: z.string().email("Please enter a valid email address.").refine(
    (email) => email.endsWith("@srmist.edu.in"),
    "Please use your SRMIST college email address."
  ),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const resetPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address.")
});

export default function SignInForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const form = useForm<z.infer<typeof signInFormSchema>>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signInFormSchema>) {
    setIsSubmitting(true);
    toast.info("Signing In...", {
      description: "Please wait while we verify your credentials.",
    });

    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      if (user.emailVerified) {
        toast.success("Signed In Successfully!", {
          description: "Welcome back!",
        });
        router.push("/menu");
      } else {
        await signOut(auth);
        toast.error("Email Not Verified", {
          description: "Please check your inbox and verify your email address to continue.",
        });
      }

    } catch (error: any) {
      console.error("Firebase Sign-In Error:", error);
      let description = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = "Invalid email or password. Please check your credentials and try again.";
      }
      toast.error("Sign-In Failed", {
        description,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handlePasswordReset = async () => {
    setIsSendingReset(true);
    toast.info("Sending...", { description: "Sending password reset email." });
    
    try {
        await resetPasswordSchema.parseAsync({ email: resetEmail });
        await sendPasswordResetEmail(auth, resetEmail);
        toast.success("Email Sent!", { description: "Check your inbox for a password reset link." });
        setIsResetDialogOpen(false);
        setResetEmail("");
    } catch (error: any) {
        let description = "Could not send password reset email. Please try again later.";
        if (error instanceof z.ZodError) {
            description = error.errors[0].message;
        } else if (error.code === 'auth/user-not-found') {
            description = "No account found with this email address."
        }
        console.error("Error sending password reset email:", error);
        toast.error("Error", { description });
    } finally {
        setIsSendingReset(false);
    }
  }

  return (
      <Card className="w-full max-w-md animate-fade-in-down bg-gradient-to-b from-card to-background border-accent/20 shadow-accent/10 shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-3 mb-4 animate-fade-in-down animation-delay-200">
            <UtensilsCrossed className="h-8 w-8 text-primary" />
            <CardTitle className="text-4xl font-bold tracking-tight">Campus Bites</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground/80">
            Sign in to access your campus food hub
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>College Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="email" placeholder="student@srmist.edu.in" {...field} className="pl-10 focus:shadow-accent/40 focus:shadow-[0_0_15px_0px]" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Password</FormLabel>
                       <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                            <AlertDialogTrigger asChild>
                               <Button variant="link" type="button" className="text-xs p-0 h-auto">Forgot Password?</Button>
                            </AlertDialogTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Reset Your Password</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Enter your registered email address below. We will send you a link to reset your password.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-2">
                                    <Label htmlFor="reset-email">Email Address</Label>
                                    <Input id="reset-email" type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="student@srmist.edu.in" />
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handlePasswordReset} disabled={isSendingReset || !resetEmail}>
                                        {isSendingReset ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                        Send Reset Link
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                       </AlertDialog>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="password" placeholder="••••••••" {...field} className="pl-10 focus:shadow-accent/40 focus:shadow-[0_0_15px_0px]" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" variant="premium" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="underline text-accent font-medium hover:text-primary transition-colors">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
  );
}
