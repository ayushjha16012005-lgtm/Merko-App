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
SUBJECT: Your MERKO Management Portal Access Has Been Approved
-----------------------------------------
Your request has been approved.

You can now login to the Management Portal using your registered credentials.
=========================================
`);
  }

  sendAdminRejectionNotification(email: string) {
    console.log(`
=========================================
📧 EMAIL TO: ${email}
SUBJECT: Your MERKO Management Portal Access Has Been Rejected
-----------------------------------------
We regret to inform you that your request to access the MERKO Management Portal has been rejected.
=========================================
`);
  }

  sendAdminSuspensionNotification(email: string) {
    console.log(`
=========================================
📧 EMAIL TO: ${email}
SUBJECT: Your MERKO Management Portal Access Has Been Suspended
-----------------------------------------
Your access to the MERKO Management Portal has been suspended. Please contact administration.
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
}

export const emailService = new EmailService();
