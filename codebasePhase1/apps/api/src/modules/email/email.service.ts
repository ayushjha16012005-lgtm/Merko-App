import { generateEmailActionToken } from '@/lib/auth-tokens';

export class EmailService {
  sendAdminRegistrationNotification(adminUser: { id: string; email: string; firstName: string; lastName: string; phone?: string | null; businessName?: string | null }) {
    const approveToken = generateEmailActionToken(adminUser.id, 'approve');
    const rejectToken = generateEmailActionToken(adminUser.id, 'reject');

    console.log(`
=========================================
📧 EMAIL TO: Active Super Admins
SUBJECT: New Admin Registration Request
-----------------------------------------
Applicant Name: ${adminUser.firstName} ${adminUser.lastName}
Email: ${adminUser.email}
Phone: ${adminUser.phone || 'N/A'}
Business Name: ${adminUser.businessName || 'N/A'}

Actions:
[APPROVE ACCESS]: http://localhost:4000/api/v1/users/email-action?token=${approveToken}
[REJECT ACCESS] : http://localhost:4000/api/v1/users/email-action?token=${rejectToken}
=========================================
`);
  }

  sendAdminApprovalNotification(email: string) {
    console.log(`
=========================================
📧 EMAIL TO: ${email}
SUBJECT: Account Approved
-----------------------------------------
Your MERKO administrator account has been approved.

You may now log in using your registered credentials.
=========================================
`);
  }

  sendAdminRejectionNotification(email: string) {
    console.log(`
=========================================
📧 EMAIL TO: ${email}
SUBJECT: Account Request Rejected
-----------------------------------------
Your administrator account request was not approved.
=========================================
`);
  }

  sendAdminSuspensionNotification(email: string) {
    console.log(`
=========================================
📧 EMAIL TO: ${email}
SUBJECT: Account Suspended
-----------------------------------------
Your administrator account has been suspended.
=========================================
`);
  }

  sendAdminReactivationNotification(email: string) {
    console.log(`
=========================================
📧 EMAIL TO: ${email}
SUBJECT: Your MERKO Management Portal Access Has Been Reactivated
-----------------------------------------
Your access to the MERKO Management Portal has been reactivated. You can now log in again.
=========================================
`);
  }

  sendSuperAdminInvitation(invitation: { email: string; fullName: string }, token: string) {
    console.log(`
=========================================
📧 EMAIL TO: ${invitation.email}
SUBJECT: Invitation to join MERKO as Super Admin
-----------------------------------------
Hello ${invitation.fullName},

You have been invited to join MERKO as a Super Admin.
Click the link below to set your password and activate your account:

http://localhost:3000/activate-super-admin?token=${token}
=========================================
`);
  }

  sendPasswordResetEmail(email: string, token: string) {
    console.log(`
=========================================
📧 EMAIL TO: ${email}
SUBJECT: Reset Your MERKO Password
-----------------------------------------
Click the secure link below to reset your password:

http://localhost:3000/reset-password?token=${token}

This link is valid for 1 hour.
=========================================
`);
  }
}

export const emailService = new EmailService();
