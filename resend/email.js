import { resend } from "./config.js";
import {
  verificationTokenEmailTemplate,
  WELCOME_EMAIL_TEMPLATE,
} from "./email-template.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [email],
      subject: "Please verify your email address now",
      html: verificationTokenEmailTemplate.replace(
        "{verificationToken}",
        verificationToken
      ),
    });
  } catch (err) {
    console.log("Error sending verification mail", err);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to PowerPeak",
      html: WELCOME_EMAIL_TEMPLATE.replace("{name}", name),
    });
  } catch (err) {
    console.log("Error sending verification mail", err);
  }
};
