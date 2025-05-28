// src/services/invitationService.js
import { userService } from './firestore';
import toast from 'react-hot-toast';

export const invitationService = {
  /**
   * Send invitation email to a user
   * This is a placeholder implementation - in a real app, this would integrate with:
   * - Firebase Functions
   * - Email service (SendGrid, SES, etc.)
   * - Custom backend API
   */
  async sendInvitation(userEmail, userData, invitedBy) {
    try {
      // In a real implementation, this would:
      // 1. Generate a secure invitation token
      // 2. Send email with invitation link
      // 3. Update user status to 'pending_invitation'
      
      console.log('Sending invitation to:', userEmail);
      console.log('User data:', userData);
      console.log('Invited by:', invitedBy);
      
      // Placeholder: Generate invitation link
      const invitationToken = generateInvitationToken();
      const invitationLink = `${window.location.origin}/accept-invitation?token=${invitationToken}`;
      
      // Placeholder: Log email content (in real app, this would be sent via email service)
      const emailContent = this.generateInvitationEmail(userData, invitationLink, invitedBy);
      
      console.log('Email content to be sent:');
      console.log('Subject:', emailContent.subject);
      console.log('Body:', emailContent.body);
      
      // TODO: Replace with actual email sending service
      // await emailService.send(userEmail, emailContent.subject, emailContent.body);
      
      // For now, just show a mock success message
      toast.success(`Invitation email would be sent to ${userEmail}`);
      toast.info('Check console for email content (development mode)');
      
      return {
        success: true,
        invitationToken,
        invitationLink
      };
      
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation email');
      throw error;
    }
  },

  /**
   * Generate invitation email content
   */
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

  /**
   * Resend invitation to a pending user
   */
  async resendInvitation(userId) {
    try {
      const user = await userService.getById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      if (user.status !== 'pending_invitation') {
        throw new Error('User is not in pending invitation status');
      }
      
      // Update the invitation timestamp
      await userService.update(userId, {
        invitedAt: new Date().toISOString(),
        invitationResent: true
      });
      
      // Send the invitation email again
      const invitedByUser = await userService.getById(user.invitedBy);
      await this.sendInvitation(user.email, user, invitedByUser);
      
      toast.success('Invitation resent successfully');
      
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast.error(`Failed to resend invitation: ${error.message}`);
      throw error;
    }
  },

  /**
   * Cancel a pending invitation
   */
  async cancelInvitation(userId) {
    try {
      await userService.update(userId, {
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      });
      
      toast.success('Invitation cancelled successfully');
      
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast.error('Failed to cancel invitation');
      throw error;
    }
  }
};

/**
 * Generate a secure invitation token
 * In a real app, this would be done on the backend with proper crypto
 */
function generateInvitationToken() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `inv_${timestamp}_${randomPart}`;
}

/**
 * Validate invitation token
 * In a real app, this would verify the token against the database
 */
export function validateInvitationToken(token) {
  // Basic validation - in real app, this would check database
  return token && token.startsWith('inv_') && token.length > 20;
}

export default invitationService;