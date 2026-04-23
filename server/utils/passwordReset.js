import crypto from "crypto";
import nodemailer from "nodemailer";

function getAppBaseUrl() {
  return process.env.APP_BASE_URL || process.env.CLIENT_APP_URL || "http://localhost:5173";
}

function shouldSendEmail() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export function createPasswordResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashPasswordResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createPasswordResetExpiry() {
  return new Date(Date.now() + 60 * 60 * 1000);
}

export function buildPasswordResetUrl({ email, token }) {
  const url = new URL(getAppBaseUrl());

  url.searchParams.set("mode", "reset");
  url.searchParams.set("email", email);
  url.searchParams.set("token", token);

  return url.toString();
}

export async function sendPasswordResetEmail({ email, fullName, resetUrl }) {
  const subject = "Reset your StudyBuddy Planner password";
  const text = [
    `Hi ${fullName || "there"},`,
    "",
    "We received a request to reset your StudyBuddy Planner password.",
    `Use this link to choose a new password: ${resetUrl}`,
    "",
    "This link expires in 1 hour.",
    "If you did not request this reset, you can ignore this email.",
  ].join("\n");

  if (!shouldSendEmail()) {
    console.log(`Password reset requested for ${email}: ${resetUrl}`);
    return { delivered: false, previewResetUrl: resetUrl };
  }

  const transport = createTransport();
  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject,
    text,
  });

  return { delivered: true };
}