"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Building2, CalendarDays, Clock, Loader2, Mail, MoreVertical, Plus, RefreshCw, Send, Trash2, UserCircle2, UserPlus, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { z } from "zod";

// Type definitions
interface Company {
  id: string;
  name: string;
  industry: string | null;
  description: string | null;
  logo_url: string | null;
}

interface TeamMember {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  job_title: string | null;
  email: string;
  role: "owner" | "admin" | "manager" | "member";
}

interface Invitation {
  id: string;
  email: string;
  role: "admin" | "manager" | "member";
  status: "pending" | "accepted" | "expired" | "canceled";
  created_at: string;
  expires_at: string;
}

// Validation schema for invitations
const inviteFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["admin", "manager", "member"], {
    required_error: "Please select a role",
  }),
});

// Add a helper function to safely format dates
const safeFormatDate = (dateString: string | null | undefined, defaultText = "Unknown") => {
  if (!dateString) return defaultText;
  
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return defaultText;
    }
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error("Error formatting date:", error, dateString);
    return defaultText;
  }
};

export default function TeamPage() {
  // State
  const [company, setCompany] = useState<Company | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "manager" | "member">("member");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("members");

  const router = useRouter();

  // Function to fetch team data
  useEffect(() => {
    async function fetchTeamData() {
      setIsLoading(true);
      setError(null);

      try {
        const supabase = createClient();
        
        // Get current user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        
        if (!userData.user) {
          throw new Error("Not authenticated");
        }
        
        // Try to check if tables exist and get user's company
        try {
          // Get company that the user is a member of
          const { data: memberData, error: membersError } = await supabase
            .from('company_members')
            .select(`
              company_id,
              role,
              companies (
                id,
                name,
                industry,
                description,
                logo_url
              )
            `)
            .eq('user_id', userData.user.id)
            .single();
            
          if (membersError) {
            if (membersError.message?.includes('relation "company_members" does not exist') ||
                membersError.code === '42P01') {
              throw new Error('DATABASE_NOT_SETUP');
            }
            // If no company found, just return empty
            if (membersError.code === 'PGRST116') {
              setCompany(null);
              setMembers([]);
              setInvitations([]);
              setIsLoading(false);
              return;
            }
            throw membersError;
          }
          
          // Set current user's role
          setCurrentUserRole(memberData.role);
          
          // Set company information
          if (memberData && memberData.companies) {
            const companyData: Company = {
              id: Array.isArray(memberData.companies) 
                ? (memberData.companies[0]?.id as string) 
                : (memberData.companies as any).id as string,
              name: Array.isArray(memberData.companies) 
                ? (memberData.companies[0]?.name as string) 
                : (memberData.companies as any).name as string,
              industry: Array.isArray(memberData.companies) 
                ? (memberData.companies[0]?.industry as string | null) 
                : (memberData.companies as any).industry as string | null,
              description: Array.isArray(memberData.companies) 
                ? (memberData.companies[0]?.description as string | null) 
                : (memberData.companies as any).description as string | null,
              logo_url: Array.isArray(memberData.companies) 
                ? (memberData.companies[0]?.logo_url as string | null) 
                : (memberData.companies as any).logo_url as string | null
            };
            setCompany(companyData);
            
            // Get all members of this company
            const { data: allMembers, error: membersError } = await supabase
              .from('company_members')
              .select(`
                role,
                profiles (
                  id,
                  full_name,
                  avatar_url,
                  job_title,
                  email
                )
              `)
              .eq('company_id', companyData.id);
            
            if (membersError) throw membersError;
            
            // Format members data
            if (allMembers) {
              const formattedMembers = allMembers
                .filter(m => m.profiles) // Filter out any null profiles
                .map(m => {
                  const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
                  return {
                    id: profile?.id as string,
                    full_name: profile?.full_name as string | null,
                    avatar_url: profile?.avatar_url as string | null,
                    job_title: profile?.job_title as string | null,
                    email: profile?.email as string,
                    role: m.role as "owner" | "admin" | "manager" | "member",
                  };
                });
              
              setMembers(formattedMembers);
            }
            
            // Get pending invitations if user has proper permissions
            if (["owner", "admin", "manager"].includes(memberData.role)) {
              const { data: invitationsData, error: invitationsError } = await supabase
                .from('invitations')
                .select('*')
                .eq('company_id', companyData.id)
                .eq('status', 'pending');
              
              if (invitationsError) throw invitationsError;
              
              if (invitationsData) {
                setInvitations(invitationsData as Invitation[]);
              }
            }
          }
        } catch (tableError: any) {
          if (tableError.message === 'DATABASE_NOT_SETUP') {
            setError("The database tables do not exist. Please set up the database first.");
          } else {
            console.error("Error fetching team data:", tableError);
            setError("An error occurred while fetching team data. Please try again.");
          }
        }
      } catch (error: any) {
        console.error("Error in team page:", error);
        setError(error.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTeamData();
  }, []);

  // Function to handle sending invitations
  const handleInvite = async () => {
    try {
      // Validate form fields
      const result = inviteFormSchema.safeParse({
        email: inviteEmail,
        role: inviteRole,
      });

      if (!result.success) {
        const errorMessage = result.error.errors[0]?.message || "Please check the form for errors";
        toast.error(errorMessage);
        return;
      }

      if (!company) {
        toast.error("No company selected");
        return;
      }

      setIsSubmitting(true);

      // Call the API to send invitation
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          companyId: company.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Invitation error:", { status: response.status, data });
        throw new Error(data.error || "Failed to send invitation");
      }

      // Handle success
      toast.success(data.message || "Invitation sent successfully");
      setIsInviteDialogOpen(false);
      setInviteEmail("");
      setInviteRole("member");

      // If it was a new invitation, add it to the list
      if (!data.resend && data.invitation) {
        setInvitations(prev => [...prev, data.invitation]);
      }

      // Switch to invitations tab
      setActiveTab("invitations");

    } catch (error: any) {
      console.error("Error in invite handler:", error);
      toast.error(error.message || "An error occurred while sending the invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to cancel an invitation
  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/invitations?id=${invitationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel invitation");
      }

      // Remove the canceled invitation from the list
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      toast.success("Invitation canceled successfully");

    } catch (error: any) {
      toast.error(error.message || "An error occurred while canceling the invitation");
    }
  };

  // Function to resend an invitation
  const handleResendInvitation = async (invitationId: string) => {
    try {
      const response = await fetch('/api/invitations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          invitationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend invitation");
      }

      // Update the invitation in the list
      if (data.invitation) {
        setInvitations(prev => 
          prev.map(inv => inv.id === invitationId ? { ...inv, ...data.invitation } : inv)
        );
      }

      toast.success("Invitation resent successfully");

    } catch (error: any) {
      toast.error(error.message || "An error occurred while resending the invitation");
    }
  };

  // Function to update member role
  const handleUpdateRole = async (memberId: string, newRole: "admin" | "manager" | "member") => {
    if (!company) return;
    
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('company_members')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('company_id', company.id)
        .eq('user_id', memberId);
      
      if (error) throw error;
      
      // Update the member in the list
      setMembers(prev => 
        prev.map(member => member.id === memberId ? { ...member, role: newRole } : member)
      );
      
      toast.success(`Role updated successfully`);
      
    } catch (error: any) {
      toast.error(error.message || "An error occurred while updating the role");
    }
  };

  // Function to remove a member
  const handleRemoveMember = async (memberId: string) => {
    if (!company) return;
    
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('company_members')
        .delete()
        .eq('company_id', company.id)
        .eq('user_id', memberId);
      
      if (error) throw error;
      
      // Remove the member from the list
      setMembers(prev => prev.filter(member => member.id !== memberId));
      
      toast.success(`Team member removed successfully`);
      
    } catch (error: any) {
      toast.error(error.message || "An error occurred while removing the team member");
    }
  };

  // Helper function to get initials from name
  const getInitials = (name: string | null): string => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Helper function to get role badge color
  const getRoleBadgeVariant = (role: string): "default" | "outline" | "secondary" | "destructive" => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      case "manager":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 text-primary animate-spin" />
            <h2 className="mt-2 text-xl font-semibold">Loading team information...</h2>
            <p className="text-muted-foreground">Please wait while we load your team data</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Team</CardTitle>
            <CardDescription>Manage your team members and invitations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center p-4 mb-4 text-red-800 rounded-lg bg-red-50 dark:bg-red-900/50 dark:text-red-200">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="sr-only">Error</span>
              <div>
                <span className="font-medium">Error!</span> {error}
              </div>
            </div>
            <Button onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No company state
  if (!company) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Team</CardTitle>
            <CardDescription>Manage your team members and invitations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No Company Found</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                You are not a member of any company. Please create or join a company to manage team members.
              </p>
              <Button className="mt-6" onClick={() => router.push('/dashboard')}>
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main content
  return (
    <div className="container py-6">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Team Management</CardTitle>
              <CardDescription>Manage your team members and invitations</CardDescription>
            </div>
            {["owner", "admin", "manager"].includes(currentUserRole || "") && (
              <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Team Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to a new team member to join your company.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="colleague@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={inviteRole}
                        onValueChange={(value) => setInviteRole(value as "admin" | "manager" | "member")}
                      >
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentUserRole === "owner" && (
                            <SelectItem value="admin">Administrator</SelectItem>
                          )}
                          {(currentUserRole === "owner" || currentUserRole === "admin") && (
                            <SelectItem value="manager">Manager</SelectItem>
                          )}
                          <SelectItem value="member">Team Member</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        {inviteRole === "admin" && "Administrators can manage team members, projects, and settings."}
                        {inviteRole === "manager" && "Managers can manage projects and invite team members."}
                        {inviteRole === "member" && "Team members can view and work on assigned projects and tasks."}
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleInvite} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Invitation
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="flex-shrink-0">
                {company.logo_url ? (
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={company.logo_url} alt={company.name} />
                    <AvatarFallback>{getInitials(company.name)}</AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{company.name}</h3>
                {company.industry && (
                  <p className="text-sm text-muted-foreground">Industry: {company.industry}</p>
                )}
                {company.description && (
                  <p className="text-sm mt-1">{company.description}</p>
                )}
              </div>
              <div className="bg-primary/10 px-3 py-1 rounded text-xs font-medium text-primary">
                {members.length} {members.length === 1 ? "Member" : "Members"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="members">
            Team Members ({members.length})
          </TabsTrigger>
          {["owner", "admin", "manager"].includes(currentUserRole || "") && (
            <TabsTrigger value="invitations">
              Invitations ({invitations.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                All members of your company and their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <div className="text-center py-12">
                  <UserCircle2 className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No Team Members</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You don't have any team members yet. Invite someone to join your team.
                  </p>
                  {["owner", "admin", "manager"].includes(currentUserRole || "") && (
                    <Button
                      className="mt-6"
                      onClick={() => setIsInviteDialogOpen(true)}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Invite a Team Member
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.avatar_url || undefined} alt={member.full_name || 'Team member'} />
                          <AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.full_name || 'Unnamed User'}</div>
                          <div className="flex items-center text-sm text-muted-foreground gap-2">
                            <Mail className="h-3 w-3" /> {member.email}
                          </div>
                          {member.job_title && <div className="text-sm">{member.job_title}</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-auto">
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </Badge>
                        
                        {/* Actions dropdown - Only show for users with proper permissions */}
                        {currentUserRole === "owner" || 
                         (currentUserRole === "admin" && member.role !== "owner" && member.role !== "admin") ||
                         (currentUserRole === "manager" && member.role === "member") ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {/* Role options based on current user's role */}
                              {currentUserRole === "owner" && member.role !== "owner" && (
                                <>
                                  <DropdownMenuItem
                                    disabled={member.role === "admin"}
                                    onClick={() => handleUpdateRole(member.id, "admin")}
                                  >
                                    Make Administrator
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    disabled={member.role === "manager"}
                                    onClick={() => handleUpdateRole(member.id, "manager")}
                                  >
                                    Make Manager
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    disabled={member.role === "member"}
                                    onClick={() => handleUpdateRole(member.id, "member")}
                                  >
                                    Make Member
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              
                              {currentUserRole === "admin" && member.role === "member" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleUpdateRole(member.id, "manager")}
                                  >
                                    Make Manager
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              
                              {/* Remove option */}
                              {(currentUserRole === "owner" ||
                               (currentUserRole === "admin" && member.role !== "owner" && member.role !== "admin")) && (
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleRemoveMember(member.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove Member
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {["owner", "admin", "manager"].includes(currentUserRole || "") && (
          <TabsContent value="invitations">
            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>
                  Invitations sent to potential team members
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invitations.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No Pending Invitations</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You don't have any pending invitations. Invite someone to join your team.
                    </p>
                    <Button
                      className="mt-6"
                      onClick={() => setIsInviteDialogOpen(true)}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Invite a Team Member
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border"
                      >
                        <div>
                          <div className="font-medium">{invitation.email}</div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Badge variant="outline">
                              {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                            </Badge>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Sent {safeFormatDate(invitation.created_at, "recently")}
                            </span>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <CalendarDays className="h-3 w-3 mr-1" />
                            Expires {safeFormatDate(invitation.expires_at, "in the future")}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResendInvitation(invitation.id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Resend
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelInvitation(invitation.id)}
                            className="text-red-600"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <p className="text-sm text-muted-foreground">
                  {invitations.length} active {invitations.length === 1 ? "invitation" : "invitations"}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsInviteDialogOpen(true)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  New Invitation
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
} 