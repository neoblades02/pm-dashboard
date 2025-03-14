"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  ChevronRight,
  Clock,
  FolderKanban,
  Home,
  ListTodo,
  MessageSquare,
  Search,
  Users,
  Zap,
  LayoutDashboard,
  Bell,
  ArrowRight,
  BarChart3,
  Menu,
  X,
  ChevronDown,
  PlusCircle,
  Settings,
  User,
  Download,
  Check
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function DemoPage() {
  const [activeFeature, setActiveFeature] = useState<string>("dashboard");
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              <span className="font-semibold">
                <span className="text-primary">PM</span> Dashboard
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block relative w-[200px] lg:w-[320px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search..." 
                className="pl-8 bg-muted/40 border-muted w-full focus-visible:ring-primary"
              />
            </div>
            
            <nav className="hidden lg:flex items-center gap-4">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <FolderKanban className="h-4 w-4" />
                Projects
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Users className="h-4 w-4" />
                Team
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </nav>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button size="icon" variant="ghost" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1.5 flex h-2 w-2 rounded-full bg-primary"></span>
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              <Button 
                variant="outline" 
                size="icon" 
                className="lg:hidden" 
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 top-14 z-30 bg-background border-t p-4">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search..." 
                className="pl-8 bg-muted/40 border-muted w-full"
              />
            </div>
            <nav className="flex flex-col gap-1">
              <Button variant="ghost" className="justify-start gap-2 px-2">
                <FolderKanban className="h-4 w-4" />
                Projects
              </Button>
              <Button variant="ghost" className="justify-start gap-2 px-2">
                <Users className="h-4 w-4" />
                Team
              </Button>
              <Button variant="ghost" className="justify-start gap-2 px-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <Button variant="ghost" className="justify-start gap-2 px-2">
                <User className="h-4 w-4" />
                Profile
              </Button>
            </nav>
            
            <Link href="/auth/signup" className="mt-auto">
              <Button className="w-full">Sign Up Free</Button>
            </Link>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="hidden lg:block w-[240px] border-r p-4 overflow-y-auto">
          <div className="space-y-1 mb-6">
            <FeatureButton
              active={activeFeature === "dashboard"}
              onClick={() => setActiveFeature("dashboard")}
              icon={<LayoutDashboard className="mr-2 h-4 w-4" />}
              label="Dashboard"
            />
            <FeatureButton
              active={activeFeature === "projects"}
              onClick={() => setActiveFeature("projects")}
              icon={<FolderKanban className="mr-2 h-4 w-4" />}
              label="Projects"
            />
            <FeatureButton
              active={activeFeature === "tasks"}
              onClick={() => setActiveFeature("tasks")}
              icon={<ListTodo className="mr-2 h-4 w-4" />}
              label="Tasks"
            />
            <FeatureButton
              active={activeFeature === "chat"}
              onClick={() => setActiveFeature("chat")}
              icon={<MessageSquare className="mr-2 h-4 w-4" />}
              label="Chat"
            />
            <FeatureButton
              active={activeFeature === "team"}
              onClick={() => setActiveFeature("team")}
              icon={<Users className="mr-2 h-4 w-4" />}
              label="Team"
            />
            <FeatureButton
              active={activeFeature === "analytics"}
              onClick={() => setActiveFeature("analytics")}
              icon={<BarChart3 className="mr-2 h-4 w-4" />}
              label="Analytics"
            />
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <div className="rounded-md bg-primary/10 p-3">
              <h4 className="font-medium text-sm mb-1">Getting Started</h4>
              <p className="text-xs text-muted-foreground mb-2">
                This is an interactive demo. Click on any feature to explore how it works.
              </p>
              <Link href="/auth/signup">
                <Button size="sm" className="w-full gap-1">
                  Sign Up for Free
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Mobile feature selector */}
          <div className="mb-6 lg:hidden">
            <div className="flex overflow-x-auto pb-2 gap-2">
              <FeatureButtonMobile
                active={activeFeature === "dashboard"}
                onClick={() => setActiveFeature("dashboard")}
                icon={<LayoutDashboard className="h-4 w-4" />}
                label="Dashboard"
              />
              <FeatureButtonMobile
                active={activeFeature === "projects"}
                onClick={() => setActiveFeature("projects")}
                icon={<FolderKanban className="h-4 w-4" />}
                label="Projects"
              />
              <FeatureButtonMobile
                active={activeFeature === "tasks"}
                onClick={() => setActiveFeature("tasks")}
                icon={<ListTodo className="h-4 w-4" />}
                label="Tasks"
              />
              <FeatureButtonMobile
                active={activeFeature === "chat"}
                onClick={() => setActiveFeature("chat")}
                icon={<MessageSquare className="h-4 w-4" />}
                label="Chat"
              />
              <FeatureButtonMobile
                active={activeFeature === "team"}
                onClick={() => setActiveFeature("team")}
                icon={<Users className="h-4 w-4" />}
                label="Team"
              />
              <FeatureButtonMobile
                active={activeFeature === "analytics"}
                onClick={() => setActiveFeature("analytics")}
                icon={<BarChart3 className="h-4 w-4" />}
                label="Analytics"
              />
            </div>
          </div>

          {/* Feature content */}
          <div className="h-full">
            {activeFeature === "dashboard" && <DashboardDemo />}
            {activeFeature === "projects" && <ProjectsDemo />}
            {activeFeature === "tasks" && <TasksDemo />}
            {activeFeature === "chat" && <ChatDemo />}
            {activeFeature === "team" && <TeamDemo />}
            {activeFeature === "analytics" && <AnalyticsDemo />}
          </div>
        </div>
      </div>
    </div>
  );
}

interface FeatureButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function FeatureButton({ active, onClick, icon, label }: FeatureButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary hover:bg-primary/15"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function FeatureButtonMobile({ active, onClick, icon, label }: FeatureButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-shrink-0 flex flex-col items-center gap-1 px-4 py-2 rounded-md",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      )}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );
}

function DashboardDemo() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your projects and tasks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
            <div className="text-2xl font-bold">12</div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              <ArrowRight className="mr-1 h-3 w-3" />
              <span>4 active projects</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Tasks</CardTitle>
            <div className="text-2xl font-bold">24/48</div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              <ArrowRight className="mr-1 h-3 w-3" />
              <span>50% completion rate</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Deadlines</CardTitle>
            <div className="text-2xl font-bold">3</div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              <ArrowRight className="mr-1 h-3 w-3" />
              <span>Next: Website Redesign (2 days)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Projects Overview</CardTitle>
              <CardDescription>Status of your active projects</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Website Redesign</div>
                  <Badge>In Progress</Badge>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Mobile App Development</div>
                  <Badge>In Progress</Badge>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Brand Guidelines</div>
                  <Badge variant="outline">Planning</Badge>
                </div>
                <Progress value={20} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Marketing Campaign</div>
                  <Badge variant="secondary">Completed</Badge>
                </div>
                <Progress value={100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your team</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ActivityItem
                avatar="JD"
                avatarColor="bg-blue-500"
                name="John Doe"
                action="completed task"
                target="Homepage Design"
                time="2 hours ago"
              />
              <ActivityItem
                avatar="AS"
                avatarColor="bg-green-500"
                name="Alice Smith"
                action="commented on"
                target="User Authentication Flow"
                time="4 hours ago"
              />
              <ActivityItem
                avatar="RJ"
                avatarColor="bg-purple-500"
                name="Robert Johnson"
                action="created task"
                target="API Integration"
                time="Yesterday"
              />
              <ActivityItem
                avatar="MM"
                avatarColor="bg-amber-500"
                name="Maria Martinez"
                action="updated status of"
                target="Content Strategy"
                time="Yesterday"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Tasks due in the next 7 days</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Check className="mr-1 h-4 w-4" />
              Mark Complete
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Add Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <DemoTask
              title="Finalize Homepage Layout"
              project="Website Redesign"
              status="In Progress"
              priority="High"
              dueDate="Tomorrow"
            />
            <DemoTask
              title="Review Login Flow"
              project="Mobile App Development"
              status="Not Started"
              priority="Medium"
              dueDate="In 2 days"
            />
            <DemoTask
              title="Create Brand Color Palette"
              project="Brand Guidelines"
              status="In Progress"
              priority="Low"
              dueDate="In 3 days"
            />
            <DemoTask
              title="Design Landing Page Mockups"
              project="Website Redesign"
              status="Not Started"
              priority="Medium"
              dueDate="In 5 days"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectsDemo() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Projects</h2>
        <Button>New Project</Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <ProjectCard
              title="Website Redesign"
              description="Redesign the company website with a modern look and improved UX"
              status="In Progress"
              progress={65}
              dueDate="Oct 15, 2023"
              members={4}
            />
            <ProjectCard
              title="Mobile App Development"
              description="Create a new mobile app for both iOS and Android platforms"
              status="Active"
              progress={32}
              dueDate="Dec 1, 2023"
              members={6}
            />
            <ProjectCard
              title="Marketing Campaign"
              description="Launch Q4 marketing campaign for the new product line"
              status="Planning"
              progress={15}
              dueDate="Nov 10, 2023"
              members={3}
            />
            <ProjectCard
              title="Database Migration"
              description="Migrate the existing database to the new cloud infrastructure"
              status="Active"
              progress={48}
              dueDate="Oct 20, 2023"
              members={2}
            />
            <ProjectCard
              title="User Research"
              description="Conduct user research for the upcoming product features"
              status="Completed"
              progress={100}
              dueDate="Completed"
              members={3}
            />
            <ProjectCard
              title="API Integration"
              description="Integrate with third-party payment and analytics APIs"
              status="Planning"
              progress={10}
              dueDate="Nov 5, 2023"
              members={2}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="active">
          <p className="text-muted-foreground">Showing active projects only.</p>
        </TabsContent>
        
        <TabsContent value="completed">
          <p className="text-muted-foreground">Showing completed projects only.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TasksDemo() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <Button>New Task</Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="todo">To Do</TabsTrigger>
          <TabsTrigger value="inprogress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                <DemoTask 
                  title="Design new landing page"
                  project="Website Redesign"
                  status="In Progress"
                  priority="High"
                  dueDate="2 days left"
                />
                <DemoTask 
                  title="Implement user authentication"
                  project="Mobile App"
                  status="To Do"
                  priority="Medium"
                  dueDate="5 days left"
                />
                <DemoTask 
                  title="Fix checkout flow bugs"
                  project="E-commerce Platform"
                  status="Review"
                  priority="High"
                  dueDate="Today"
                />
                <DemoTask 
                  title="Create marketing assets"
                  project="Product Launch"
                  status="Completed"
                  priority="Medium"
                  dueDate="Completed"
                />
                <DemoTask 
                  title="Optimize database queries"
                  project="Backend Infrastructure"
                  status="To Do"
                  priority="Low"
                  dueDate="2 weeks left"
                />
                <DemoTask 
                  title="User feedback survey"
                  project="Product Research"
                  status="In Progress"
                  priority="Medium"
                  dueDate="3 days left"
                />
                <DemoTask 
                  title="Update documentation"
                  project="API Integration"
                  status="Review"
                  priority="Low"
                  dueDate="1 week left"
                />
                <DemoTask 
                  title="Prepare for product demo"
                  project="Product Launch"
                  status="To Do"
                  priority="High"
                  dueDate="4 days left"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="todo">
          <p className="text-muted-foreground">Showing To Do tasks only.</p>
        </TabsContent>
        
        <TabsContent value="inprogress">
          <p className="text-muted-foreground">Showing In Progress tasks only.</p>
        </TabsContent>
        
        <TabsContent value="completed">
          <p className="text-muted-foreground">Showing Completed tasks only.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ChatDemo() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Team Chat</h2>
      </div>

      <div className="flex h-[600px] overflow-hidden rounded-lg border">
        {/* Chat Sidebar */}
        <div className="w-64 border-r">
          <div className="border-b p-3">
            <Input placeholder="Search conversations..." className="h-9" />
          </div>
          <div className="divide-y">
            <ChatChannel 
              name="General"
              lastMessage="Let's discuss the project timeline"
              time="10m"
              unread={3}
              active
            />
            <ChatChannel 
              name="Website Redesign"
              lastMessage="The new mockups look great!"
              time="1h"
              unread={0}
            />
            <ChatChannel 
              name="Mobile App Team"
              lastMessage="When will the API be ready?"
              time="3h"
              unread={0}
            />
            <ChatChannel 
              name="Marketing"
              lastMessage="Campaign assets are ready for review"
              time="1d"
              unread={2}
            />
            <ChatChannel 
              name="Design Team"
              lastMessage="I've pushed the latest designs"
              time="2d"
              unread={0}
            />
          </div>
        </div>
        
        {/* Chat Main Area */}
        <div className="flex flex-1 flex-col">
          <div className="border-b p-4">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">General</h3>
              <Badge variant="outline" className="rounded-full">15 members</Badge>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <ChatMessage 
              name="Alex Thompson"
              avatar="A"
              message="Hey team, how's the progress on the landing page design?"
              time="10:32 AM"
            />
            <ChatMessage 
              name="Morgan Lee"
              avatar="M"
              message="I've finished the wireframes, working on the high-fidelity mockups now."
              time="10:45 AM"
            />
            <ChatMessage 
              name="Jordan Taylor"
              avatar="J"
              message="Looking good! I think we should adjust the hero section a bit to emphasize the key features."
              time="11:03 AM"
            />
            <ChatMessage 
              name="Riley Johnson"
              avatar="R"
              message="Agreed. I also think we need to simplify the navigation. Too many options might confuse users."
              time="11:10 AM"
            />
            <ChatMessage 
              name="Alex Thompson"
              avatar="A"
              message="Good point, Riley. Morgan, can you update the mockups with a streamlined navigation?"
              time="11:15 AM"
            />
            <ChatMessage 
              name="Morgan Lee"
              avatar="M"
              message="Sure thing! I'll have that ready by end of day."
              time="11:17 AM"
            />
          </div>
          
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <Input placeholder="Type your message..." className="flex-1" />
              <Button>Send</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamDemo() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Team Management</h2>
        <Button>Invite Team Member</Button>
      </div>

      <Tabs defaultValue="members">
        <TabsList className="mb-4">
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                <TeamMember
                  name="Alex Thompson"
                  avatar="A" 
                  role="Product Manager"
                  email="alex@example.com"
                  joined="1 year ago"
                  status="active"
                />
                <TeamMember
                  name="Morgan Lee"
                  avatar="M" 
                  role="Lead Designer"
                  email="morgan@example.com"
                  joined="8 months ago"
                  status="active"
                />
                <TeamMember
                  name="Jordan Taylor"
                  avatar="J" 
                  role="Frontend Developer"
                  email="jordan@example.com"
                  joined="1 year ago"
                  status="active"
                />
                <TeamMember
                  name="Riley Johnson"
                  avatar="R" 
                  role="Backend Developer"
                  email="riley@example.com"
                  joined="6 months ago"
                  status="active"
                />
                <TeamMember
                  name="Casey Smith"
                  avatar="C" 
                  role="QA Engineer"
                  email="casey@example.com"
                  joined="3 months ago"
                  status="inactive"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invitations">
          <Card>
            <CardContent className="p-4">
              <p className="text-muted-foreground">No pending invitations.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AnalyticsDemo() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Analytics</h2>
        <Button>Export Report</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
            <CardDescription>
              Track completion status across all active projects
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <div className="h-[300px]">
              {/* Project Progress Chart */}
              <div className="h-full w-full flex items-end gap-4 px-6">
                <div className="flex flex-col items-center justify-end h-full flex-1">
                  <div className="w-full bg-blue-100 rounded-t-md relative" style={{ height: '65%' }}>
                    <div className="absolute inset-0 bg-blue-500 rounded-t-md" style={{ height: '70%' }}></div>
                  </div>
                  <span className="mt-2 text-xs text-muted-foreground">Website Redesign</span>
                  <span className="text-xs font-medium">70%</span>
                </div>
                <div className="flex flex-col items-center justify-end h-full flex-1">
                  <div className="w-full bg-blue-100 rounded-t-md relative" style={{ height: '32%' }}>
                    <div className="absolute inset-0 bg-blue-500 rounded-t-md" style={{ height: '45%' }}></div>
                  </div>
                  <span className="mt-2 text-xs text-muted-foreground">Mobile App</span>
                  <span className="text-xs font-medium">45%</span>
                </div>
                <div className="flex flex-col items-center justify-end h-full flex-1">
                  <div className="w-full bg-blue-100 rounded-t-md relative" style={{ height: '85%' }}>
                    <div className="absolute inset-0 bg-blue-500 rounded-t-md" style={{ height: '90%' }}></div>
                  </div>
                  <span className="mt-2 text-xs text-muted-foreground">API Development</span>
                  <span className="text-xs font-medium">90%</span>
                </div>
                <div className="flex flex-col items-center justify-end h-full flex-1">
                  <div className="w-full bg-blue-100 rounded-t-md relative" style={{ height: '15%' }}>
                    <div className="absolute inset-0 bg-blue-500 rounded-t-md" style={{ height: '25%' }}></div>
                  </div>
                  <span className="mt-2 text-xs text-muted-foreground">Marketing Campaign</span>
                  <span className="text-xs font-medium">25%</span>
                </div>
                <div className="flex flex-col items-center justify-end h-full flex-1">
                  <div className="w-full bg-blue-100 rounded-t-md relative" style={{ height: '45%' }}>
                    <div className="absolute inset-0 bg-blue-500 rounded-t-md" style={{ height: '60%' }}></div>
                  </div>
                  <span className="mt-2 text-xs text-muted-foreground">E-commerce</span>
                  <span className="text-xs font-medium">60%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Completion</CardTitle>
            <CardDescription>Monthly task completion rate</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <div className="h-[300px] w-full">
              {/* Task Completion Line Chart */}
              <div className="h-full w-full relative">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-6">
                  <span className="text-xs text-muted-foreground">100</span>
                  <span className="text-xs text-muted-foreground">75</span>
                  <span className="text-xs text-muted-foreground">50</span>
                  <span className="text-xs text-muted-foreground">25</span>
                  <span className="text-xs text-muted-foreground">0</span>
                </div>
                
                {/* Chart area */}
                <div className="ml-8 h-full flex items-end">
                  <svg className="w-full h-[90%] mt-3" viewBox="0 0 600 300" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="0" x2="600" y2="0" stroke="hsl(var(--muted))" strokeWidth="1" />
                    <line x1="0" y1="75" x2="600" y2="75" stroke="hsl(var(--muted))" strokeWidth="1" />
                    <line x1="0" y1="150" x2="600" y2="150" stroke="hsl(var(--muted))" strokeWidth="1" />
                    <line x1="0" y1="225" x2="600" y2="225" stroke="hsl(var(--muted))" strokeWidth="1" />
                    <line x1="0" y1="300" x2="600" y2="300" stroke="hsl(var(--muted))" strokeWidth="1" />

                    {/* Line chart */}
                    <path 
                      d="M0,220 L100,180 L200,150 L300,120 L400,80 L500,50 L600,30" 
                      fill="none" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth="3"
                    />
                    
                    {/* Area under the line */}
                    <path 
                      d="M0,220 L100,180 L200,150 L300,120 L400,80 L500,50 L600,30 L600,300 L0,300 Z" 
                      fill="hsl(var(--primary)/0.1)" 
                    />
                    
                    {/* Data points */}
                    <circle cx="0" cy="220" r="4" fill="hsl(var(--primary))" />
                    <circle cx="100" cy="180" r="4" fill="hsl(var(--primary))" />
                    <circle cx="200" cy="150" r="4" fill="hsl(var(--primary))" />
                    <circle cx="300" cy="120" r="4" fill="hsl(var(--primary))" />
                    <circle cx="400" cy="80" r="4" fill="hsl(var(--primary))" />
                    <circle cx="500" cy="50" r="4" fill="hsl(var(--primary))" />
                    <circle cx="600" cy="30" r="4" fill="hsl(var(--primary))" />
                  </svg>
                </div>
                
                {/* X-axis labels */}
                <div className="ml-8 flex justify-between mt-2">
                  <span className="text-xs text-muted-foreground">Jan</span>
                  <span className="text-xs text-muted-foreground">Feb</span>
                  <span className="text-xs text-muted-foreground">Mar</span>
                  <span className="text-xs text-muted-foreground">Apr</span>
                  <span className="text-xs text-muted-foreground">May</span>
                  <span className="text-xs text-muted-foreground">Jun</span>
                  <span className="text-xs text-muted-foreground">Jul</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Team Productivity</CardTitle>
            <CardDescription>
              Task completion by team member
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/img/avatars/avatar-1.png" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">Jane Doe</span>
                  </div>
                  <span className="text-sm text-muted-foreground">23 tasks</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/img/avatars/avatar-2.png" />
                      <AvatarFallback>MW</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">Mike Wilson</span>
                  </div>
                  <span className="text-sm text-muted-foreground">18 tasks</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: '70%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/img/avatars/avatar-3.png" />
                      <AvatarFallback>AL</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">Alex Lee</span>
                  </div>
                    <span className="text-sm text-muted-foreground">15 tasks</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: '60%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/img/avatars/avatar-4.png" />
                      <AvatarFallback>SL</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">Sarah Lin</span>
                  </div>
                  <span className="text-sm text-muted-foreground">12 tasks</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: '50%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper Components

interface DemoTaskProps {
  title: string;
  project: string;
  status: string;
  priority: string;
  dueDate: string;
}

function DemoTask({ title, project, status, priority, dueDate }: DemoTaskProps) {
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

  return (
    <div className="group flex items-center p-4 transition-colors hover:bg-muted/50">
      <div className="flex-1 space-y-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <div className="font-medium text-primary">{title}</div>
          <span className="text-xs text-muted-foreground">
            in {project}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge 
            variant="secondary" 
            className={getStatusColor(status)}
          >
            {status}
          </Badge>
          <Badge 
            variant="secondary" 
            className={getPriorityColor(priority)}
          >
            {priority} Priority
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{dueDate}</span>
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="ml-auto h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface ActivityItemProps {
  avatar: string;
  avatarColor: string;
  name: string;
  action: string;
  target: string;
  time: string;
}

function ActivityItem({ avatar, avatarColor, name, action, target, time }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-4 p-4">
      <div className="relative">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${avatarColor} text-foreground`}>
          {avatar}
        </div>
      </div>
      <div className="flex-1">
        <p>
          <span className="font-medium">{name}</span> {action} <span className="font-medium text-primary">{target}</span>
        </p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}

interface ProjectCardProps {
  title: string;
  description: string;
  status: string;
  progress: number;
  dueDate: string;
  members: number;
}

function ProjectCard({ title, description, status, progress, dueDate, members }: ProjectCardProps) {
  return (
    <Card interactive className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-4">
          <CardTitle>{title}</CardTitle>
          <Badge variant={status === "Completed" ? "secondary" : status === "In Progress" ? "default" : "outline"}>
            {status}
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Due {dueDate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{members} members</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ChatChannelProps {
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  active?: boolean;
}

function ChatChannel({ name, lastMessage, time, unread, active }: ChatChannelProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-foreground hover:bg-muted/60 hover:text-foreground cursor-pointer"
      )}
    >
      <Avatar className="h-9 w-9">
        <AvatarFallback>{name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 truncate">
        <div className="flex items-center justify-between">
          <span className="font-medium truncate">{name}</span>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground truncate">{lastMessage}</span>
          {unread > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {unread}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface ChatMessageProps {
  name: string;
  avatar: string;
  message: string;
  time: string;
}

function ChatMessage({ name, avatar, message, time }: ChatMessageProps) {
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8">
        <AvatarFallback>{avatar}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-medium">{name}</span>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
        <p className="mt-1">{message}</p>
      </div>
    </div>
  );
}

interface TeamMemberProps {
  name: string;
  avatar: string;
  role: string;
  email: string;
  joined: string;
  status: 'active' | 'inactive';
}

function TeamMember({ name, avatar, role, email, joined, status }: TeamMemberProps) {
  return (
    <Card interactive className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{name}</h4>
              <Badge variant={status === 'active' ? "default" : "secondary"}>{status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{email}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Joined:</span>
            <span>{joined}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 border-t bg-muted/40 px-6 py-3">
        <Button variant="ghost" size="sm">Message</Button>
        <Button variant="outline" size="sm">View Profile</Button>
      </div>
    </Card>
  );
} 