"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Edit, Trash2, Users } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string | null;
  due_date: string | null;
  assigned_to: string | null;
  created_at: string;
  created_by: string;
  project_id: string | null;
  project_name?: string;
  user_name?: string;
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchTask() {
      setIsLoading(true);
      setError(null);
      
      try {
        const supabase = createClient();
        
        // Get the task with related project and user info
        const { data, error } = await supabase
          .from('tasks')
          .select(`
            *,
            projects (name),
            profiles:assigned_to (full_name)
          `)
          .eq('id', taskId)
          .single();
        
        if (error) throw error;
        
        // Transform the data to include project_name and user_name
        const formattedTask = {
          ...data,
          project_name: data.projects?.name,
          user_name: data.profiles?.full_name,
        };
        
        setTask(formattedTask);
      } catch (error: any) {
        console.error("Error fetching task:", error);
        setError(error.message || "Failed to load task");
      } finally {
        setIsLoading(false);
      }
    }
    
    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-orange-500';
      case 'urgent':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'to_do':
        return 'To Do';
      case 'in_progress':
        return 'In Progress';
      case 'review':
        return 'Review';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      
      router.push('/dashboard/tasks');
    } catch (error: any) {
      console.error("Error deleting task:", error);
      setError(error.message || "Failed to delete task");
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

  if (!task) {
    return (
      <div className="rounded-md bg-muted p-4">
        Task not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/tasks">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="mt-1">
                  {task.description || "No description provided."}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <div className="mt-1 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {getStatusLabel(task.status)}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Priority</h3>
                  <div className="mt-1 flex items-center gap-1">
                    <div className={`h-2 w-2 rounded-full ${getPriorityColor(task.priority)}`} />
                    <span className="text-sm capitalize">{task.priority || "None"}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                  <div className="mt-1 flex items-center text-sm">
                    <Calendar className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                    {formatDate(task.due_date)}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                  <div className="mt-1 flex items-center text-sm">
                    <Clock className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                    {formatDate(task.created_at)}
                  </div>
                </div>

                {task.project_name && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Project</h3>
                    <div className="mt-1">
                      <Link 
                        href={`/dashboard/projects/${task.project_id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {task.project_name}
                      </Link>
                    </div>
                  </div>
                )}

                {task.user_name && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Assigned To</h3>
                    <div className="mt-1 flex items-center text-sm">
                      <Users className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                      {task.user_name}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* We could add comments or attachments sections here in the future */}
        </div>

        <div className="w-full md:w-64 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button asChild className="w-full justify-start">
                <Link href={`/dashboard/tasks/${taskId}/edit`}>
                  <Edit className="mr-2 h-4 w-4" /> Edit Task
                </Link>
              </Button>
              <Button 
                variant="destructive" 
                className="w-full justify-start" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" /> 
                {isDeleting ? "Deleting..." : "Delete Task"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 