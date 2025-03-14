"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, XCircle } from "lucide-react";

export default function InvitationPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Extract token from URL
  const token = params.token as string;
  
  useEffect(() => {
    async function checkInvitation() {
      setIsLoading(true);
      setError(null);
      
      try {
        const supabase = createClient();
        
        // First check if user is logged in
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        
        if (!userData.user) {
          // If not logged in, redirect to login page with a return path
          router.push(`/auth/login?returnTo=/invitations/${token}`);
          return;
        }
        
        setCurrentUser(userData.user);
        
        // Check if invitation exists and is valid
        const { data: invitationData, error: invitationError } = await supabase
          .from('invitations')
          .select(`
            id,
            company_id,
            email,
            role,
            status,
            expires_at,
            companies (
              id,
              name,
              industry,
              description
            )
          `)
          .eq('token', token)
          .single();
        
        if (invitationError) {
          if (invitationError.code === 'PGRST116') {
            throw new Error('Invitation not found or has been revoked');
          }
          throw invitationError;
        }
        
        // Check if invitation has expired
        const expiryDate = new Date(invitationData.expires_at);
        if (expiryDate < new Date()) {
          throw new Error('This invitation has expired');
        }
        
        // Check if invitation has already been accepted
        if (invitationData.status === 'accepted') {
          throw new Error('This invitation has already been accepted');
        }
        
        // Check if invitation has been canceled
        if (invitationData.status === 'canceled') {
          throw new Error('This invitation has been canceled');
        }
        
        // Check if email matches
        if (invitationData.email.toLowerCase() !== userData.user.email?.toLowerCase()) {
          throw new Error('This invitation was sent to a different email address');
        }
        
        // Check if user is already a member of this company
        const { data: memberData, error: memberError } = await supabase
          .from('company_members')
          .select('id')
          .eq('company_id', invitationData.company_id)
          .eq('user_id', userData.user.id)
          .maybeSingle();
        
        if (memberData) {
          throw new Error('You are already a member of this company');
        }
        
        // All checks passed, store invitation and company data
        setInvitation(invitationData);
        setCompany(invitationData.companies);
        
      } catch (error: any) {
        console.error("Error checking invitation:", error);
        setError(error.message || "An error occurred while checking the invitation");
      } finally {
        setIsLoading(false);
      }
    }
    
    if (token) {
      checkInvitation();
    } else {
      setError("Invalid invitation link");
      setIsLoading(false);
    }
  }, [token, router]);
  
  const handleAcceptInvitation = async () => {
    if (!invitation || !currentUser) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const supabase = createClient();
      
      // First, make sure the user has a profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', currentUser.id)
        .maybeSingle();
      
      // If profile doesn't exist, create it
      if (!profileData) {
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: currentUser.id,
            full_name: currentUser.user_metadata?.full_name || null,
            email: currentUser.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        
        if (createProfileError) throw createProfileError;
      }
      
      // Add user to company with the assigned role
      const { error: memberError } = await supabase
        .from('company_members')
        .insert({
          company_id: invitation.company_id,
          user_id: currentUser.id,
          role: invitation.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      
      if (memberError) throw memberError;
      
      // Update invitation status to accepted
      const { error: updateError } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', invitation.id);
      
      if (updateError) throw updateError;
      
      // Success! Set state to show success message
      setSuccess(true);
      
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      setError(error.message || "An error occurred while accepting the invitation");
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container max-w-md mx-auto mt-20 px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Checking Invitation</CardTitle>
            <CardDescription>Please wait while we verify your invitation</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-center text-muted-foreground">Verifying invitation details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container max-w-md mx-auto mt-20 px-4">
        <Card>
          <CardHeader className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <CardTitle className="mt-4">Invitation Error</CardTitle>
            <CardDescription>We couldn't process this invitation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-destructive">{error}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/dashboard">
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="container max-w-md mx-auto mt-20 px-4">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
            <CardTitle className="mt-4">Invitation Accepted</CardTitle>
            <CardDescription>You've successfully joined {company?.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              You can now access all the projects and resources for this company.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Invitation details and accept button
  return (
    <div className="container max-w-md mx-auto mt-20 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Company Invitation</CardTitle>
          <CardDescription className="text-center">
            You've been invited to join a company
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-primary/10 p-4">
            <h3 className="font-medium text-primary">{company?.name}</h3>
            {company?.industry && (
              <p className="text-sm text-muted-foreground mt-1">Industry: {company.industry}</p>
            )}
            {company?.description && (
              <p className="text-sm mt-2">{company.description}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Role</span>
              <span className="text-sm">
                {invitation?.role === 'admin' && "Administrator"}
                {invitation?.role === 'manager' && "Manager"}
                {invitation?.role === 'member' && "Team Member"}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Expires</span>
              <span className="text-sm">
                {invitation?.expires_at && new Date(invitation.expires_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="rounded-md bg-blue-50 p-4 flex items-start gap-3 dark:bg-blue-900/30">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 dark:text-blue-400" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p>By accepting this invitation, you will join the company's workspace and gain access to their projects and resources.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" disabled={isProcessing} onClick={() => router.push('/dashboard')}>
            Decline
          </Button>
          <Button disabled={isProcessing} onClick={handleAcceptInvitation}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accepting...
              </>
            ) : (
              "Accept Invitation"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 