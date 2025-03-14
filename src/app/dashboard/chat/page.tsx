"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase";
import {
  MessageSquare,
  Users,
  Search,
  Loader2,
  AlertCircle,
  UserPlus,
  Plus
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ChatRoom {
  id: string;
  name: string | null;
  is_group: boolean;
  created_at: string;
  last_message?: {
    content: string;
    created_at: string;
    sender_name: string | null;
  } | null;
  members: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  }[];
  unread_count: number;
}

interface ChatRoomMember {
  user_id: string;
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface MessageData {
  content: string;
  created_at: string;
  sender: {
    full_name: string | null;
  };
}

interface ChatRoomData {
  chat_room: {
    id: string;
    name: string | null;
    is_group: boolean;
    created_at: string;
  };
}

export default function ChatPage() {
  const router = useRouter();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<"all" | "direct" | "groups">("all");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchChatRooms = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const supabase = createClient();
        
        // Get current user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error("User auth error:", userError);
          throw new Error("Authentication error: " + (userError.message || "Could not authenticate user"));
        }
        
        if (!userData.user) {
          throw new Error("Not authenticated");
        }
        
        setCurrentUserId(userData.user.id);

        // Check if user belongs to a company
        const { data: companyData, error: companyError } = await supabase
          .from('company_members')
          .select('company_id')
          .eq('user_id', userData.user.id)
          .single();

        if (companyError && companyError.code !== 'PGRST116') {
          console.error("Company fetch error:", companyError);
          throw new Error("Error fetching company information");
        }

        if (!companyData?.company_id) {
          setChatRooms([]);
          setError("Please join or create a company to use the chat feature.");
          setIsLoading(false);
          return;
        }
        
        // Get chat rooms the user is a member of
        const { data: roomData, error: roomError } = await supabase
          .from('chat_room_members')
          .select(`
            chat_room:chat_rooms (
              id,
              name,
              is_group,
              created_at
            )
          `)
          .eq('user_id', userData.user.id);
        
        if (roomError) {
          console.error("Room fetch error:", roomError);
          
          // Handle the specific infinite recursion error
          if (roomError.message && roomError.message.includes('infinite recursion')) {
            throw new Error(
              "Database security policy issue detected. Please run the 'chat-rooms-rls-fix.sql' script in your Supabase SQL Editor to fix this issue. " +
              "This script will update the RLS policies for chat rooms and members to prevent recursion."
            );
          }
          
          throw new Error("Error fetching chat rooms: " + (roomError.message || roomError.details || "Unknown error"));
        }
        
        if (!roomData || roomData.length === 0) {
          setChatRooms([]);
          setIsLoading(false);
          return;
        }
        
        // First convert to unknown to safely handle the type conversion
        const roomDataUnknown = roomData as unknown;
        const typedRoomData = roomDataUnknown as ChatRoomData[];
        
        const roomIds = typedRoomData
          .map(item => item.chat_room?.id)
          .filter(Boolean) as string[];

        if (roomIds.length === 0) {
          setChatRooms([]);
          setIsLoading(false);
          return;
        }
        
        // Process each chat room
        const roomsWithDetails = await Promise.all(
          roomIds.map(async (roomId) => {
            // Get the room details
            const { data: roomDetails, error: detailsError } = await supabase
              .from('chat_rooms')
              .select('id, name, is_group, created_at')
              .eq('id', roomId)
              .single();
            
            if (detailsError) return null;
            
            // Get the room members with profiles
            const { data: members, error: membersError } = await supabase
              .from('chat_room_members')
              .select(`
                user_id,
                profiles:profiles (
                  id,
                  full_name,
                  avatar_url
                )
              `)
              .eq('chat_room_id', roomId);
            
            if (membersError) return null;
            
            // Format members data
            // First convert to unknown to safely handle the type conversion
            const membersUnknown = members as unknown;
            const typedMembers = membersUnknown as ChatRoomMember[];
            const formattedMembers = typedMembers
              .filter(m => m.profiles) // Filter out null profiles
              .map(m => ({
                id: m.profiles.id,
                full_name: m.profiles.full_name,
                avatar_url: m.profiles.avatar_url
              }));
            
            // Get the last message in the room
            const { data: lastMessageData, error: messageError } = await supabase
              .from('messages')
              .select(`
                content,
                created_at,
                sender:profiles (
                  full_name
                )
              `)
              .eq('chat_room_id', roomId)
              .order('created_at', { ascending: false })
              .limit(1);
            
            let lastMessage = null;
            
            if (!messageError && lastMessageData && lastMessageData.length > 0) {
              // First convert to unknown to safely handle the type conversion
              const messageDataUnknown = lastMessageData as unknown;
              const typedMessageData = messageDataUnknown as MessageData[];
              lastMessage = {
                content: typedMessageData[0].content,
                created_at: typedMessageData[0].created_at,
                sender_name: typedMessageData[0].sender?.full_name
              };
            }
            
            // Get unread message count
            const { count, error: countError } = await supabase
              .from('messages')
              .select('id', { count: 'exact', head: true })
              .eq('chat_room_id', roomId)
              .eq('read', false)
              .neq('sender_id', userData.user.id);
            
            const unreadCount = countError ? 0 : (count || 0);
            
            return {
              id: roomDetails.id,
              name: roomDetails.name,
              is_group: roomDetails.is_group,
              created_at: roomDetails.created_at,
              members: formattedMembers,
              last_message: lastMessage,
              unread_count: unreadCount
            };
          })
        );
        
        // Filter out null values (rooms that had errors) and sort by last message or creation date
        const validRooms = roomsWithDetails
          .filter(Boolean) as ChatRoom[];
        
        // Sort by most recent message or creation date if no messages
        validRooms.sort((a, b) => {
          const aDate = a.last_message?.created_at || a.created_at;
          const bDate = b.last_message?.created_at || b.created_at;
          return new Date(bDate).getTime() - new Date(aDate).getTime();
        });
        
        setChatRooms(validRooms);
      } catch (err) {
        console.error("Error fetching chat rooms:", err);
        setError(err instanceof Error ? err.message : "Failed to load chat rooms");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChatRooms();
  }, []);
  
  // Filter chat rooms based on current tab and search query
  const filteredRooms = chatRooms.filter(room => {
    // Apply tab filter
    if (currentTab === "direct" && room.is_group) return false;
    if (currentTab === "groups" && !room.is_group) return false;
    
    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      
      // Search in room name
      if (room.name && room.name.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // For DMs, search in other member's name
      if (!room.is_group) {
        const otherMembers = room.members.filter(m => m.id !== currentUserId);
        return otherMembers.some(m => 
          m.full_name?.toLowerCase().includes(searchLower)
        );
      }
      
      // Search in all member names for group chats
      return room.members.some(m => 
        m.full_name?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  // Helper functions
  const getInitials = (name: string | null): string => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  const getChatName = (room: ChatRoom): string => {
    if (room.name) return room.name;
    
    if (!room.is_group) {
      // For DMs, use other person's name
      const otherMembers = room.members.filter(m => m.id !== currentUserId);
      const otherMember = otherMembers[0];
      return otherMember?.full_name || "Unknown User";
    }
    
    // Fallback for group chats without names
    return `Group (${room.members.length} members)`;
  };
  
  const getFormattedTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      // Today, show time
      return format(date, "h:mm a");
    } else if (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate() - 1
    ) {
      // Yesterday
      return "Yesterday";
    } else if (
      date.getFullYear() === now.getFullYear() &&
      now.getTime() - date.getTime() < 6 * 24 * 60 * 60 * 1000
    ) {
      // Within the last week
      return format(date, "EEEE"); // Day name
    } else {
      // Older
      return format(date, "MM/dd/yyyy");
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-9rem)] items-center justify-center border rounded-lg">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex h-[calc(100vh-9rem)] items-center justify-center border rounded-lg">
        <div className="max-w-md rounded-md bg-destructive/10 p-6 text-destructive">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium">Error loading conversations</h3>
              <p className="text-sm">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] border rounded-lg overflow-hidden bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Messages</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Chat
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push('/dashboard/chat/new/direct')}>
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Direct Message</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard/chat/new/group')}>
                <Users className="mr-2 h-4 w-4" />
                <span>Group Chat</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mt-4 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search messages..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs 
          value={currentTab} 
          onValueChange={(value) => setCurrentTab(value as "all" | "direct" | "groups")}
          className="mt-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="direct">Direct</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Conversation list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center h-72">
              {chatRooms.length === 0 ? (
                <>
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Conversations Yet</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md">
                    Start a new conversation with your team members to collaborate more effectively.
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => router.push('/dashboard/chat/new/direct')}
                      variant="outline"
                      className="flex items-center"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Message a Team Member
                    </Button>
                    <Button 
                      onClick={() => router.push('/dashboard/chat/new/group')}
                      className="flex items-center"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Create a Group
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Matching Conversations</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    No conversations match your current filters. Try adjusting your search or tab selection.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentTab("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </>
              )}
            </div>
          ) : (
            filteredRooms.map(room => (
              <button
                key={room.id}
                className="flex items-start gap-3 w-full text-left rounded-md p-3 transition-colors hover:bg-accent"
                onClick={() => router.push(`/dashboard/chat/${room.id}`)}
              >
                {room.is_group ? (
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-background bg-muted">
                      <AvatarFallback>
                        <Users className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    {room.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                        {room.unread_count > 9 ? '9+' : room.unread_count}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    {/* For DMs, show the other person's avatar */}
                    {(() => {
                      const otherMembers = room.members.filter(m => m.id !== currentUserId);
                      const otherMember = otherMembers[0];
                      return (
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={otherMember?.avatar_url || undefined} />
                          <AvatarFallback>{getInitials(otherMember?.full_name)}</AvatarFallback>
                        </Avatar>
                      );
                    })()}
                    {room.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                        {room.unread_count > 9 ? '9+' : room.unread_count}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">{getChatName(room)}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {room.last_message 
                        ? getFormattedTime(room.last_message.created_at)
                        : getFormattedTime(room.created_at)}
                    </span>
                  </div>
                  {room.last_message ? (
                    <p className={`text-sm truncate ${room.unread_count > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                      {room.is_group && room.last_message.sender_name && (
                        <span className="font-medium">{room.last_message.sender_name}: </span>
                      )}
                      {room.last_message.content}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground truncate italic">
                      No messages yet
                    </p>
                  )}
                  {room.is_group && (
                    <div className="flex -space-x-2 mt-1 overflow-hidden">
                      {room.members.slice(0, 3).map(member => (
                        <Avatar key={member.id} className="h-5 w-5 border border-background">
                          <AvatarImage src={member.avatar_url || undefined} />
                          <AvatarFallback className="text-[8px]">{getInitials(member.full_name)}</AvatarFallback>
                        </Avatar>
                      ))}
                      {room.members.length > 3 && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full border border-background bg-muted text-[8px]">
                          +{room.members.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 