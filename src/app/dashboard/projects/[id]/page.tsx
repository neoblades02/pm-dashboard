"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, DollarSign, Edit, Trash, Users, Plus, ListTodo } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  created_at: string;
  created_by: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchProject() {
      setIsLoading(true);
      setError(null);
      
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();
        
        if (error) throw error;
        setProject(data);
      } catch (error: any) {
        console.error("Error fetching project:", error);
        setError(error.message || "Failed to load project");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProject();
  }, [projectId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'on_hold':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      
      if (error) throw error;
      
      router.push("/dashboard/projects");
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive">
        {error}
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-semibold">Project not found</h3>
        <Button asChild className="mt-4">
          <Link href="/dashboard/projects">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="mr-2" asChild>
            <Link href="/dashboard/projects">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          {project.status && (
            <span className={`ml-4 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(project.status)}`}>
              {project.status.replace('_', ' ')}
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/projects/${projectId}/edit`}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
            <Trash className="h-4 w-4 mr-1" /> {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Overview of the project details and information.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-muted-foreground">Description</h3>
                <p className="mt-1">{project.description || "No description provided"}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-muted-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-1" /> Start Date
                  </h3>
                  <p className="mt-1">{formatDate(project.start_date)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-1" /> End Date
                  </h3>
                  <p className="mt-1">{formatDate(project.end_date)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-muted-foreground flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" /> Budget
                  </h3>
                  <p className="mt-1">{project.budget ? `$${project.budget.toLocaleString()}` : "Not set"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground flex items-center">
                    <Clock className="h-4 w-4 mr-1" /> Created
                  </h3>
                  <p className="mt-1">{new Date(project.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>People assigned to this project.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border p-6 text-center">
              <Users className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-2 font-medium">No team members yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Assign team members to collaborate on this project.</p>
              <Button className="mt-4" size="sm" asChild>
                <Link href={`/dashboard/projects/${projectId}/members`}>
                  Manage Team
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>Tasks associated with this project.</CardDescription>
            </div>
            <Button size="sm" asChild>
              <Link href={`/dashboard/projects/${projectId}/tasks/new`}>
                <Plus className="h-4 w-4 mr-1" /> New Task
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-6 text-center">
            <ListTodo className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-2 font-medium">No tasks yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Create tasks to track work for this project.</p>
            <Button className="mt-4" size="sm" asChild>
              <Link href={`/dashboard/projects/${projectId}/tasks/new`}>
                Create Task
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 