import { logger } from "./utils.js";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration from environment variables
// Set RESEND_FROM_EMAIL in production (e.g., 'Renkioo <hello@renkioo.com>')
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Renkioo <onboarding@resend.dev>';
const REPLY_TO_EMAIL = process.env.RESEND_REPLY_TO || 'support@resend.dev';

/**
 * Send verification code to user's email
 */
export async function sendVerificationEmail(email: string, code: string, name?: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: 'Doğrulama Kodunuz - Renkioo',
      replyTo: REPLY_TO_EMAIL,
      html: `
        <!DOCTYPE html>
        <html lang="tr">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="color-scheme" content="light">
            <meta name="supported-color-schemes" content="light">
            <title>Renkioo Doğrulama Kodu</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                background-color: #f9fafb;
              }
              .wrapper {
                width: 100%;
                background-color: #f9fafb;
                padding: 20px 0;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 16px;
                padding: 40px;
                color: white;
                text-align: center;
              }
              .logo {
                font-size: 48px;
                margin-bottom: 20px;
                line-height: 1;
              }
              .title {
                font-size: 28px;
                font-weight: bold;
                margin: 0 0 10px 0;
              }
              .subtitle {
                font-size: 16px;
                opacity: 0.9;
                margin: 0 0 30px 0;
              }
              .text {
                font-size: 16px;
                margin: 20px 0;
                line-height: 1.5;
              }
              .code-container {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                padding: 24px 20px;
                margin: 30px 0;
              }
              .code {
                font-size: 42px;
                font-weight: bold;
                letter-spacing: 10px;
                color: #ffffff;
                text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                margin: 0;
                padding: 0;
              }
              .info {
                font-size: 14px;
                opacity: 0.85;
                margin: 20px 0 0 0;
                line-height: 1.6;
              }
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid rgba(255,255,255,0.2);
                font-size: 12px;
                opacity: 0.7;
                line-height: 1.5;
              }
              @media only screen and (max-width: 600px) {
                .container {
                  padding: 30px 20px;
                }
                .code {
                  font-size: 36px;
                  letter-spacing: 6px;
                }
              }
            </style>
          </head>
          <body>
            <div class="wrapper">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div class="container">
                      <div class="logo">🌟</div>
                      <h1 class="title">${name ? `Merhaba ${name}!` : 'Merhaba!'}</h1>
                      <p class="subtitle">Renkioo'ya hoş geldiniz!</p>

                      <p class="text">Hesabınızı doğrulamak için aşağıdaki kodu uygulamaya girin:</p>

                      <div class="code-container">
                        <div class="code">${code}</div>
                      </div>

                      <div class="info">
                        ⏱️ Bu kod 10 dakika geçerlidir.<br/>
                        🔒 Güvenliğiniz için bu kodu kimseyle paylaşmayın.<br/><br/>
                        Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı güvenle yok sayabilirsiniz.
                      </div>

                      <div class="footer">
                        © ${new Date().getFullYear()} Renkioo<br/>
                        Çocukların renkli hayal dünyası 🌈
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
          </body>
        </html>
      `,
      text: `
Merhaba${name ? ` ${name}` : ''}!

Renkioo'ya hoş geldiniz!

Hesabınızı doğrulamak için aşağıdaki kodu uygulamaya girin:

${code}

Bu kod 10 dakika geçerlidir.
Güvenliğiniz için bu kodu kimseyle paylaşmayın.

Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı güvenle yok sayabilirsiniz.

© ${new Date().getFullYear()} Renkioo
Çocukların renkli hayal dünyası 🌈
      `.trim(),
    });

    if (error) {
      logger.error('[Email] Failed to send verification email:', error);
      throw new Error(`Email send failed: ${error.message}`);
    }

    logger.info('[Email] ✅ Verification email sent successfully:', data?.id);
    return { success: true, emailId: data?.id };
  } catch (error) {
    logger.error('[Email] Error sending email:', error);
    throw error;
  }
}

/**
 * Generate a 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Store verification code in database with expiration
 */
export async function storeVerificationCode(
  email: string,
  code: string,
  expiresInMinutes: number = 10
) {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

  return {
    email,
    code,
    expiresAt: expiresAt.toISOString(),
  };
}

/**
 * Send password reset code to user's email
 */
export async function sendPasswordResetEmail(
  email: string,
  code: string,
  name?: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: 'Şifre Sıfırlama Kodu - Renkioo',
      replyTo: REPLY_TO_EMAIL,
      html: `
        <!DOCTYPE html>
        <html lang="tr">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Renkioo Şifre Sıfırlama</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333333;
                background-color: #f9fafb;
              }
              .wrapper {
                width: 100%;
                background-color: #f9fafb;
                padding: 20px 0;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 16px;
                padding: 40px;
                color: white;
                text-align: center;
              }
              .code {
                font-size: 42px;
                font-weight: bold;
                letter-spacing: 10px;
                color: #ffffff;
                margin: 30px 0;
                padding: 24px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 12px;
              }
              @media only screen and (max-width: 600px) {
                .container { padding: 30px 20px; }
                .code { font-size: 36px; letter-spacing: 6px; }
              }
            </style>
          </head>
          <body>
            <div class="wrapper">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div class="container">
                      <div style="font-size: 48px; margin-bottom: 20px;">🔒</div>
                      <h1 style="font-size: 28px; margin: 0 0 10px 0;">${name ? `Merhaba ${name}!` : 'Merhaba!'}</h1>
                      <p style="font-size: 16px; margin: 20px 0;">Şifrenizi sıfırlamak için aşağıdaki kodu kullanın:</p>
                      <div class="code">${code}</div>
                      <p style="font-size: 14px; opacity: 0.85; margin: 20px 0;">
                        ⏱️ Bu kod 10 dakika geçerlidir.<br/>
                        🔒 Şifre sıfırlama talebinde bulunmadıysanız bu e-postayı yok sayın.
                      </p>
                      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 12px; opacity: 0.7;">
                        © ${new Date().getFullYear()} Renkioo
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
          </body>
        </html>
      `,
      text: `
Merhaba${name ? ` ${name}` : ''}!

Şifrenizi sıfırlamak için aşağıdaki kodu kullanın:

${code}

Bu kod 10 dakika geçerlidir.
Şifre sıfırlama talebinde bulunmadıysanız bu e-postayı yok sayın.

© ${new Date().getFullYear()} Renkioo
      `.trim(),
    });

    if (error) {
      throw new Error(`Email send failed: ${error.message}`);
    }

    logger.info('[Email] ✅ Password reset email sent:', data?.id);
    return { success: true, emailId: data?.id };
  } catch (error) {
    logger.error('[Email] Error sending password reset email:', error);
    throw error;
  }
}
