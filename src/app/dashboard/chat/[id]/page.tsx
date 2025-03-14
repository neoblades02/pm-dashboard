"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { 
  Send, 
  MoreVertical, 
  Loader2, 
  Users, 
  AlertCircle, 
  ArrowLeft,
  User 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Types for chat functionality
interface ChatRoom {
  id: string;
  name: string | null;
  is_group: boolean;
  company_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  members?: ChatMember[];
}

interface ChatMember {
  id: string;
  user_id: string;
  chat_room_id: string;
  last_read_at: string | null;
  profile?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email: string;
  };
}

interface Message {
  id: string;
  chat_room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email: string;
  };
}

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Fetch chat room data and messages
  useEffect(() => {
    const fetchChatData = async () => {
      if (!chatId) return;
      
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
        
        setCurrentUserId(userData.user.id);
        
        // Get chat room details
        const { data: roomData, error: roomError } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('id', chatId)
          .single();
        
        if (roomError) throw roomError;
        
        setChatRoom(roomData as ChatRoom);
        
        // Get chat room members with profiles
        const { data: membersData, error: membersError } = await supabase
          .from('chat_room_members')
          .select(`
            id,
            user_id,
            chat_room_id,
            last_read_at,
            profiles (
              id,
              full_name,
              avatar_url,
              email
            )
          `)
          .eq('chat_room_id', chatId);
        
        if (membersError) throw membersError;
        
        // Format members data with profiles
        const formattedMembers = membersData.map((member: Record<string, unknown>) => ({
          id: member.id as string,
          user_id: member.user_id as string,
          chat_room_id: member.chat_room_id as string,
          last_read_at: member.last_read_at as string | null,
          profile: member.profiles as Record<string, unknown>
        }));
        
        setMembers(formattedMembers as ChatMember[]);
        
        // If it's a direct message (not a group), set the chat name to the other user's name
        if (!roomData.is_group) {
          const otherMember = formattedMembers.find(m => m.user_id !== userData.user.id);
          if (otherMember && otherMember.profile) {
            roomData.name = otherMember.profile.full_name || otherMember.profile.email;
          }
        }
        
        // Get messages with sender profiles
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select(`
            id,
            chat_room_id,
            sender_id,
            content,
            created_at,
            updated_at,
            profiles (
              id,
              full_name,
              avatar_url,
              email
            )
          `)
          .eq('chat_room_id', chatId)
          .order('created_at', { ascending: true });
        
        if (messagesError) throw messagesError;
        
        // Format messages with sender profiles
        const formattedMessages = messagesData.map((message: Record<string, unknown>) => ({
          id: message.id as string,
          chat_room_id: message.chat_room_id as string,
          sender_id: message.sender_id as string,
          content: message.content as string,
          created_at: message.created_at as string,
          updated_at: message.updated_at as string,
          sender: message.profiles as Record<string, unknown>
        }));
        
        setMessages(formattedMessages as Message[]);
        
        // Update last read timestamp
        await supabase
          .from('chat_room_members')
          .update({ last_read_at: new Date().toISOString() })
          .eq('chat_room_id', chatId)
          .eq('user_id', userData.user.id);
        
        // Set up real-time subscription for new messages
        const subscription = supabase
          .channel(`room-${chatId}`)
          .on('postgres_changes', 
            { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'messages',
              filter: `chat_room_id=eq.${chatId}`
            }, 
            async (payload) => {
              // Fetch the complete message with sender profile
              const { data: newMsg, error: newMsgError } = await supabase
                .from('messages')
                .select(`
                  id,
                  chat_room_id,
                  sender_id,
                  content,
                  created_at,
                  updated_at,
                  profiles (
                    id,
                    full_name,
                    avatar_url,
                    email
                  )
                `)
                .eq('id', payload.new.id)
                .single();
              
              if (!newMsgError && newMsg) {
                // Cast to unknown first before casting to the proper type
                const formattedNewMsg = {
                  id: (newMsg as Record<string, unknown>).id as string,
                  chat_room_id: (newMsg as Record<string, unknown>).chat_room_id as string,
                  sender_id: (newMsg as Record<string, unknown>).sender_id as string,
                  content: (newMsg as Record<string, unknown>).content as string,
                  created_at: (newMsg as Record<string, unknown>).created_at as string,
                  updated_at: (newMsg as Record<string, unknown>).updated_at as string,
                  sender: (newMsg as Record<string, unknown>).profiles as Record<string, unknown>
                };
                
                setMessages(prevMessages => [...prevMessages, formattedNewMsg as unknown as Message]);
                
                // Update last read timestamp if message is from another user
                if (newMsg.sender_id !== userData.user.id) {
                  await supabase
                    .from('chat_room_members')
                    .update({ last_read_at: new Date().toISOString() })
                    .eq('chat_room_id', chatId)
                    .eq('user_id', userData.user.id);
                }
              }
            }
          )
          .subscribe();
        
        // Clean up subscription
        return () => {
          subscription.unsubscribe();
        };
        
      } catch (err) {
        console.error("Error fetching chat data:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load chat";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChatData();
  }, [chatId]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Send a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatRoom || !currentUserId) return;
    
    setIsSending(true);
    
    try {
      const supabase = createClient();
      
      const { error } = await supabase.from('messages').insert({
        chat_room_id: chatRoom.id,
        sender_id: currentUserId,
        content: newMessage,
      });
      
      if (error) throw error;
      
      // Clear input after successful send
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };
  
  // Helper function to get avatar fallback initials
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Helper function to format message timestamp
  const formatMessageTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Helper function to format message date display with grouping
  const getShouldShowDate = (index: number, messages: Message[]): boolean => {
    if (index === 0) return true;
    
    const currentDate = new Date(messages[index].created_at).toDateString();
    const prevDate = new Date(messages[index - 1].created_at).toDateString();
    
    return currentDate !== prevDate;
  };
  
  // Format date display for message groups
  const formatMessageDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString(undefined, { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-9rem)] items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex h-[calc(100vh-9rem)] items-center justify-center">
        <div className="max-w-md rounded-md bg-destructive/10 p-6 text-destructive">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium">Error loading conversation</h3>
              <p className="text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => router.push('/dashboard/chat')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Messages
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!chatRoom) {
    return (
      <div className="flex h-[calc(100vh-9rem)] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">Conversation not found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            This conversation may have been deleted or you don&apos;t have permission to access it.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/dashboard/chat')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Messages
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-[calc(100vh-9rem)] border rounded-lg overflow-hidden bg-background">
      {/* Chat room */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={() => router.push('/dashboard/chat')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            {chatRoom.is_group ? (
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            ) : (
              <Avatar>
                <AvatarImage src={members.find(m => m.user_id !== currentUserId)?.profile?.avatar_url || undefined} />
                <AvatarFallback>{getInitials(chatRoom.name)}</AvatarFallback>
              </Avatar>
            )}
            
            <div>
              <h3 className="font-medium">{chatRoom.name || 'Unnamed Chat'}</h3>
              <p className="text-xs text-muted-foreground">
                {chatRoom.is_group 
                  ? `${members.length} members` 
                  : members.find(m => m.user_id !== currentUserId)?.profile?.email || ''}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {chatRoom.is_group && (
                <DropdownMenuItem onClick={() => alert('View members')}>
                  <Users className="mr-2 h-4 w-4" />
                  View Members
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => confirm('Are you sure you want to leave this conversation?')}>
                <User className="mr-2 h-4 w-4" />
                {chatRoom.is_group ? 'Leave Group' : 'Delete Conversation'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground">
                <p>No messages yet.</p>
                <p className="text-sm">Send a message to start the conversation!</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={message.id}>
                  {getShouldShowDate(index, messages) && (
                    <div className="flex justify-center my-4">
                      <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                        {formatMessageDate(message.created_at)}
                      </div>
                    </div>
                  )}
                  
                  <div className={`flex gap-3 max-w-[85%] ${message.sender_id === currentUserId ? 'ml-auto' : ''}`}>
                    {message.sender_id !== currentUserId && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.sender?.avatar_url || undefined} />
                        <AvatarFallback>{getInitials(message.sender?.full_name)}</AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`flex flex-col ${message.sender_id === currentUserId ? 'items-end' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {message.sender_id !== currentUserId && (
                          <span className="text-sm font-medium">
                            {message.sender?.full_name || message.sender?.email || 'Unknown'}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatMessageTime(message.created_at)}
                        </span>
                      </div>
                      
                      <div 
                        className={`rounded-lg px-3 py-2 ${
                          message.sender_id === currentUserId 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Message input */}
        <div className="border-t p-3">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
              disabled={isSending}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isSending || !newMessage.trim()}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 