import {
  initializeApp,
  getApps,
  cert,
  type App,
} from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';

// Force Node.js runtime — Firebase Admin SDK and Nodemailer require it
export const runtime = 'nodejs';

// Lazy singleton — avoids crashing during Next.js module evaluation
function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0]!;

  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (rawKey && clientEmail && projectId) {
    // Normalise \n escape sequences from .env
    const privateKey = rawKey
      .replace(/^"|"$/g, '')   // strip surrounding quotes if any
      .replace(/\\n/g, '\n');   // convert literal \n to real newlines

    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }
  // Application Default Credentials (e.g. on Google Cloud)
  return initializeApp();
}

function getTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Verify if environment credentials for admin SDK are present
    const hasAdminCreds = process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL;
    if (!hasAdminCreds) {
      console.warn('Firebase Service Account environment variables are not configured.');
      return NextResponse.json(
        { error: 'Firebase Service Account credentials are not configured. Please add FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL to your environment configuration.' },
        { status: 501 }
      );
    }

    // Generate password reset link using Firebase Admin SDK.
    // Only pass actionCodeSettings.url when we have a real production URL;
    // Firebase rejects localhost as an unauthorised continueUrl.
    const productionUrl = process.env.NEXT_PUBLIC_APP_URL;
    const actionCodeSettings = productionUrl
      ? { url: `${productionUrl}/auth` }
      : undefined;

    const app = getAdminApp();
    const resetLink = await getAuth(app).generatePasswordResetLink(
      email,
      actionCodeSettings
    );

    const logoUrl = productionUrl ? `${productionUrl}/kickoff-logo-wordmark.png` : '';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your KICKOFF Password</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #f0f2f5;
              background-color: #0a0e17;
              margin: 0;
              padding: 0;
              -webkit-font-smoothing: antialiased;
            }
            .wrapper {
              background-color: #0a0e17;
              padding: 40px 20px;
            }
            .container {
              max-width: 550px;
              margin: 0 auto;
              background-color: #111625;
              border: 1px solid #1f293d;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            }
            .header {
              background-color: #0d111a;
              border-bottom: 1px solid #1f293d;
              padding: 30px;
              text-align: center;
            }
            .content {
              padding: 40px 30px;
            }
            h2 {
              font-size: 20px;
              font-weight: 700;
              color: #ffffff;
              margin-top: 0;
              margin-bottom: 20px;
              text-align: center;
              text-transform: uppercase;
              letter-spacing: 0.02em;
            }
            p {
              font-size: 15px;
              color: #cbd5e0;
              margin-bottom: 24px;
              line-height: 1.6;
            }
            .button-container {
              text-align: center;
              margin: 35px 0;
            }
            .button {
              display: inline-block;
              background-color: #1fad66;
              color: #0a0e17 !important;
              padding: 14px 35px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              font-size: 15px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              box-shadow: 0 4px 15px rgba(31, 173, 102, 0.3);
              transition: all 0.2s ease;
            }
            .divider {
              height: 1px;
              background-color: #1f293d;
              margin: 30px 0;
            }
            .security-notice {
              font-size: 12px;
              color: #718096;
              background-color: #0d111a;
              border-radius: 8px;
              padding: 15px;
              border: 1px dashed #1f293d;
            }
            .footer {
              text-align: center;
              padding: 30px;
              background-color: #0d111a;
              border-top: 1px solid #1f293d;
              font-size: 11px;
              color: #718096;
              text-transform: uppercase;
              letter-spacing: 0.1em;
            }
            .footer p {
              margin: 0;
              font-size: 11px;
              color: #718096;
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                ${logoUrl ? `<img src="${logoUrl}" alt="KICKOFF" style="height: 40px; width: auto;" />` : '<h1 style="font-family: \'Oswald\', \'Arial Black\', sans-serif; font-size: 24px; font-weight: 900; letter-spacing: 0.05em; color: #1fad66; text-transform: uppercase; margin: 0;">KICKOFF</h1>'}
              </div>
              <div class="content">
                <h2>Reset Your Password</h2>
                <p>Hello,</p>
                <p>We received a request to reset the password for your KICKOFF account. Click the button below to set up a new password:</p>
                
                <div class="button-container">
                  <a href="${resetLink}" class="button" target="_blank">Reset Password</a>
                </div>
                
                <p>If the button doesn't work, copy and paste the following link into your browser:</p>
                <p style="word-break: break-all; font-size: 12px; background-color: #0d111a; padding: 12px; border-radius: 6px; border: 1px solid #1f293d; font-family: monospace; color: #a0aec0;">
                  ${resetLink}
                </p>
                
                <div class="divider"></div>
                
                <div class="security-notice">
                  <strong>Security notice:</strong> If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
                </div>
              </div>
              <div class="footer">
                <p>&copy; 2026 KICKOFF. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"KICKOFF Team Manager" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔒 Reset Your KICKOFF Password',
      html,
    });

    return NextResponse.json(
      { success: true, message: 'Password reset email sent successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    const msg = error?.message || 'Failed to process password reset request';
    console.error('[forgot-password] Error:', msg, error);
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
