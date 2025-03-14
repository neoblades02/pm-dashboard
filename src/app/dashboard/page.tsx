"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { AlertCircle, Calendar, CheckCircle, Clock, FolderKanban, LineChart, ListTodo, PlusCircle, Zap, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
} from "lucide-react";

interface Statistics {
  totalProjects: number;
  totalTasks: number;
  todoTasks: number;
  completedTasks: number;
  taskCompletionRate: number;
}

interface Task {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  project_id: string;
  project_name?: string;
  priority: string;
  created_at: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userCompany, setUserCompany] = useState<Record<string, unknown> | null>(null);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("");
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        // Fetch recent tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        if (tasksError) {
          console.error("Tasks fetch error:", tasksError);
          throw new Error("Failed to fetch tasks: " + (tasksError.message || tasksError.details || "Unknown error"));
        }

        const tasks = tasksData || [];
        
        // No tasks is a valid state - user might not have created any tasks yet
        if (tasks.length > 0) {
          // Get unique project IDs from tasks and filter out null or undefined values
          const projectIds = [...new Set(tasks.map((task) => task.project_id))]
            .filter(id => id !== null && id !== undefined && id !== 'null' && id !== 'none');

          // Fetch project names for the task's project IDs (if any)
          if (projectIds.length > 0) {
            const { data: projectsData, error: projectsError } = await supabase
              .from("projects")
              .select("id, name")
              .in("id", projectIds);

            if (projectsError) {
              console.error("Projects fetch error:", projectsError);
              throw new Error("Failed to fetch projects: " + (projectsError.message || projectsError.details || "Unknown error"));
            }

            // Map project names to tasks
            const tasksWithProjectNames = tasks.map((task) => {
              const project = projectsData?.find((p) => p.id === task.project_id);
              return {
                ...task,
                project_name: project?.name,
              };
            });

            setRecentTasks(tasksWithProjectNames);
          } else {
            setRecentTasks(tasks);
          }
        } else {
          setRecentTasks([]);
        }

        // Fetch statistics
        const { data: projectsCountData, error: projectsCountError } = await supabase
          .from("projects")
          .select("id", { count: "exact" });

        if (projectsCountError) {
          console.error("Projects count error:", projectsCountError);
          throw new Error("Failed to fetch project count: " + (projectsCountError.message || projectsCountError.details || "Unknown error"));
        }

        const { data: allTasksData, error: allTasksError } = await supabase
          .from("tasks")
          .select("status");

        if (allTasksError) {
          console.error("All tasks error:", allTasksError);
          throw new Error("Failed to fetch tasks status: " + (allTasksError.message || allTasksError.details || "Unknown error"));
        }

        // Calculate statistics
        const totalProjects = projectsCountData?.length || 0;
        const totalTasks = allTasksData?.length || 0;
        const todoTasks = allTasksData?.filter((task) => task.status === "To Do").length || 0;
        const completedTasks = allTasksData?.filter((task) => task.status === "Completed").length || 0;
        const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        setStats({
          totalProjects,
          totalTasks,
          todoTasks,
          completedTasks,
          taskCompletionRate,
        });
      } catch (error: unknown) {
        console.error("Error fetching dashboard data:", error);
        setError(typeof error === 'string' ? error : 
               (error instanceof Error) ? error.message : 
               "Failed to load dashboard data. Please check database setup.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        
        // Get the user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error("Authentication error:", userError);
          throw new Error("Authentication error: " + (userError.message || "Failed to authenticate user"));
        }
        
        if (!user) {
          throw new Error("Not authenticated. Please log in again.");
        }
        
        // Get the user's profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user?.id)
          .single();
        
        if (profileError) {
          console.error("Profile error:", profileError);
          throw new Error("Error loading profile: " + (profileError.message || profileError.details || "Unknown error"));
        }
        
        setUserName(profile?.full_name || user?.email?.split('@')[0] || 'User');
        
        // Check if user has a company
        const { data: companyMember, error: companyMemberError } = await supabase
          .from('company_members')
          .select('company_id')
          .eq('user_id', user?.id)
          .single();
        
        // PGRST116 error means "not found" which is normal if user doesn't have a company yet
        if (companyMemberError && companyMemberError.code !== 'PGRST116') {
          console.error("Company member error:", companyMemberError);
          // Don't throw here, just log the error and continue
        }
        
        if (companyMember?.company_id) {
          // Get company details
          const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('id', companyMember.company_id)
            .single();
          
          if (companyError) {
            console.error("Company fetch error:", companyError);
            // Don't throw, just log the error and continue without company data
          } else {
            setUserCompany(company);
          }
        }
      } catch (error: unknown) {
        console.error("Error fetching user data:", error);
        setError(typeof error === 'string' ? error : 
               (error instanceof Error) ? error.message : 
               "Failed to load your data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingCompany(true);
    setCompanyError(null);
    
    if (!companyName.trim()) {
      setCompanyError("Company name is required");
      setIsCreatingCompany(false);
      return;
    }
    
    try {
      const supabase = createClient();
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("User auth error:", userError);
        throw new Error("Authentication error: " + userError.message);
      }
      
      if (!user) {
        throw new Error("You must be logged in to create a company");
      }
      
      console.log("Attempting to create company:", companyName);
      
      // Check if user already has a company
      const { data: existingMembership, error: membershipCheckError } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (membershipCheckError) {
        console.error("Error checking existing membership:", membershipCheckError);
      } else if (existingMembership?.company_id) {
        throw new Error("You&apos;re already a member of a company. Please refresh the page.");
      }
      
      // Create the company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyName.trim(),
          description: companyDescription.trim() || null,
          industry: companyIndustry.trim() || null
        })
        .select()
        .single();
      
      if (companyError) {
        console.error("Company creation error:", companyError);
        console.error("Full company error:", JSON.stringify(companyError, null, 2));
        
        if (companyError.message && companyError.message.includes('row-level security')) {
          // RLS error handling - provide guidance to admin
          setCompanyError(`
            Your Supabase database requires Row Level Security (RLS) policy updates. 
            Please run the following SQL in your Supabase SQL Editor:
            
            CREATE POLICY "Allow company insert for authenticated users" 
            ON companies FOR INSERT 
            TO authenticated
            WITH CHECK (true);
            
            CREATE POLICY "Allow company_members insert for authenticated users" 
            ON company_members FOR INSERT 
            TO authenticated
            WITH CHECK (true);
          `);
          setIsCreatingCompany(false);
          return;
        }
        
        throw new Error("Failed to create company: " + companyError.message);
      }
      
      console.log("Company created successfully:", company.id);
      
      // Add user as company owner
      const { error: memberError } = await supabase
        .from('company_members')
        .insert({
          company_id: company.id,
          user_id: user.id,
          role: 'owner'
        });
      
      if (memberError) {
        console.error("Company membership error:", memberError);
        console.error("Full membership error:", JSON.stringify(memberError, null, 2));
        
        if (memberError.message && memberError.message.includes('row-level security')) {
          // Another RLS issue - provide guidance
          setCompanyError(`
            Row Level Security policy issue with company_members table.
            Please run the following SQL in your Supabase SQL Editor:
            
            CREATE POLICY "Allow company_members insert for authenticated users" 
            ON company_members FOR INSERT 
            TO authenticated
            WITH CHECK (true);
          `);
          setIsCreatingCompany(false);
          return;
        }
        
        throw new Error("Failed to add you as company owner: " + memberError.message);
      }
      
      console.log("User added as company owner successfully");
      
      // Update local state
      setUserCompany(company);
      setShowCompanyForm(false);
      
      // Show success message and reload
      alert("Company created successfully! The page will now refresh.");
      window.location.reload();
    } catch (error: unknown) {
      console.error("Error creating company:", error);
      setCompanyError(typeof error === 'string' ? error : 
                     (error instanceof Error) ? error.message : 
                     "Failed to create company");
    } finally {
      setIsCreatingCompany(false);
    }
  };

  // Get the appropriate status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "To Do":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Review":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Medium":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  if (error) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <AlertCircle className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
        
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Error Loading Dashboard</CardTitle>
            </div>
            <CardDescription>
              We encountered a problem while loading your dashboard data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-md bg-destructive/10">
              <p className="font-medium text-destructive">{error}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                This could be due to network issues, database configuration, or authentication problems.
                Try refreshing the page or contact support if the problem persists.
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => window.location.reload()}>Refresh Page</Button>
              <Button asChild variant="default">
                <Link href="/dashboard">Go to Dashboard Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/dashboard/projects/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {!userCompany && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>You need to create or join a company to use all features</CardDescription>
          </CardHeader>
          <CardContent>
            {!showCompanyForm ? (
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Welcome, {userName}!</h3>
                  <p>Create your company to start managing projects and collaborating with your team.</p>
                </div>
                <Button onClick={() => setShowCompanyForm(true)} size="lg">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Company
                </Button>
              </div>
            ) : (
              <form onSubmit={handleCreateCompany} className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md mb-4">
                  <h3 className="text-md font-medium text-blue-800 dark:text-blue-300 mb-2">Getting Started</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    Creating a company is the first step. After this, you'll be able to create projects, 
                    add tasks, and invite team members.
                  </p>
                </div>
                
                {companyError && (
                  <div className="text-sm text-red-500 flex items-start bg-red-50 dark:bg-red-900/30 p-4 rounded-md">
                    <AlertCircle className="mr-2 h-4 w-4 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Error</p>
                      {companyError.includes('Row Level Security') ? (
                        <>
                          <p className="mb-2">Database security policy issue detected:</p>
                          <div className="bg-slate-800 text-slate-100 p-3 rounded font-mono text-xs overflow-auto whitespace-pre">
                            {companyError}
                          </div>
                          <p className="mt-2 text-xs">
                            You need to update your Supabase Row Level Security (RLS) policies. 
                            Copy the SQL above and run it in your Supabase SQL Editor.
                          </p>
                        </>
                      ) : (
                        <p>{companyError}</p>
                      )}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name *</Label>
                  <Input 
                    id="company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter company name"
                    required
                    className="text-lg"
                  />
                  <p className="text-xs text-muted-foreground">This is how your company will be identified</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-industry">Industry</Label>
                  <Input 
                    id="company-industry"
                    value={companyIndustry}
                    onChange={(e) => setCompanyIndustry(e.target.value)}
                    placeholder="E.g. Technology, Healthcare, Education"
                  />
                  <p className="text-xs text-muted-foreground">The field your company operates in</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-description">Description</Label>
                  <Textarea 
                    id="company-description"
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    placeholder="Brief description of your company"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">A short description to help team members understand what your company does</p>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCompanyForm(false)}
                    disabled={isCreatingCompany}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isCreatingCompany || !companyName.trim()}
                    className="min-w-[120px]"
                  >
                    {isCreatingCompany ? 
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </> : 
                      "Create Company"
                    }
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          // Skeleton loading state for stats cards
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="p-6">
                  <Skeleton className="h-5 w-1/2" />
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <Skeleton className="h-12 w-20" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="overflow-hidden border-t-4 border-t-blue-500 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Projects
                </CardTitle>
                <FolderKanban className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-3xl font-bold">{stats?.totalProjects || 0}</div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Across all active workspaces
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-t-4 border-t-violet-500 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Tasks
                </CardTitle>
                <ListTodo className="h-5 w-5 text-violet-500" />
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-3xl font-bold">{stats?.totalTasks || 0}</div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Across all projects
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-t-4 border-t-amber-500 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  To Do Tasks
                </CardTitle>
                <Clock className="h-5 w-5 text-amber-500" />
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-3xl font-bold">{stats?.todoTasks || 0}</div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Pending completion
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-t-4 border-t-green-500 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completed Tasks
                </CardTitle>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-3xl font-bold">{stats?.completedTasks || 0}</div>
                <div className="mt-2">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Completion rate</span>
                    <span className="font-medium">{Math.round(stats?.taskCompletionRate || 0)}%</span>
                  </div>
                  <Progress value={stats?.taskCompletionRate || 0} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Activity Section */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Recent Tasks */}
        <Card className="md:col-span-4">
          <CardHeader className="flex flex-row items-center p-6">
            <div>
              <CardTitle>Recent Tasks</CardTitle>
              <CardDescription>
                Your recently created tasks across all projects
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="ml-auto gap-1">
              <Zap className="h-3.5 w-3.5" />
              <span>View All</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              // Skeleton loading state for tasks
              <div className="px-6 pb-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="mb-4 flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentTasks.length > 0 ? (
              <div className="divide-y">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center p-6 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                        <Link 
                          href={`/dashboard/tasks/${task.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {task.title}
                        </Link>
                        {task.project_name && (
                          <span className="text-xs text-muted-foreground">
                            in {task.project_name}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Badge 
                          variant="secondary" 
                          className={getStatusColor(task.status)}
                        >
                          {task.status}
                        </Badge>
                        {task.priority && (
                          <Badge 
                            variant="secondary" 
                            className={getPriorityColor(task.priority)}
                          >
                            {task.priority} Priority
                          </Badge>
                        )}
                        {task.due_date && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Due {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <LineChart className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <ListTodo className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-medium">No tasks found</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                  You haven't created any tasks yet. Create your first task to
                  see it here.
                </p>
                <Button asChild className="mt-6">
                  <Link href="/dashboard/tasks/create">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Task
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed / Calendar Preview */}
        <Card className="md:col-span-3">
          <CardHeader className="p-6">
            <CardTitle>Activity Feed</CardTitle>
            <CardDescription>Recent activity across your workspace</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {loading ? (
                // Skeleton loading for activity feed
                <div className="px-6 pb-6 space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2 py-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
                  <div className="rounded-full bg-primary/10 p-3">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">No Activity Yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                    Activity from you and your team members will appear here as you work on projects and tasks.
                  </p>
                  <div className="mt-6 space-y-4 w-full">
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-center">
                        <Badge className="mr-2">DEMO</Badge>
                        <p className="text-sm text-muted-foreground">Example of what activity will look like:</p>
                      </div>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200">
                            <UserIcon />
                          </div>
                          <div className="flex-1 text-left">
                            <p><span className="font-medium">Team Member</span> created a new task <span className="font-medium text-blue-600 dark:text-blue-400">Design user dashboard</span></p>
                            <p className="text-xs text-muted-foreground">3 minutes ago</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-800 dark:text-purple-200">
                            <UserIcon />
                          </div>
                          <div className="flex-1 text-left">
                            <p><span className="font-medium">Team Member</span> completed a task <span className="font-medium text-blue-600 dark:text-blue-400">Update documentation</span></p>
                            <p className="text-xs text-muted-foreground">27 minutes ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
} 