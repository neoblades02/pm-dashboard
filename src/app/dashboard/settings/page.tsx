"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.getUser();
        
        if (!error && data.user) {
          setUser(data.user);
          
          // Get profile data if needed
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
          if (profileData) {
            setUser({ ...data.user, profile: profileData });
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadUserData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account profile information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                    value={user?.email || ""}
                    disabled
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your email address is used for login and cannot be changed.
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                    defaultValue={user?.profile?.full_name || ""}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium" htmlFor="current-password">
                    Current Password
                  </label>
                  <input
                    id="current-password"
                    type="password"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="new-password">
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                    placeholder="Enter new password"
                  />
                </div>
              </div>
              <Button>Change Password</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Customize the appearance of the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-medium">Toggle between light and dark mode</p>
                  <p className="text-xs text-muted-foreground">
                    Choose the theme that's easier on your eyes.
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for important updates.
                    </p>
                  </div>
                  <label className="relative inline-block h-6 w-11">
                    <input type="checkbox" className="peer sr-only" defaultChecked />
                    <span className="absolute inset-0 cursor-pointer rounded-full bg-muted transition-all peer-checked:bg-primary"></span>
                    <span className="absolute left-1 top-1 h-4 w-4 cursor-pointer rounded-full bg-white transition-all peer-checked:left-6"></span>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Task Reminders</p>
                    <p className="text-sm text-muted-foreground">
                      Get reminders for upcoming and overdue tasks.
                    </p>
                  </div>
                  <label className="relative inline-block h-6 w-11">
                    <input type="checkbox" className="peer sr-only" defaultChecked />
                    <span className="absolute inset-0 cursor-pointer rounded-full bg-muted transition-all peer-checked:bg-primary"></span>
                    <span className="absolute left-1 top-1 h-4 w-4 cursor-pointer rounded-full bg-white transition-all peer-checked:left-6"></span>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Project Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when projects are updated.
                    </p>
                  </div>
                  <label className="relative inline-block h-6 w-11">
                    <input type="checkbox" className="peer sr-only" />
                    <span className="absolute inset-0 cursor-pointer rounded-full bg-muted transition-all peer-checked:bg-primary"></span>
                    <span className="absolute left-1 top-1 h-4 w-4 cursor-pointer rounded-full bg-white transition-all peer-checked:left-6"></span>
                  </label>
                </div>
              </div>
              <Button>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 