-- Chat rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT, -- NULL for direct messages
  is_group BOOLEAN NOT NULL DEFAULT false,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE, -- Chat rooms belong to a company
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chat room members table
CREATE TABLE IF NOT EXISTS chat_room_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(chat_room_id, user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add triggers for updated_at columns
CREATE TRIGGER update_chat_rooms_updated_at
BEFORE UPDATE ON chat_rooms
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Enable RLS for the new tables
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Chat rooms policies
-- Users can select chat rooms they're members of
CREATE POLICY chat_rooms_select_member ON chat_rooms
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_room_members
      WHERE chat_room_members.chat_room_id = chat_rooms.id
      AND chat_room_members.user_id = auth.uid()
    )
  );

-- Users can insert chat rooms if they're members of the company
CREATE POLICY chat_rooms_insert ON chat_rooms
  FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM company_members
      WHERE company_members.company_id = chat_rooms.company_id
      AND company_members.user_id = auth.uid()
    )
  );

-- Chat room members policies
-- Users can see members of chat rooms they belong to
CREATE POLICY chat_room_members_select ON chat_room_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_room_members AS my_membership
      WHERE my_membership.chat_room_id = chat_room_members.chat_room_id
      AND my_membership.user_id = auth.uid()
    )
  );

-- Only the chat creator or company admins can add members
CREATE POLICY chat_room_members_insert ON chat_room_members
  FOR INSERT
  WITH CHECK (
    (
      -- User is adding themselves to a direct message
      user_id = auth.uid()
    ) OR (
      -- User is the creator of the chat room
      EXISTS (
        SELECT 1 FROM chat_rooms
        WHERE chat_rooms.id = chat_room_members.chat_room_id
        AND chat_rooms.created_by = auth.uid()
      )
    ) OR (
      -- User is a company admin or owner
      EXISTS (
        SELECT 1 FROM chat_rooms
        JOIN company_members ON company_members.company_id = chat_rooms.company_id
        WHERE chat_rooms.id = chat_room_members.chat_room_id
        AND company_members.user_id = auth.uid()
        AND company_members.role IN ('owner', 'admin')
      )
    )
  );

-- Users can update their own membership (e.g., last_read_at)
CREATE POLICY chat_room_members_update_own ON chat_room_members
  FOR UPDATE
  USING (user_id = auth.uid());

-- Messages policies
-- Users can select messages from chat rooms they're members of
CREATE POLICY messages_select ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_room_members
      WHERE chat_room_members.chat_room_id = messages.chat_room_id
      AND chat_room_members.user_id = auth.uid()
    )
  );

-- Users can insert messages to chat rooms they're members of
CREATE POLICY messages_insert ON messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM chat_room_members
      WHERE chat_room_members.chat_room_id = messages.chat_room_id
      AND chat_room_members.user_id = auth.uid()
    )
  );

-- Users can update their own messages
CREATE POLICY messages_update_own ON messages
  FOR UPDATE
  USING (sender_id = auth.uid());

-- Users can delete their own messages
CREATE POLICY messages_delete_own ON messages
  FOR DELETE
  USING (sender_id = auth.uid()); 