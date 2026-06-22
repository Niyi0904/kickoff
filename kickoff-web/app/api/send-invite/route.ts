import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';

// Force Node.js runtime — Nodemailer requires it
export const runtime = 'nodejs';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASS!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { email, inviteCode, role } = await request.json();

    if (!email || !inviteCode) {
      return NextResponse.json(
        { error: 'Missing email or invite code' },
        { status: 400 }
      );
    }

    const signupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth?inviteCode=${inviteCode}`;

    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Invite to Kickoff</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
      body {
        margin:0;
        padding:0;
        background: #0d111a;
        font-family: 'Inter', sans-serif;
        color: #f5f5f5;
        line-height:1.6;
      }
      .wrapper {
        max-width:600px;
        margin:40px auto;
        background: rgba(17,22,37,0.8);
        backdrop-filter: blur(10px);
        border-radius:12px;
        overflow:hidden;
        box-shadow:0 8px 32px rgba(0,0,0,0.6);
      }
      .header {
        background:#1fad66;
        color:#fff;
        padding:30px;
        text-align:center;
        font-size:24px;
        font-weight:600;
      }
      .content {
        padding:30px;
      }
      .invite-code {
        background:#111625;
        color:#f5c22d;
        padding:15px;
        border-radius:8px;
        text-align:center;
        font-family:monospace;
        font-size:20px;
        letter-spacing:2px;
        margin:20px 0;
      }
      .btn {
        display:inline-block;
        background:#f5c22d;
        color:#0d111a;
        padding:12px 24px;
        border-radius:6px;
        text-decoration:none;
        font-weight:600;
        margin-top:10px;
      }
      .footer {
        text-align:center;
        font-size:12px;
        color:#888;
        padding:20px;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="header">🎉 You're Invited!</div>
      <div class="content">
        <p>Hi,</p>
        <p>You've been invited to join our Team Management system as a <strong>${role}</strong>.</p>
        <p>Use the invite code below to create your account:</p>
        <div class="invite-code">${inviteCode}</div>
        <p style="text-align:center;">
          <a href="${signupUrl}" class="btn">Sign Up Now</a>
        </p>
        <p>Or visit: <strong>${signupUrl}</strong></p>
        <p style="margin-top:30px;">If you have any questions, please contact the admin.</p>
      </div>
      <div class="footer">© 2026 Kickoff. All rights reserved.</div>
    </div>
  </body>
</html>
`;

    await transporter.sendMail({
      from: `"Team Management" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 You\'re Invited to Join Team Management',
      html,
    });

    return NextResponse.json(
      { success: true, message: 'Invite sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
