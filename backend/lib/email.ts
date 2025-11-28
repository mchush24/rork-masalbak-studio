import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send verification code to user's email
 */
export async function sendVerificationEmail(email: string, code: string, name?: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Zuna <onboarding@resend.dev>', // Will change to your domain later
      to: [email],
      subject: 'Zuna - Doğrulama Kodunuz',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 16px;
                padding: 40px;
                color: white;
                text-align: center;
              }
              .logo {
                font-size: 48px;
                margin-bottom: 20px;
              }
              .title {
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .subtitle {
                font-size: 16px;
                opacity: 0.9;
                margin-bottom: 30px;
              }
              .code-container {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                padding: 20px;
                margin: 30px 0;
              }
              .code {
                font-size: 48px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #fff;
                text-shadow: 0 2px 4px rgba(0,0,0,0.2);
              }
              .info {
                font-size: 14px;
                opacity: 0.8;
                margin-top: 20px;
              }
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid rgba(255,255,255,0.2);
                font-size: 12px;
                opacity: 0.7;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">🌟</div>
              <div class="title">${name ? `Merhaba ${name}!` : 'Merhaba!'}</div>
              <div class="subtitle">Zuna'ya hoş geldiniz!</div>

              <p>Hesabınızı doğrulamak için aşağıdaki kodu girin:</p>

              <div class="code-container">
                <div class="code">${code}</div>
              </div>

              <div class="info">
                Bu kod 10 dakika geçerlidir.<br/>
                Eğer bu hesabı siz oluşturmadıysanız, bu emaili görmezden gelebilirsiniz.
              </div>

              <div class="footer">
                © ${new Date().getFullYear()} Zuna - Her çizim bir hikaye, her hikaye bir macera! 🎨
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('[Email] Failed to send verification email:', error);
      throw new Error(`Email send failed: ${error.message}`);
    }

    console.log('[Email] ✅ Verification email sent successfully:', data?.id);
    return { success: true, emailId: data?.id };
  } catch (error) {
    console.error('[Email] Error sending email:', error);
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
