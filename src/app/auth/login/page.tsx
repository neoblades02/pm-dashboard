import { LoginForm } from "@/components/auth/login-form";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign In | PM Dashboard",
  description: "Sign in to your account",
};

// Add a loading component for the suspense fallback
function LoginFormSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto animate-pulse">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 space-y-1.5">
          <div className="h-7 bg-muted rounded w-1/3 mx-auto"></div>
          <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/5"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
          <div className="h-10 bg-muted rounded mt-6"></div>
        </div>
        <div className="p-6 flex flex-col space-y-2 items-center">
          <div className="h-4 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginForm />
    </Suspense>
  );
} 