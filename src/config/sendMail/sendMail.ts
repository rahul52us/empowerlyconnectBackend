import nodemailer from "nodemailer";
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const SendMail = async (names: string, username: string, link: string, message: string, subject: string, fileName: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com", // SMTP server hostname
      port: 587, // SMTP server port
      secure: false, // Use SSL/TLS
      auth: {
        user: process.env.WELCOME_REGISTER_EMAIL_USERNAME,
        pass: process.env.WELCOME_REGISTER_EMAIL_PASSWORD
      },
    });

    const templatePath = path.join(__dirname, 'templates', fileName);
    const template = fs.readFileSync(templatePath, 'utf8');

    const personalizedTemplate = template
      .replace('{{name}}', names)
      .replace('{{link}}', link)
      .replace('{{message}}', message)
      .replace('{{logoUrl}}', "https://media.istockphoto.com/id/1345681613/vector/creative-people-logo-vector-illustration-design-editable-resizable-eps-10.jpg?s=612x612&w=0&k=20&c=9XUHICA1ljbxBcLw8ERp0kDDxLNQ8Bp2yR4aUSS6SBs=")
      .replace('{{subject}}', subject) // Ensure you add this if you use it in the template
      .replace('{{buttonText}}', 'Click Here') // Example button text
      .replace('{{year}}', new Date().getFullYear().toString()); // Current year

    const messageTemplate = {
      from: process.env.WELCOME_REGISTER_EMAIL_USERNAME,
      to: username,
      subject: subject,
      html: personalizedTemplate,
    };

    await transporter.sendMail(messageTemplate);
    return { success: true };

  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false };
  }
}

export default SendMail;
