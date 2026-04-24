import bcrypt from "bcryptjs";
import { query } from "../config/database.js";
import { createToken, serializeUser } from "../utils/auth.js";
import {
  buildPasswordResetUrl,
  createPasswordResetExpiry,
  createPasswordResetToken,
  hashPasswordResetToken,
  sendPasswordResetEmail,
} from "../utils/passwordReset.js";

function validateAuthPayload(payload, { requireFullName }) {
  const fullName = payload?.fullName?.trim();
  const email = payload?.email?.trim().toLowerCase();
  const password = payload?.password || "";

  if (requireFullName && !fullName) {
    return { error: "Full name is required." };
  }

  if (!email) {
    return { error: "Email is required." };
  }

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!isEmailValid) {
    return { error: "Email must be valid." };
  }

  if (typeof password !== "string" || password.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }

  return { fullName, email, password };
}

function createAuthResponse(user) {
  return {
    token: createToken(user),
    user: serializeUser(user),
  };
}

function validateEmail(value) {
  const email = value?.trim().toLowerCase();

  if (!email) {
    return { error: "Email is required." };
  }

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!isEmailValid) {
    return { error: "Email must be valid." };
  }

  return { email };
}

function validatePasswordResetPayload(payload) {
  const validatedEmail = validateEmail(payload?.email);

  if (validatedEmail.error) {
    return validatedEmail;
  }

  const token = payload?.token?.trim();
  const password = payload?.password || "";

  if (!token) {
    return { error: "Reset token is required." };
  }

  if (typeof password !== "string" || password.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }

  return {
    email: validatedEmail.email,
    token,
    password,
  };
}

export async function signup(request, response) {
  const validatedPayload = validateAuthPayload(request.body, { requireFullName: true });

  if (validatedPayload.error) {
    response.status(400).json({ error: validatedPayload.error });
    return;
  }

  const existingUserResult = await query(
    `SELECT id
     FROM users
     WHERE email = $1`,
    [validatedPayload.email]
  );

  if (existingUserResult.rowCount > 0) {
    response.status(409).json({ error: "An account with that email already exists." });
    return;
  }

  const passwordHash = await bcrypt.hash(validatedPayload.password, 10);
  const result = await query(
    `INSERT INTO users (full_name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, full_name, email, created_at`,
    [validatedPayload.fullName, validatedPayload.email, passwordHash]
  );

  response.status(201).json(createAuthResponse(result.rows[0]));
}

export async function login(request, response) {
  const validatedPayload = validateAuthPayload(request.body, { requireFullName: false });

  if (validatedPayload.error) {
    response.status(400).json({ error: validatedPayload.error });
    return;
  }

  const result = await query(
    `SELECT id, full_name, email, password_hash, created_at
     FROM users
     WHERE email = $1`,
    [validatedPayload.email]
  );

  if (result.rowCount === 0) {
    response.status(401).json({ error: "Invalid email or password." });
    return;
  }

  const user = result.rows[0];
  const isPasswordValid = await bcrypt.compare(validatedPayload.password, user.password_hash);

  if (!isPasswordValid) {
    response.status(401).json({ error: "Invalid email or password." });
    return;
  }

  response.json(
    createAuthResponse({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      created_at: user.created_at,
    })
  );
}

export async function getCurrentUser(request, response) {
  const result = await query(
    `SELECT id, full_name, email, created_at
     FROM users
     WHERE id = $1`,
    [request.user.id]
  );

  if (result.rowCount === 0) {
    response.status(404).json({ error: "User not found." });
    return;
  }

  response.json({ user: serializeUser(result.rows[0]) });
}

export async function requestPasswordReset(request, response) {
  const validatedEmail = validateEmail(request.body?.email);

  if (validatedEmail.error) {
    response.status(400).json({ error: validatedEmail.error });
    return;
  }

  const result = await query(
    `SELECT id, full_name, email
     FROM users
     WHERE email = $1`,
    [validatedEmail.email]
  );

  const responseBody = {
    message: "If an account matches that email, a reset link has been sent.",
  };

  if (result.rowCount === 0) {
    response.json(responseBody);
    return;
  }

  const user = result.rows[0];
  const resetToken = createPasswordResetToken();
  const resetTokenHash = hashPasswordResetToken(resetToken);
  const resetTokenExpiresAt = createPasswordResetExpiry();

  await query(
    `UPDATE users
     SET reset_token_hash = $1,
         reset_token_expires_at = $2
     WHERE id = $3`,
    [resetTokenHash, resetTokenExpiresAt, user.id]
  );

  const resetUrl = buildPasswordResetUrl({ email: user.email, token: resetToken });
  const emailResult = await sendPasswordResetEmail({
    email: user.email,
    fullName: user.full_name,
    resetUrl,
  });

  if (emailResult.previewResetUrl) {
    responseBody.previewResetUrl = emailResult.previewResetUrl;
  }

  response.json(responseBody);
}

export async function resetPassword(request, response) {
  const validatedPayload = validatePasswordResetPayload(request.body);

  if (validatedPayload.error) {
    response.status(400).json({ error: validatedPayload.error });
    return;
  }

  const result = await query(
    `SELECT id, reset_token_hash, reset_token_expires_at
     FROM users
     WHERE email = $1`,
    [validatedPayload.email]
  );

  if (result.rowCount === 0) {
    response.status(400).json({ error: "Reset link is invalid or has expired." });
    return;
  }

  const user = result.rows[0];
  const resetTokenHash = hashPasswordResetToken(validatedPayload.token);
  const expiresAt = user.reset_token_expires_at ? new Date(user.reset_token_expires_at) : null;

  if (
    !user.reset_token_hash ||
    user.reset_token_hash !== resetTokenHash ||
    !expiresAt ||
    Number.isNaN(expiresAt.getTime()) ||
    expiresAt.getTime() < Date.now()
  ) {
    response.status(400).json({ error: "Reset link is invalid or has expired." });
    return;
  }

  const passwordHash = await bcrypt.hash(validatedPayload.password, 10);

  await query(
    `UPDATE users
     SET password_hash = $1,
         reset_token_hash = NULL,
         reset_token_expires_at = NULL
     WHERE id = $2`,
    [passwordHash, user.id]
  );

  response.json({ message: "Password updated successfully. Please log in with your new password." });
}