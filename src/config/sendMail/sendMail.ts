import nodemailer from "nodemailer";
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

interface RestOptions {
  [key: string]: any;
}

const SendMail = async (
  names: string,
  username: string,
  link: string,
  message: string,
  subject: string,
  fileName: string,
  rest: RestOptions = {}
) => {
  try {
    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com", // SMTP server hostname
      port: 587, // SMTP server port
      secure: false, // Use TLS
      auth: {
        user: process.env.WELCOME_REGISTER_EMAIL_USERNAME,
        pass: process.env.WELCOME_REGISTER_EMAIL_PASSWORD,
      },
    });

    // Path to the email template
    const templatePath = path.join(__dirname, 'templates', fileName);
    // Read the template file
    const template = fs.readFileSync(templatePath, 'utf8');

    // Default placeholders
    let personalizedTemplate = template
      .replace('{{name}}', names)
      .replace('{{link}}', link)
      .replace('{{message}}', message)
      .replace('{{logoUrl}}', rest.logoUrl || "https://media.istockphoto.com/id/1345681613/vector/creative-people-logo-vector-illustration-design-editable-resizable-eps-10.jpg?s=612x612&w=0&k=20&c=9XUHICA1ljbxBcLw8ERp0kDDxLNQ8Bp2yR4aUSS6SBs=")
      .replace('{{subject}}', subject)
      .replace('{{buttonText}}', 'Click Here')
      .replace('{{year}}', new Date().getFullYear().toString());

    // Dynamically replace placeholders with values from the `rest` object
    for (const [key, value] of Object.entries(rest)) {
      const placeholder = `{{${key}}}`;
      personalizedTemplate = personalizedTemplate.replace(new RegExp(placeholder, 'g'), String(value));
    }

    // Message options
    const messageTemplate = {
      from: process.env.WELCOME_REGISTER_EMAIL_USERNAME,
      to: username,
      subject: subject,
      html: personalizedTemplate,
    };

    // Send the email
    await transporter.sendMail(messageTemplate);

    // Return success response
    return { success: true };

  } catch (error) {
    // Log the error and return failure response
    console.error('Error sending email:', error);
    return { success: false };
  }
};

export default SendMail;
