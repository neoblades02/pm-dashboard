"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { 
  ArrowLeft, 
  Loader2, 
  Users, 
  Search, 
  AlertCircle,
  User,
  Check,
  X,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface TeamMember {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string;
  job_title: string | null;
}

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string;
  job_title: string | null;
}

// The actual structure returned by Supabase
interface CompanyMember {
  profiles: Profile;
}

export default function NewGroupChatPage() {
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");
  
  useEffect(() => {
    const fetchTeamMembers = async () => {
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
        
        // Get user's company
        const { data: companyData, error: companyError } = await supabase
          .from('company_members')
          .select('company_id')
          .eq('user_id', userData.user.id)
          .single();
        
        if (companyError) {
          // Handle case where user doesn't belong to a company
          if (companyError.code === 'PGRST116') {
            setTeamMembers([]);
            setIsLoading(false);
            return;
          }
          throw companyError;
        }
        
        setCompanyId(companyData.company_id);
        
        // Get all members of the company (except current user)
        const { data: membersData, error: membersError } = await supabase
          .from('company_members')
          .select(`
            profiles (
              id,
              full_name,
              avatar_url,
              email,
              job_title
            )
          `)
          .eq('company_id', companyData.company_id)
          .neq('user_id', userData.user.id);
        
        if (membersError) throw membersError;
        
        // Format team members data
        // First convert to unknown to safely handle type conversion
        const membersDataUnknown = membersData as unknown;
        const typedMembersData = membersDataUnknown as CompanyMember[];
        
        const formattedMembers = typedMembersData
          .filter(member => member.profiles) // filter out any null profiles
          .map(member => ({
            id: member.profiles.id,
            full_name: member.profiles.full_name,
            avatar_url: member.profiles.avatar_url,
            email: member.profiles.email,
            job_title: member.profiles.job_title
          }));
        
        setTeamMembers(formattedMembers);
      } catch (err) {
        console.error("Error fetching team members:", err);
        setError(err instanceof Error ? err.message : "Failed to load team members");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeamMembers();
  }, []);
  
  const filteredMembers = teamMembers.filter(member => {
    const searchLower = searchQuery.toLowerCase();
    return (
      member.full_name?.toLowerCase().includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower) ||
      member.job_title?.toLowerCase().includes(searchLower)
    );
  });
  
  const handleStartGroupChat = async () => {
    if (selectedMembers.length === 0 || !currentUserId || !companyId || !groupName.trim()) return;
    
    setIsCreating(true);
    
    try {
      const supabase = createClient();
      
      // Create a new chat room
      const { data: newChatRoom, error: createError } = await supabase
        .from('chat_rooms')
        .insert({
          name: groupName.trim(),
          is_group: true,
          company_id: companyId,
          created_by: currentUserId,
        })
        .select()
        .single();
      
      if (createError) throw createError;
      
      // Add current user and selected members as group members
      const memberPromises = [
        // Add current user as a member
        supabase.from('chat_room_members').insert({
          chat_room_id: newChatRoom.id,
          user_id: currentUserId,
        }),
        // Add selected members
        ...selectedMembers.map(memberId => 
          supabase.from('chat_room_members').insert({
            chat_room_id: newChatRoom.id,
            user_id: memberId,
          })
        )
      ];
      
      await Promise.all(memberPromises);
      
      // Navigate to the new chat
      router.push(`/dashboard/chat/${newChatRoom.id}`);
    } catch (err) {
      console.error("Error creating group chat:", err);
      alert("Failed to create group chat. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };
  
  const toggleMemberSelection = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };
  
  const removeMember = (memberId: string) => {
    setSelectedMembers(selectedMembers.filter(id => id !== memberId));
  };
  
  // Helper function to get avatar fallback initials
  const getInitials = (name: string | null): string => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Get member by ID
  const getMemberById = (id: string): TeamMember | undefined => {
    return teamMembers.find(member => member.id === id);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-9rem)] items-center justify-center border rounded-lg">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading team members...</p>
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
              <h3 className="font-medium">Error loading team members</h3>
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
  
  // No team members state
  if (teamMembers.length === 0) {
    return (
      <div className="flex h-[calc(100vh-9rem)] flex-col items-center justify-center border rounded-lg p-6 text-center">
        <User className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No Team Members</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          There are no other members in your company to add to a group chat. Invite team members to start conversations.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/team')}
          className="mr-2"
        >
          Invite Team Members
        </Button>
        <Button 
          variant="outline"
          onClick={() => router.push('/dashboard/chat')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Messages
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] border rounded-lg overflow-hidden bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/dashboard/chat')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="font-medium">New Group Chat</h2>
            <p className="text-xs text-muted-foreground">
              Select team members to add to a group conversation
            </p>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          
          {/* Selected members display */}
          {selectedMembers.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedMembers.map(id => {
                const member = getMemberById(id);
                if (!member) return null;
                return (
                  <Badge key={id} variant="secondary" className="pl-1 pr-1 flex items-center gap-1">
                    <Avatar className="h-5 w-5 mr-1">
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback className="text-[10px]">{getInitials(member.full_name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs max-w-[100px] truncate">
                      {member.full_name || member.email.split('@')[0]}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 w-5 p-0 hover:bg-destructive/10"
                      onClick={() => removeMember(id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          )}
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search team members..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Team members list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <p>No matching team members found.</p>
              <p className="text-sm">Try a different search term.</p>
            </div>
          ) : (
            filteredMembers.map(member => (
              <button
                key={member.id}
                className={`flex items-center gap-3 w-full text-left rounded-md p-3 transition-colors ${
                  selectedMembers.includes(member.id) 
                    ? 'bg-primary/10'
                    : 'hover:bg-accent'
                }`}
                onClick={() => toggleMemberSelection(member.id)}
              >
                <Avatar>
                  <AvatarImage src={member.avatar_url || undefined} />
                  <AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">
                    {member.full_name || 'Unnamed User'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {member.email}
                  </div>
                  {member.job_title && (
                    <div className="text-xs text-muted-foreground">
                      {member.job_title}
                    </div>
                  )}
                </div>
                <div className="h-5 w-5 rounded-full border flex items-center justify-center">
                  {selectedMembers.includes(member.id) ? (
                    <Check className="h-3 w-3 text-primary" />
                  ) : (
                    <Plus className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
      
      {/* Footer with action buttons */}
      <div className="border-t p-4 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {selectedMembers.length} members selected
        </div>
        <div>
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/chat')}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleStartGroupChat}
            disabled={selectedMembers.length === 0 || isCreating || !groupName.trim()}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Create Group
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 