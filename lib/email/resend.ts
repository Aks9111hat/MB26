import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — emails will fail to send');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? 'MindBridge <onboarding@resend.dev>';

export async function sendTherapistWelcomeEmail({
    to,
    therapistName,
    tempPassword,
}: {
    to: string;
    therapistName: string;
    tempPassword: string;
}) {
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/therapist/login`;

    try {
        const { data, error } = await resend.emails.send({
            from: FROM,
            to,
            subject: 'Welcome to MindBridge — your therapist account is ready',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #0d9488;">Welcome to MindBridge, ${therapistName}</h2>
          <p>Your therapist account has been created. Use the temporary credentials below to log in for the first time:</p>
          <div style="background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 12px; padding: 16px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Email:</strong> ${to}</p>
            <p style="margin: 4px 0;"><strong>Temporary password:</strong> ${tempPassword}</p>
          </div>
          <p>You'll be asked to set a new password the first time you log in.</p>
          <a href="${loginUrl}" style="display: inline-block; background: #14b8a6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; margin-top: 12px;">
            Log in to your dashboard
          </a>
          <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
            This temporary password expires after first use. If you didn't expect this email, please ignore it.
          </p>
        </div>
      `,
        });

        if (error) {
            console.error('Resend error:', error);
            return { ok: false, error: error.message };
        }

        return { ok: true, id: data?.id };
    } catch (err) {
        console.error('Failed to send email:', err);
        return { ok: false, error: 'Failed to send email' };
    }
}

export async function sendBookingNotificationToTherapist({
    to,
    therapistName,
    clientName,
    date,
    time,
    mode,
}: {
    to: string;
    therapistName: string;
    clientName: string;
    date: string;
    time: string;
    mode: string;
}) {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/therapist/dashboard`;

    try {
        await resend.emails.send({
            from: FROM,
            to,
            subject: `New booking request — ${date} at ${time}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #0d9488;">New session request</h2>
          <p>Hi ${therapistName}, you have a new booking request:</p>
          <div style="background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 12px; padding: 16px;">
            <p style="margin: 4px 0;"><strong>Client:</strong> ${clientName}</p>
            <p style="margin: 4px 0;"><strong>Date:</strong> ${date}</p>
            <p style="margin: 4px 0;"><strong>Time:</strong> ${time}</p>
            <p style="margin: 4px 0;"><strong>Mode:</strong> ${mode}</p>
          </div>
          <a href="${dashboardUrl}" style="display: inline-block; background: #14b8a6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; margin-top: 16px;">
            Review booking
          </a>
        </div>
      `,
        });
    } catch (err) {
        console.error('Failed to send booking notification:', err);
    }
}

export async function sendBookingStatusToClient({
    to,
    clientName,
    therapistName,
    status,
    date,
    time,
}: {
    to: string;
    clientName: string;
    therapistName: string;
    status: 'confirmed' | 'cancelled' | 'modified_pending_user';
    date: string;
    time: string;
}) {
    const bookingsUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/bookings`;

    const subjects: Record<string, string> = {
        confirmed: `Your session with ${therapistName} is confirmed`,
        cancelled: `Your session with ${therapistName} was declined`,
        modified_pending_user: `${therapistName} proposed a new time`,
    };

    const bodies: Record<string, string> = {
        confirmed: `Great news — ${therapistName} has confirmed your session on ${date} at ${time}.`,
        cancelled: `${therapistName} wasn't able to accept your requested slot on ${date} at ${time}. Please book another time.`,
        modified_pending_user: `${therapistName} suggested a different time for your session. Please review and confirm.`,
    };

    try {
        await resend.emails.send({
            from: FROM,
            to,
            subject: subjects[status],
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #0d9488;">Hi ${clientName},</h2>
          <p>${bodies[status]}</p>
          <a href="${bookingsUrl}" style="display: inline-block; background: #14b8a6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; margin-top: 16px;">
            View my bookings
          </a>
        </div>
      `,
        });
    } catch (err) {
        console.error('Failed to send status email:', err);
    }
}