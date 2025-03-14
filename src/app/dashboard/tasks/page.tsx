"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Clock, Plus, Calendar } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string | null;
  due_date: string | null;
  assigned_to: string | null;
  created_at: string;
  project_id: string;
  project_name?: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      setIsLoading(true);
      setError(null);
      
      try {
        const supabase = createClient();
        
        // Get all tasks with project names
        const { data, error } = await supabase
          .from('tasks')
          .select(`
            *,
            projects (name)
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Transform the data to include project_name
        const formattedTasks = data?.map(task => ({
          ...task,
          project_name: task.projects?.name
        })) || [];
        
        setTasks(formattedTasks);
      } catch (error: any) {
        console.error("Error fetching tasks:", error);
        setError(error.message || "Failed to load tasks");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTasks();
  }, []);

  // Group tasks by status
  const tasksByStatus = tasks.reduce((groups, task) => {
    const status = task.status || 'to_do';
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(task);
    return groups;
  }, {} as Record<string, Task[]>);

  const statusColumns = [
    { id: 'to_do', label: 'To Do' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'review', label: 'Review' },
    { id: 'completed', label: 'Completed' },
  ];

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'low':
        return 'text-blue-500';
      case 'medium':
        return 'text-yellow-500';
      case 'high':
        return 'text-orange-500';
      case 'urgent':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">View and manage all your tasks.</p>
        </div>
        <Button asChild className="flex items-center gap-1">
          <Link href="/dashboard/tasks/new">
            <Plus className="h-4 w-4" /> Add Task
          </Link>
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-semibold">No tasks found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get started by creating your first task.
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard/tasks/new">
              <Plus className="mr-2 h-4 w-4" /> Create Task
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {statusColumns.map((column) => (
            <div key={column.id} className="space-y-4">
              <div className="rounded-md bg-muted p-2 font-medium">
                {column.label} ({tasksByStatus[column.id]?.length || 0})
              </div>
              <div className="space-y-3">
                {tasksByStatus[column.id]?.map((task) => (
                  <Link key={task.id} href={`/dashboard/tasks/${task.id}`}>
                    <Card className="cursor-pointer transition-shadow hover:shadow-md">
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium">{task.title}</h3>
                            {task.priority && (
                              <div className={`h-2 w-2 rounded-full ${getPriorityColor(task.priority)}`} />
                            )}
                          </div>
                          {task.project_name && (
                            <div className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                              {task.project_name}
                            </div>
                          )}
                          {task.due_date && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="mr-1 h-3 w-3" />
                              {formatDate(task.due_date)}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                {(!tasksByStatus[column.id] || tasksByStatus[column.id].length === 0) && (
                  <div className="rounded-md border border-dashed p-3 text-center text-sm text-muted-foreground">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 