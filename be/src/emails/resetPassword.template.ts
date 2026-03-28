interface ResetPasswordEmailOptions {
  name: string;
  email: string;
  resetUrl: string;
  expiryMinutes: number;
}

export function resetPasswordEmail({ name, email, resetUrl, expiryMinutes }: ResetPasswordEmailOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Logo / Header -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:10px;width:40px;height:40px;text-align:center;vertical-align:middle;">
                    <span style="color:#ffffff;font-size:22px;font-weight:700;line-height:40px;">F</span>
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;">
                    <span style="font-size:22px;font-weight:700;background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;color:#6366f1;">Fixy</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.07);overflow:hidden;">

              <!-- Top accent bar -->
              <tr>
                <td style="height:4px;background:linear-gradient(90deg,#6366f1,#8b5cf6);display:block;line-height:4px;font-size:0;">&nbsp;</td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:40px 48px 32px;">

                  <!-- Icon -->
                  <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                    <tr>
                      <td style="background:#ede9fe;border-radius:50%;width:56px;height:56px;text-align:center;vertical-align:middle;">
                        <span style="font-size:28px;line-height:56px;">🔑</span>
                      </td>
                    </tr>
                  </table>

                  <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">Reset your password</h1>
                  <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
                    Hi ${name}, we received a request to reset the password for your Fixy account associated with <strong style="color:#374151;">${email}</strong>.
                  </p>

                  <!-- CTA Button -->
                  <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                    <tr>
                      <td style="border-radius:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);">
                        <a href="${resetUrl}" target="_blank"
                          style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;letter-spacing:0.01em;">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Expiry notice -->
                  <table cellpadding="0" cellspacing="0" style="background:#fef9c3;border-left:3px solid #f59e0b;border-radius:0 8px 8px 0;margin-bottom:24px;width:100%;">
                    <tr>
                      <td style="padding:12px 16px;font-size:13px;color:#92400e;">
                        ⏳ &nbsp;This link expires in <strong>${expiryMinutes} minutes</strong>. If you didn't request this, you can safely ignore this email.
                      </td>
                    </tr>
                  </table>

                  <!-- Fallback URL -->
                  <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
                    If the button doesn't work, copy and paste this URL into your browser:<br />
                    <a href="${resetUrl}" style="color:#6366f1;word-break:break-all;">${resetUrl}</a>
                  </p>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#f9fafb;padding:20px 48px;border-top:1px solid #e5e7eb;">
                  <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;line-height:1.6;">
                    &copy; ${new Date().getFullYear()} Fixy &nbsp;·&nbsp; You're receiving this because a password reset was requested for your account.
                  </p>
                </td>
              </tr>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
