import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Star, BarChart2, Users, Zap, TrendingUp, FolderKanban, ListTodo, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  BarChart3,
  CheckCircle,
  LucideIcon,
  MessageSquare,
  Stars,
} from "lucide-react";

// Don't use client-side only features in server components
// Remove motion imports and use CSS animations instead
const HomePage = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">
              <span className="text-primary">PM</span> Dashboard
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/demo" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/demo" className="text-muted-foreground hover:text-foreground transition-colors">
              Use Cases
            </Link>
            <Link href="/demo" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/demo" className="text-muted-foreground hover:text-foreground transition-colors">
              Resources
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/auth/login"
                className="text-sm font-medium hover:text-primary"
              >
                Sign In
              </Link>
              <Button asChild>
                <Link href="/auth/register">
                  Get Started Free
                </Link>
              </Button>
            </div>
            <Button variant="outline" size="icon" className="md:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden py-16 pt-12 md:py-28">
          <div className="absolute inset-0 -top-16 bg-gradient-to-b from-muted/50 to-background"></div>
          <div className="absolute inset-0 -top-16 bg-grid-black/[0.02] bg-[length:20px_20px]"></div>
          <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="grid gap-12 md:grid-cols-2 md:gap-8">
              <div className="flex flex-col justify-center space-y-6 md:space-y-8">
                <div className="animate-fade-in space-y-6">
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                    Manage projects with ease
                  </h1>
                  <p className="max-w-[600px] text-xl text-muted-foreground sm:text-2xl">
                    Streamline your workflow, collaborate seamlessly, and
                    deliver projects on time, every time.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link href="/auth/signup">
                      <Button size="lg" className="w-full sm:w-auto">
                        Get Started Free
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/demo">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto"
                      >
                        View Demo
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="relative mx-auto md:ml-auto md:mr-0 animate-fade-in-delay">
                <div className="relative z-10 rounded-xl border bg-background p-2 shadow-xl">
                  <div className="overflow-hidden rounded-lg">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-10"></div>
                      <div className="rounded-lg overflow-hidden">
                        <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2">
                          <div className="flex gap-1.5">
                            <div className="h-3 w-3 rounded-full bg-red-500"></div>
                            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                            <div className="h-3 w-3 rounded-full bg-green-500"></div>
                          </div>
                        </div>
                        <div className="bg-muted/10">
                          <div className="p-4 grid gap-4">
                            <div className="grid grid-cols-4 gap-3">
                              <div className="bg-card border rounded-lg p-3 overflow-hidden">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-xs font-medium text-muted-foreground">Projects</span>
                                  <span className="rounded-full bg-blue-100 p-1"><FolderKanban className="h-3 w-3 text-blue-500" /></span>
                                </div>
                                <p className="text-xl font-bold">12</p>
                              </div>
                              <div className="bg-card border rounded-lg p-3 overflow-hidden">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-xs font-medium text-muted-foreground">Tasks</span>
                                  <span className="rounded-full bg-violet-100 p-1"><ListTodo className="h-3 w-3 text-violet-500" /></span>
                                </div>
                                <p className="text-xl font-bold">64</p>
                              </div>
                              <div className="bg-card border rounded-lg p-3 overflow-hidden">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-xs font-medium text-muted-foreground">To Do</span>
                                  <span className="rounded-full bg-amber-100 p-1"><Clock className="h-3 w-3 text-amber-500" /></span>
                                </div>
                                <p className="text-xl font-bold">18</p>
                              </div>
                              <div className="bg-card border rounded-lg p-3 overflow-hidden">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-xs font-medium text-muted-foreground">Done</span>
                                  <span className="rounded-full bg-green-100 p-1"><CheckCircle className="h-3 w-3 text-green-500" /></span>
                                </div>
                                <p className="text-xl font-bold">46</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-3">
                              <div className="col-span-3 bg-card border rounded-lg p-4">
                                <h3 className="font-medium text-sm mb-3">Recent Tasks</h3>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center py-1 border-b">
                                    <span className="text-xs">Design new landing page</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">In Progress</span>
                                  </div>
                                  <div className="flex justify-between items-center py-1 border-b">
                                    <span className="text-xs">Implement user authentication</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">To Do</span>
                                  </div>
                                  <div className="flex justify-between items-center py-1 border-b">
                                    <span className="text-xs">Fix checkout flow bugs</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Review</span>
                                  </div>
                                  <div className="flex justify-between items-center py-1">
                                    <span className="text-xs">Create marketing assets</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Completed</span>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-card border rounded-lg p-4">
                                <h3 className="font-medium text-sm mb-3">Activity</h3>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">AT</div>
                                    <span className="text-[10px] text-muted-foreground">Alex created a task</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center text-[10px]">ML</div>
                                    <span className="text-[10px] text-muted-foreground">Morgan completed a task</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-card border rounded-lg p-4">
                                <h3 className="font-medium text-sm mb-3">Project Progress</h3>
                                <div className="h-[100px] flex items-end justify-between px-2">
                                  <div className="w-[15%] bg-primary/20 rounded-t-sm" style={{ height: '60%' }}>
                                    <div className="w-full bg-primary rounded-t-sm" style={{ height: '70%' }}></div>
                                  </div>
                                  <div className="w-[15%] bg-primary/20 rounded-t-sm" style={{ height: '80%' }}>
                                    <div className="w-full bg-primary rounded-t-sm" style={{ height: '40%' }}></div>
                                  </div>
                                  <div className="w-[15%] bg-primary/20 rounded-t-sm" style={{ height: '50%' }}>
                                    <div className="w-full bg-primary rounded-t-sm" style={{ height: '65%' }}></div>
                                  </div>
                                  <div className="w-[15%] bg-primary/20 rounded-t-sm" style={{ height: '90%' }}>
                                    <div className="w-full bg-primary rounded-t-sm" style={{ height: '30%' }}></div>
                                  </div>
                                  <div className="w-[15%] bg-primary/20 rounded-t-sm" style={{ height: '40%' }}>
                                    <div className="w-full bg-primary rounded-t-sm" style={{ height: '85%' }}></div>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-card border rounded-lg p-4">
                                <h3 className="font-medium text-sm mb-3">Task Completion</h3>
                                <div className="h-[100px] relative">
                                  <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                                    <path 
                                      d="M0,80 L50,65 L100,50 L150,60 L200,30 L250,20 L300,5" 
                                      fill="none" 
                                      stroke="hsl(var(--primary))" 
                                      strokeWidth="2"
                                    />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-12 -top-12 z-0 h-28 w-28 rounded-full bg-primary/20 blur-xl"></div>
                <div className="absolute -bottom-8 left-16 z-0 h-24 w-24 rounded-full bg-pink-500/20 blur-xl"></div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
                Everything you need to manage projects efficiently
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Our platform combines powerful features with an intuitive interface to make project management a breeze.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Project Management",
                  description:
                    "Create and manage projects with customizable fields, timelines, and budgets.",
                  icon: <BarChart2 className="h-6 w-6 text-primary" />,
                },
                {
                  title: "Task Tracking",
                  description:
                    "Assign tasks, set deadlines, and track progress with a visual Kanban board.",
                  icon: <CheckCircle2 className="h-6 w-6 text-primary" />,
                },
                {
                  title: "Team Collaboration",
                  description:
                    "Real-time updates, comments, and file sharing for seamless teamwork.",
                  icon: <Users className="h-6 w-6 text-primary" />,
                },
                {
                  title: "Real-time Chat",
                  description:
                    "Direct and group messaging to keep communication streamlined and organized.",
                  icon: <Zap className="h-6 w-6 text-primary" />,
                },
                {
                  title: "Performance Insights",
                  description:
                    "Detailed analytics and reports to identify bottlenecks and improve processes.",
                  icon: <TrendingUp className="h-6 w-6 text-primary" />,
                },
                {
                  title: "Role-based Permissions",
                  description:
                    "Granular control over who can view and edit projects, tasks, and settings.",
                  icon: <Star className="h-6 w-6 text-primary" />,
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-lg border bg-card p-6 hover:shadow-md transition-shadow"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    {feature.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-medium text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                  
                  {/* Subtle hover animation background */}
                  <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y bg-muted/30 py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
                Trusted by teams worldwide
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                See what our customers have to say about their experience with our platform.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  quote: "PM Dashboard has completely transformed how our team manages projects. The interface is intuitive and the features are powerful.",
                  author: "Sarah Johnson",
                  role: "Product Manager, TechCorp",
                  rating: 5,
                },
                {
                  quote: "We've tried many project management tools, but nothing comes close to the efficiency and ease of use that PM Dashboard provides.",
                  author: "Michael Chen",
                  role: "CTO, StartupX",
                  rating: 5,
                },
                {
                  quote: "The real-time collaboration features have improved our team communication significantly. It's now our central hub for all projects.",
                  author: "Emily Rodriguez",
                  role: "Team Lead, DesignStudio",
                  rating: 5,
                },
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className="flex flex-col rounded-lg border bg-card p-6 shadow-sm"
                >
                  <div className="mb-4 flex">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="mb-4 flex-1 text-foreground">{testimonial.quote}</p>
                  <div>
                    <div className="font-medium">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16">
              {/* Company logos would go here - using placeholder text for now */}
              {["Company 1", "Company 2", "Company 3", "Company 4", "Company 5"].map((company, index) => (
                <div key={index} className="text-xl font-bold text-muted-foreground/50">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl rounded-2xl border bg-card p-8 shadow-lg md:p-12">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="flex flex-col justify-center">
                  <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                    Ready to transform your project management?
                  </h2>
                  <p className="mb-6 text-lg text-muted-foreground">
                    Join thousands of teams who have already improved their workflow with PM Dashboard.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link href="/auth/signup" className="w-full sm:w-auto">
                      <Button size="lg" className="w-full sm:w-auto">
                        Start for free
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/demo" className="w-full sm:w-auto">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto">
                        View Demo
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-full max-w-md overflow-hidden rounded-lg border">
                    <div className="bg-muted/10">
                      <div className="border-b bg-muted/50 px-4 py-2">
                        <h3 className="text-sm font-medium">Projects Dashboard</h3>
                      </div>
                      <div className="p-4 grid gap-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-card border rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-xs font-medium">Website Redesign</h4>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">In Progress</span>
                            </div>
                            <div className="space-y-2">
                              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="bg-primary h-full" style={{ width: '65%' }}></div>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>65% complete</span>
                                <span>4 members</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-card border rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-xs font-medium">Mobile App</h4>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Active</span>
                            </div>
                            <div className="space-y-2">
                              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="bg-primary h-full" style={{ width: '32%' }}></div>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>32% complete</span>
                                <span>6 members</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-card border rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-xs font-medium">Marketing Campaign</h4>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Planning</span>
                            </div>
                            <div className="space-y-2">
                              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="bg-primary h-full" style={{ width: '15%' }}></div>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>15% complete</span>
                                <span>3 members</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-card border rounded-lg p-3">
                            <h3 className="text-xs font-medium mb-2">Project Status</h3>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col justify-center items-center p-2 bg-muted/50 rounded border">
                                <span className="text-sm font-bold">3</span>
                                <span className="text-[10px] text-muted-foreground">Active</span>
                              </div>
                              <div className="flex flex-col justify-center items-center p-2 bg-muted/50 rounded border">
                                <span className="text-sm font-bold">1</span>
                                <span className="text-[10px] text-muted-foreground">Completed</span>
                              </div>
                              <div className="flex flex-col justify-center items-center p-2 bg-muted/50 rounded border">
                                <span className="text-sm font-bold">2</span>
                                <span className="text-[10px] text-muted-foreground">Planning</span>
                              </div>
                              <div className="flex flex-col justify-center items-center p-2 bg-muted/50 rounded border">
                                <span className="text-sm font-bold">6</span>
                                <span className="text-[10px] text-muted-foreground">Total</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-card border rounded-lg p-3">
                            <h3 className="text-xs font-medium mb-2">Timeline</h3>
                            <div className="flex items-end justify-between h-[80px]">
                              <div className="h-full w-[15%] flex flex-col gap-1 justify-end">
                                <div className="w-full bg-blue-500 rounded-t" style={{ height: '60%' }}></div>
                                <span className="text-[8px] text-muted-foreground">Q1</span>
                              </div>
                              <div className="h-full w-[15%] flex flex-col gap-1 justify-end">
                                <div className="w-full bg-blue-500 rounded-t" style={{ height: '45%' }}></div>
                                <span className="text-[8px] text-muted-foreground">Q2</span>
                              </div>
                              <div className="h-full w-[15%] flex flex-col gap-1 justify-end">
                                <div className="w-full bg-blue-500 rounded-t" style={{ height: '80%' }}></div>
                                <span className="text-[8px] text-muted-foreground">Q3</span>
                              </div>
                              <div className="h-full w-[15%] flex flex-col gap-1 justify-end">
                                <div className="w-full bg-blue-500 rounded-t" style={{ height: '70%' }}></div>
                                <span className="text-[8px] text-muted-foreground">Q4</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="text-xl font-bold mb-4">
                <span className="text-primary">PM</span> Dashboard
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                The all-in-one project management solution for modern teams.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Features</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Use Cases</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Blog</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Documentation</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Guides</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Help Center</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">About Us</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Careers</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Contact</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} PM Dashboard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
