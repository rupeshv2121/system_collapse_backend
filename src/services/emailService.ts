import nodemailer from "nodemailer";

{/* Send user profile statistics via email */}

export async function sendProfileEmail(
  to: string,
  subject: string,
  content: string,
): Promise<void> {
  // Create transporter using environment variables
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Email options
  const mailOptions = {
    from: `System Drift <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: content,
    html: `<pre style="font-family: monospace; white-space: pre-wrap;">${content}</pre>`,
  };

  // Send email
  await transporter.sendMail(mailOptions);
}
