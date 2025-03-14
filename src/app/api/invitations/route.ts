import { createClient } from "@/lib/supabase";
import { calculateInvitationExpiry, generateInvitationToken } from "@/lib/utils";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClientFromRequest } from "@/lib/supabase";

// Schema for validating invitation requests
const invitationSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "manager", "member"], {
    errorMap: () => ({ message: "Role must be one of: admin, manager, member" }),
  }),
  companyId: z.string().uuid("Invalid company ID"),
});

export async function POST(request: Request) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const validationResult = invitationSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { email, role, companyId } = validationResult.data;
    
    // Create a response to receive cookies
    const response = NextResponse.json({}, { status: 200 });
    
    // Create Supabase client with proper cookie handling
    const supabase = createServerClientFromRequest(request, response);
    
    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Authentication error:", userError);
      return NextResponse.json(
        { error: "Authentication error: " + userError.message },
        { status: 401 }
      );
    }
    
    if (!user) {
      console.error("No user found in session");
      return NextResponse.json(
        { error: "Unauthorized. Please log in to send invitations." },
        { status: 401 }
      );
    }
    
    // Check if user has permission to invite members to this company
    const { data: memberData, error: memberError } = await supabase
      .from("company_members")
      .select("role")
      .eq("company_id", companyId)
      .eq("user_id", user.id)
      .single();
    
    if (memberError || !memberData) {
      return NextResponse.json(
        { error: "You do not have permission to invite members to this company." },
        { status: 403 }
      );
    }
    
    // Check if requester's role allows them to send invitations
    // Only owners, admins, and managers can invite members
    if (
      memberData.role !== "owner" && 
      memberData.role !== "admin" && 
      memberData.role !== "manager"
    ) {
      return NextResponse.json(
        { error: "Your role does not allow you to send invitations." },
        { status: 403 }
      );
    }
    
    // Check for role privileges - managers can only invite members
    if (memberData.role === "manager" && role !== "member") {
      return NextResponse.json(
        { error: "Managers can only invite team members, not admins or managers." },
        { status: 403 }
      );
    }
    
    // Debug helper for checking email existence more thoroughly
    const { data: allProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", email.toLowerCase());
      
    if (profilesError) {
      console.error("Error checking profiles:", profilesError);
    }
    
    console.log("All matching profiles:", { 
      email, 
      allProfiles, 
      count: allProfiles?.length || 0 
    });
    
    // Check if the email is already a member of the company - using a different approach
    // First check if a profile with this email exists
    if (allProfiles && allProfiles.length > 0) {
      // If profile exists, check if they're in the company
      const profileId = allProfiles[0].id;
      
      const { data: memberCheck, error: memberCheckError } = await supabase
        .from("company_members")
        .select("id")
        .eq("company_id", companyId)
        .eq("user_id", profileId)
        .maybeSingle();
      
      if (memberCheckError) {
        console.error("Error checking company membership:", memberCheckError);
      }
      
      console.log("Company membership check:", { profileId, memberCheck, companyId });
      
      if (memberCheck) {
        return NextResponse.json(
          { error: "This email is already a member of the company." },
          { status: 409 }
        );
      }
    }
    
    // Original check is commented out but kept for reference
    /*
    const { data: existingMember, error: memberCheckError } = await supabase
      .from("company_members")
      .select(`
        id, 
        profiles!inner(
          id,
          email
        )
      `)
      .eq("company_id", companyId)
      .eq("profiles.email", email.toLowerCase())
      .maybeSingle();
    
    if (memberCheckError) {
      console.error("Error checking for existing member:", memberCheckError);
    }
    
    console.log("Existing member check:", { 
      email, 
      existingMember, 
      companyId 
    });
    
    if (existingMember) {
      return NextResponse.json(
        { error: "This email is already a member of the company." },
        { status: 409 }
      );
    }
    */
    
    // Check for existing pending invitation
    const { data: existingInvitation, error: inviteCheckError } = await supabase
      .from("invitations")
      .select("id, status, created_at")
      .eq("company_id", companyId)
      .eq("email", email.toLowerCase())
      .eq("status", "pending")
      .maybeSingle();
    
    if (inviteCheckError) {
      console.error("Error checking for existing invitation:", inviteCheckError);
    }
    
    console.log("Existing invitation check:", { 
      email, 
      existingInvitation,
      companyId 
    });
    
    // If there's a pending invitation, return its details
    if (existingInvitation) {
      return NextResponse.json(
        { 
          message: "An invitation has already been sent to this email.",
          invitation: existingInvitation,
          resend: true
        },
        { status: 200 }
      );
    }
    
    // Generate invitation token and expiry date
    const token = generateInvitationToken();
    const expiryDate = calculateInvitationExpiry(7); // 7 days expiry
    const currentDate = new Date();
    
    // Create invitation record
    const { data: invitationData, error: invitationError } = await supabase
      .from("invitations")
      .insert({
        company_id: companyId,
        email: email.toLowerCase(),
        role,
        token,
        invited_by: user.id,
        status: "pending",
        expires_at: expiryDate.toISOString(),
        created_at: currentDate.toISOString(),
        updated_at: currentDate.toISOString(),
      })
      .select()
      .single();
    
    if (invitationError) {
      console.error("Error creating invitation:", invitationError);
      return NextResponse.json(
        { error: "Failed to create invitation. Please try again." },
        { status: 500 }
      );
    }
    
    // Get company name for the email
    const { data: companyData, error: companyError } = await supabase
      .from("companies")
      .select("name")
      .eq("id", companyId)
      .single();
    
    if (companyError) {
      console.error("Error fetching company:", companyError);
    }
    
    // Get inviter's name for the email
    const { data: inviterData, error: inviterError } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    
    if (inviterError) {
      console.error("Error fetching inviter:", inviterError);
    }
    
    // In a production environment, you would send an actual email here
    // For now, we'll just log the details and return the invitation link
    const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/invitations/${token}`;
    console.log(`
      [INVITATION EMAIL]
      To: ${email}
      From: ${process.env.NEXT_PUBLIC_APP_NAME || "PM Dashboard"}
      Subject: You've been invited to join ${companyData?.name || "a company"} on PM Dashboard
      
      Body:
      Hello,
      
      ${inviterData?.full_name || "Someone"} has invited you to join ${companyData?.name || "their company"} on PM Dashboard with the role of ${role}.
      
      To accept this invitation, please click the link below:
      ${invitationLink}
      
      This invitation will expire in 7 days.
      
      If you did not expect this invitation, you can safely ignore this email.
      
      Best regards,
      The PM Dashboard Team
    `);
    
    // Return success response with invitation details
    return NextResponse.json({
      message: "Invitation sent successfully.",
      invitation: {
        id: invitationData.id,
        email,
        role,
        token,
        expires_at: expiryDate.toISOString(),
        invitation_link: invitationLink,
      },
    }, response);
    
  } catch (error: unknown) {
    console.error("Error sending invitation:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

// Endpoint to resend an invitation
export async function PUT(request: Request) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const invitationId = body.invitationId;
    
    if (!invitationId) {
      return NextResponse.json(
        { error: "Invitation ID is required" },
        { status: 400 }
      );
    }
    
    // Create a response to receive cookies
    const response = NextResponse.json({}, { status: 200 });
    
    // Create Supabase client
    const supabase = createServerClientFromRequest(request, response);
    
    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to resend invitations." },
        { status: 401 }
      );
    }
    
    // Fetch the invitation
    const { data: invitation, error: invitationError } = await supabase
      .from("invitations")
      .select(`
        id,
        company_id,
        email,
        role,
        token,
        status,
        companies (
          id,
          name
        )
      `)
      .eq("id", invitationId)
      .single();
    
    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }
    
    // Check if user has permission to manage this company's invitations
    const { data: memberData, error: memberError } = await supabase
      .from("company_members")
      .select("role")
      .eq("company_id", invitation.company_id)
      .eq("user_id", user.id)
      .single();
    
    if (memberError || !memberData) {
      return NextResponse.json(
        { error: "You do not have permission to manage invitations for this company." },
        { status: 403 }
      );
    }
    
    // Check if requester's role allows them to resend invitations
    if (
      memberData.role !== "owner" && 
      memberData.role !== "admin" && 
      memberData.role !== "manager"
    ) {
      return NextResponse.json(
        { error: "Your role does not allow you to resend invitations." },
        { status: 403 }
      );
    }
    
    // Update invitation with new expiry date and token
    const newToken = generateInvitationToken();
    const newExpiryDate = calculateInvitationExpiry(7);
    const currentDate = new Date();
    
    const { data: updatedInvitation, error: updateError } = await supabase
      .from("invitations")
      .update({
        token: newToken,
        expires_at: newExpiryDate.toISOString(),
        updated_at: currentDate.toISOString(),
        status: "pending",
      })
      .eq("id", invitationId)
      .select()
      .single();
    
    if (updateError) {
      console.error("Error updating invitation:", updateError);
      return NextResponse.json(
        { error: "Failed to resend invitation. Please try again." },
        { status: 500 }
      );
    }
    
    // Get inviter's name for the email
    const { data: inviterData, error: inviterError } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    
    if (inviterError) {
      console.error("Error fetching inviter:", inviterError);
    }
    
    // In a production environment, you would send an actual email here
    const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/invitations/${newToken}`;
    console.log(`
      [INVITATION EMAIL - RESENT]
      To: ${invitation.email}
      From: ${process.env.NEXT_PUBLIC_APP_NAME || "PM Dashboard"}
      Subject: Invitation Reminder: Join ${Array.isArray(invitation.companies) 
        ? (invitation.companies[0]?.name || "a company") 
        : "a company"} on PM Dashboard
      
      Body:
      Hello,
      
      This is a reminder that ${inviterData?.full_name || "Someone"} has invited you to join ${Array.isArray(invitation.companies) 
        ? (invitation.companies[0]?.name || "a company") 
        : "a company"} on PM Dashboard with the role of ${invitation.role}.
      
      To accept this invitation, please click the link below:
      ${invitationLink}
      
      This invitation will expire in 7 days.
      
      If you did not expect this invitation, you can safely ignore this email.
      
      Best regards,
      The PM Dashboard Team
    `);
    
    // Return success response with invitation details
    return NextResponse.json({
      message: "Invitation resent successfully.",
      invitation: {
        id: updatedInvitation.id,
        email: invitation.email,
        role: invitation.role,
        token: newToken,
        expires_at: newExpiryDate.toISOString(),
        invitation_link: invitationLink,
      },
    }, response);
    
  } catch (error: unknown) {
    console.error("Error resending invitation:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

// Endpoint to cancel an invitation
export async function DELETE(request: Request) {
  // Extract the invitation ID from the URL
  const url = new URL(request.url);
  const invitationId = url.searchParams.get("id");
  
  if (!invitationId) {
    return NextResponse.json(
      { error: "Invitation ID is required" },
      { status: 400 }
    );
  }
  
  try {
    // Create a response to receive cookies
    const response = NextResponse.json({}, { status: 200 });
    
    // Create Supabase client
    const supabase = createServerClientFromRequest(request, response);
    
    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to cancel invitations." },
        { status: 401 }
      );
    }
    
    // Fetch the invitation
    const { data: invitation, error: invitationError } = await supabase
      .from("invitations")
      .select("id, company_id, status")
      .eq("id", invitationId)
      .single();
    
    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }
    
    // Check if invitation is already accepted or canceled
    if (invitation.status !== "pending") {
      return NextResponse.json(
        { error: `This invitation cannot be canceled because it is already ${invitation.status}.` },
        { status: 400 }
      );
    }
    
    // Check if user has permission to manage this company's invitations
    const { data: memberData, error: memberError } = await supabase
      .from("company_members")
      .select("role")
      .eq("company_id", invitation.company_id)
      .eq("user_id", user.id)
      .single();
    
    if (memberError || !memberData) {
      return NextResponse.json(
        { error: "You do not have permission to manage invitations for this company." },
        { status: 403 }
      );
    }
    
    // Check if requester's role allows them to cancel invitations
    if (
      memberData.role !== "owner" && 
      memberData.role !== "admin" && 
      memberData.role !== "manager"
    ) {
      return NextResponse.json(
        { error: "Your role does not allow you to cancel invitations." },
        { status: 403 }
      );
    }
    
    // Update invitation status to canceled
    const { error: updateError } = await supabase
      .from("invitations")
      .update({
        status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", invitationId);
    
    if (updateError) {
      console.error("Error canceling invitation:", updateError);
      return NextResponse.json(
        { error: "Failed to cancel invitation. Please try again." },
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json({
      message: "Invitation canceled successfully.",
    }, response);
    
  } catch (error: unknown) {
    console.error("Error canceling invitation:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
} 