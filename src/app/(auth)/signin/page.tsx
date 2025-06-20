
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { signInUserAction } from '@/actions/auth'; 
import { useState, useTransition } from 'react';

const formSchema = z.object({
  user_Id: z.string().min(1, { message: "User ID is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function SignInPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_Id: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await signInUserAction(values);
       
      if (result.success && result.user) {
        toast({
          title: "Sign In Successful",
          description: result.message,
        });
        if (result.user.role === 'super_admin') {
          router.push("/dashboard");
        } else if (result.user.role === 'client_admin') {
          router.push("/client-admin/dashboard");
        } else {
          // Fallback, though the action should always assign a role on success
          console.warn("User role not determined, defaulting to super admin dashboard.");
          router.push("/dashboard");
        }
      } else {
        toast({
          title: "Sign In Failed",
          description: result.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <Card className="w-full max-w-md shadow-xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-center">Sign In</CardTitle>
        <CardDescription className="text-center">
          Access your Voxaiomni account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="user_Id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User ID</FormLabel>
                  <FormControl>
                    <Input placeholder="testUser or your_client_username" {...field} disabled={isPending} />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="password123" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
