"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { LogoutDialog } from "@/components/logout-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

// Icons
import { 
  Settings, 
  LogOut,
  LayoutGrid,
  FolderKanban,
  CheckSquare,
  MessageSquare,
  Users,
  ChevronDown,
  Menu,
  X,
  Clock
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  // userId tracks authentication status - if null, user is not authenticated
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState<string>("PM Dashboard");
  const [userName, setUserName] = useState<string>("User");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.getUser();
        
        if (error || !data.user) {
          router.push("/auth/login");
          return;
        }
        
        // Store user ID to track authentication status
        setUserId(data.user.id);
        setUserEmail(data.user.email || "");
        
        // Fetch user profile information
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          // Fall back to email as username if profile fetch fails
          setUserName(data.user.email?.split('@')[0] || "User");
        } else if (profileData) {
          // Use full name if available, otherwise use email username part
          setUserName(
            profileData.full_name && profileData.full_name.trim() !== "" 
              ? profileData.full_name 
              : data.user.email?.split('@')[0] || "User"
          );
          setUserAvatar(profileData.avatar_url);
        } else {
          // No profile data found
          setUserName(data.user.email?.split('@')[0] || "User");
        }
        
        // Fetch company information
        const { data: companyMemberData, error: companyMemberError } = await supabase
          .from('company_members')
          .select('company_id')
          .eq('user_id', data.user.id)
          .single();
        
        if (companyMemberError && companyMemberError.code !== 'PGRST116') {
          console.error("Error fetching company membership:", companyMemberError);
        } else if (companyMemberData?.company_id) {
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('name')
            .eq('id', companyMemberData.company_id)
            .single();
          
          if (companyError) {
            console.error("Error fetching company data:", companyError);
          } else if (companyData) {
            setCompanyName(companyData.name);
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, [router]);

  useEffect(() => {
    // For demo purposes, create some sample notifications
    // In a real app, you would fetch these from your backend
    const demoNotifications = [
      {
        id: "1",
        title: "New Task Assigned",
        message: "You have been assigned a new task: Design Updates",
        time: new Date(new Date().getTime() - 25 * 60000).toISOString(), // 25 minutes ago
        read: false,
        type: "task"
      },
      {
        id: "2",
        title: "Project Update",
        message: "The website redesign project has been updated",
        time: new Date(new Date().getTime() - 3 * 3600000).toISOString(), // 3 hours ago
        read: true,
        type: "project"
      },
      {
        id: "3",
        title: "Meeting Reminder",
        message: "Team meeting starts in 30 minutes",
        time: new Date(new Date().getTime() - 1 * 86400000).toISOString(), // 1 day ago
        read: false,
        type: "reminder"
      }
    ];
    
    setNotifications(demoNotifications);
    setHasUnreadNotifications(demoNotifications.some(n => !n.read));
  }, []);

  // If still loading or not authenticated (userId is null), show loading or redirect
  if (loading || !userId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Get initials for avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const markNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setHasUnreadNotifications(false);
  };

  const formatNotificationTime = (time: string) => {
    const date = new Date(time);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInMinutes < 24 * 60) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / (24 * 60));
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task":
        return <CheckSquare className="h-4 w-4 text-blue-500" />;
      case "project":
        return <FolderKanban className="h-4 w-4 text-purple-500" />;
      case "reminder":
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Navigation items
  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutGrid className="h-5 w-5" />,
    },
    {
      name: "Projects",
      href: "/dashboard/projects",
      icon: <FolderKanban className="h-5 w-5" />,
    },
    {
      name: "Tasks",
      href: "/dashboard/tasks",
      icon: <CheckSquare className="h-5 w-5" />,
    },
    {
      name: "Chat",
      href: "/dashboard/chat",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      name: "Team",
      href: "/dashboard/team",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
    }
  ];

  return (
    <div className="flex min-h-screen bg-background/50">
      {/* Sidebar navigation - desktop */}
      <div className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r bg-background/95 backdrop-blur-sm md:flex">
        {/* Logo and company name */}
        <div className="flex h-16 items-center border-b px-6">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 font-semibold"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">PM</span>
            <span className="font-medium">{companyName}</span>
          </Link>
        </div>
        
        {/* Navigation links */}
        <div className="flex flex-1 flex-col gap-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all
                  ${isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-primary/10 hover:text-primary"}
                `}
              >
                <span className={`${isActive ? '' : 'text-muted-foreground group-hover:text-primary'}`}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </div>
        
        {/* User section */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3 rounded-md bg-muted/50 p-3">
            <Avatar>
              <AvatarImage src={userAvatar || undefined} />
              <AvatarFallback>{getInitials(userName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{userName}</p>
              <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
            </div>
            <LogoutDialog>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <LogOut className="h-4 w-4" />
              </Button>
            </LogoutDialog>
          </div>
        </div>
      </div>
      
      {/* Mobile header */}
      <div className="fixed inset-x-0 top-0 z-20 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur-sm px-4 md:hidden">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="rounded-md p-2 text-muted-foreground hover:bg-muted"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 font-semibold"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">PM</span>
          <span className="font-medium md:hidden">{companyName}</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <Bell className="h-5 w-5" />
                {hasUnreadNotifications && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
              <div className="flex items-center justify-between p-4 border-b">
                <h4 className="font-medium">Notifications</h4>
                <Button variant="ghost" size="sm" onClick={markNotificationsAsRead}>
                  Mark all as read
                </Button>
              </div>
              <ScrollArea className="h-[300px]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 p-4 text-center">
                    <Bell className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-4 hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-muted/20' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1 flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{formatNotificationTime(notification.time)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <div className="p-2 border-t">
                <Button variant="ghost" size="sm" className="w-full">
                  View all notifications
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Avatar className="h-8 w-8">
            <AvatarImage src={userAvatar || undefined} />
            <AvatarFallback>{getInitials(userName)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-10 bg-background/80 backdrop-blur-sm md:hidden" onClick={() => setIsMenuOpen(false)}>
          <div 
            className="fixed inset-y-0 left-0 z-20 w-64 bg-background p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">PM</span>
                  <span className="font-medium">{companyName}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`
                        group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all
                        ${isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "text-muted-foreground hover:bg-primary/10 hover:text-primary"}
                      `}
                    >
                      <span className={`${isActive ? '' : 'text-muted-foreground group-hover:text-primary'}`}>
                        {item.icon}
                      </span>
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              
              <div className="mt-auto">
                <div className="flex items-center gap-3 rounded-md bg-muted/50 p-3">
                  <Avatar>
                    <AvatarImage src={userAvatar || undefined} />
                    <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">{userName}</p>
                    <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
                  </div>
                  <LogoutDialog>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </LogoutDialog>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-1 md:pl-64">
        {/* Desktop header */}
        <div className="sticky top-0 z-10 hidden h-16 items-center justify-between border-b bg-background/95 backdrop-blur-sm px-8 md:flex">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search..." 
              className="pl-9 h-9 focus-visible:ring-primary/20"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full relative">
                  <Bell className="h-5 w-5" />
                  {hasUnreadNotifications && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0">
                <div className="flex items-center justify-between p-4 border-b">
                  <h4 className="font-medium">Notifications</h4>
                  <Button variant="ghost" size="sm" onClick={markNotificationsAsRead}>
                    Mark all as read
                  </Button>
                </div>
                <ScrollArea className="h-[300px]">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 p-4 text-center">
                      <Bell className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No notifications yet</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`p-4 hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-muted/20' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1 flex-shrink-0">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{notification.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">{formatNotificationTime(notification.time)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                <div className="p-2 border-t">
                  <Button variant="ghost" size="sm" className="w-full">
                    View all notifications
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={userAvatar || undefined} />
                <AvatarFallback>{getInitials(userName)}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{userName}</p>
              </div>
            </div>
          </div>
        </div>
        
        <main className="container mx-auto p-4 pt-20 md:p-8 md:pt-8">{children}</main>
      </div>
    </div>
  );
} 