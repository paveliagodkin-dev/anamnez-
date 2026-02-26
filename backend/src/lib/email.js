import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendVerificationEmail(email, token) {
  const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: `"Анамнез" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Подтверди почту — Анамнез',
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; background: #0a0a0f; color: #e8e8e0; padding: 48px 40px;">
        <h1 style="font-size: 28px; margin-bottom: 8px;">Анамнез</h1>
        <p style="color: #666670; font-size: 13px; margin-bottom: 40px; font-style: italic;">Медицинская платформа</p>
        <h2 style="font-size: 20px; margin-bottom: 16px;">Подтверди свою почту</h2>
        <p style="color: #aaa; line-height: 1.6; margin-bottom: 32px;">
          Нажми кнопку ниже чтобы активировать аккаунт. Ссылка действует 24 часа.
        </p>
        <a href="${link}" style="display: inline-block; background: #c8f0a0; color: #0a0a0f; padding: 14px 32px; font-family: monospace; font-size: 12px; letter-spacing: 0.1em; text-decoration: none; text-transform: uppercase;">
          Подтвердить →
        </a>
        <p style="color: #444; font-size: 12px; margin-top: 40px;">
          Если ты не регистрировался — просто проигнорируй это письмо.
        </p>
      </div>
    `
  });
}

export async function sendPasswordResetEmail(email, token) {
  const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: `"Анамнез" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Сброс пароля — Анамнез',
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; background: #0a0a0f; color: #e8e8e0; padding: 48px 40px;">
        <h1 style="font-size: 28px; margin-bottom: 40px;">Анамнез</h1>
        <h2 style="font-size: 20px; margin-bottom: 16px;">Сброс пароля</h2>
        <p style="color: #aaa; line-height: 1.6; margin-bottom: 32px;">
          Ссылка для сброса пароля. Действует 1 час.
        </p>
        <a href="${link}" style="display: inline-block; background: #c8f0a0; color: #0a0a0f; padding: 14px 32px; font-family: monospace; font-size: 12px; letter-spacing: 0.1em; text-decoration: none; text-transform: uppercase;">
          Сбросить пароль →
        </a>
      </div>
    `
  });
}
