const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: parseInt(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return transporter;
};

exports.sendEmail = async ({ to, subject, html, attachments }) => {
  const transport = getTransporter();
  if (!transport) {
    console.warn('Email not configured. Skipping email send.');
    return null;
  }

  try {
    const info = await transport.sendMail({
      from: `"ComplyTrack India" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments
    });
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email send failed:', error.message);
    throw error;
  }
};

exports.sendDeadlineAlertEmail = async (user, complianceItem) => {
  const daysUntilDue = Math.ceil((complianceItem.dueDate - new Date()) / (1000 * 60 * 60 * 24));
  const subject = daysUntilDue <= 0
    ? `OVERDUE: ${complianceItem.title}`
    : `Reminder: ${complianceItem.title} due in ${daysUntilDue} days`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a56db;">ComplyTrack India</h2>
      <h3>${subject}</h3>
      <p>Dear ${user.name},</p>
      <p>${complianceItem.description || 'Please take necessary action on the following compliance item:'}</p>
      <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Item</td><td style="padding: 8px; border: 1px solid #ddd;">${complianceItem.title}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Law</td><td style="padding: 8px; border: 1px solid #ddd;">${complianceItem.law}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Due Date</td><td style="padding: 8px; border: 1px solid #ddd;">${new Date(complianceItem.dueDate).toLocaleDateString()}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Priority</td><td style="padding: 8px; border: 1px solid #ddd;">${complianceItem.priority}</td></tr>
      </table>
      <p>Please log in to ComplyTrack India to take action.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">This is an automated notification from ComplyTrack India.</p>
    </div>
  `;

  return this.sendEmail({ to: user.email, subject, html });
};
