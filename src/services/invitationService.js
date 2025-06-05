import { userService } from "./firestore";
import toast from "react-hot-toast";

export const invitationService = {
  async sendInvitation(userEmail) {
    try {
      const invitationToken = generateInvitationToken();
      const invitationLink = `${window.location.origin}/accept-invitation?token=${invitationToken}`;

      toast.success(`Invitation email would be sent to ${userEmail}`);
      toast.info("Check console for email content (development mode)");

      return {
        success: true,
        invitationToken,
        invitationLink,
      };
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  },

  generateInvitationEmail(userData, invitationLink, invitedBy) {
    const subject = `You've been invited to join ESPI CRM`;

    const body = `
      <h2>Welcome to ESPI CRM!</h2>
      
      <p>Hello ${userData.displayName},</p>
      
      <p>You have been invited by ${invitedBy.displayName} to join the ESPI CRM system with the role of <strong>${userData.role}</strong>.</p>
      
      <p>To complete your account setup, please click the link below:</p>
      
      <p><a href="${invitationLink}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Accept Invitation</a></p>
      
      <p>This invitation link will expire in 7 days.</p>
      
      <p>If you have any questions, please contact ${invitedBy.email}.</p>
      
      <p>Best regards,<br>ESPI CRM Team</p>
      
      <hr>
      <p style="color: #666; font-size: 12px;">If you didn't expect this invitation, you can safely ignore this email.</p>
    `;

    return { subject, body };
  },

  async resendInvitation(userId) {
    try {
      const user = await userService.getById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      if (user.status !== "pending_invitation") {
        throw new Error("User is not in pending invitation status");
      }

      await userService.update(userId, {
        invitedAt: new Date().toISOString(),
        invitationResent: true,
      });

      const invitedByUser = await userService.getById(user.invitedBy);
      await this.sendInvitation(user.email, user, invitedByUser);
      toast.success("Invitation resent successfully");
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  },

  async cancelInvitation(userId) {
    try {
      await userService.update(userId, {
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
      });

      toast.success("Invitation cancelled successfully");
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  },
};

function generateInvitationToken() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `inv_${timestamp}_${randomPart}`;
}

export function validateInvitationToken(token) {
  return token && token.startsWith("inv_") && token.length > 20;
}

export default invitationService;
