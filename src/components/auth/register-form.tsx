"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Industry options
const INDUSTRIES = [
  "Technology", 
  "Healthcare", 
  "Finance", 
  "Education", 
  "Retail", 
  "Manufacturing", 
  "Construction",
  "Media",
  "Marketing",
  "Non-profit",
  "Other"
];

// Define the form schema directly without separate objects
const formSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  jobTitle: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Form type for better type safety
type FormValues = z.infer<typeof formSchema>;

export function RegisterForm() {
  const [activeTab, setActiveTab] = useState("account");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      jobTitle: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      
      // Create the user account
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            job_title: values.jobTitle || null,
          },
        },
      });
      
      if (signUpError) {
        console.error("Error signing up:", signUpError);
        throw signUpError;
      }

      // Create a profile in the profiles table
      if (data?.user) {
        try {
          console.log("Creating user profile for:", data.user.id);
          
          // Try upsert with only valid options
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              full_name: values.fullName,
              job_title: values.jobTitle || null,
              email: values.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, { 
              onConflict: 'id'
            });
          
          if (profileError) {
            console.error("Error creating/updating profile:", profileError);
            console.error("Full error object:", JSON.stringify(profileError, null, 2));
            
            if (profileError.message && profileError.message.includes('row-level security')) {
              console.warn("Profile creation failed due to RLS, will continue with registration");
              // Instead of throwing an error, we'll just continue with registration
              // The profile will be created/updated on first login
            } else {
              throw new Error(`Failed to create profile: ${profileError.message || profileError.details || JSON.stringify(profileError)}`);
            }
          } else {
            console.log("Profile created/updated successfully");
          }
        } catch (error: any) {
          console.error("Profile error details:", error);
          // Continue with registration instead of throwing an error
          console.warn("Will proceed without profile creation. Profile will be created on first login.");
        }

        // Registration complete - redirect to login page
        setError(null);
        router.push("/auth/login?registered=true&setup=incomplete");
      }
    } catch (error: unknown) {
      console.error("Registration error:", error);
      
      let errorMessage = "An error occurred during registration";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Sign Up</CardTitle>
        <CardDescription className="text-center">
          Create an account to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-sm bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <p className="font-semibold">Registration Error</p>
            </div>
            <p className="mt-1 ml-6">{error}</p>
          </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Project Manager" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
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
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="pt-2">
              <p className="text-sm text-muted-foreground mb-4">
                After creating your account, you'll be able to set up your company in the dashboard.
              </p>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm text-center">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Sign In
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
} 