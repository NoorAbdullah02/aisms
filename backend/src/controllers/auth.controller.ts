import type { Request, Response } from "express";
import { eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { users, students, teachers, departments } from "../db/schema.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { loginSchema, signupSchema } from "../validators/schemas.js";
import { ApiError } from "../middleware/errorHandler.js";
import { recordAudit } from "../utils/audit.js";

export async function signup(req: Request, res: Response) {
  const data = signupSchema.parse(req.body);
  const normalizedEmail = data.email.trim().toLowerCase();

  // Check if user already exists
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`LOWER(${users.email}) = ${normalizedEmail}`)
    .limit(1);

  if (existingUser) {
    throw new ApiError(409, "An account with this email address already exists. Please sign in instead.");
  }

  const passwordHash = await hashPassword(data.password);

  const [newUser] = await db
    .insert(users)
    .values({
      fullName: data.fullName.trim(),
      email: normalizedEmail,
      passwordHash,
      role: data.role,
      isActive: true,
    })
    .returning();

  if (!newUser) {
    throw new ApiError(500, "Failed to create user account.");
  }

  if (data.role === "student") {
    const studentCode = data.code?.trim() || `STU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    await db.insert(students).values({
      userId: newUser.id,
      departmentId: data.departmentId || null,
      studentCode,
      semester: "1",
      guardianName: data.guardianName?.trim() || null,
      guardianPhone: data.guardianPhone?.trim() || null,
      status: "active",
      admissionDate: new Date().toISOString().slice(0, 10),
    });
  } else if (data.role === "teacher") {
    const employeeCode = data.code?.trim() || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    await db.insert(teachers).values({
      userId: newUser.id,
      departmentId: data.departmentId || null,
      employeeCode,
      designation: data.designation?.trim() || "Lecturer",
      phone: data.phone?.trim() || null,
      employmentType: "Permanent",
      joinedAt: new Date().toISOString().slice(0, 10),
    });
  }

  const accessToken = signAccessToken({ sub: newUser.id, role: newUser.role, email: newUser.email });
  const refreshToken = signRefreshToken({ sub: newUser.id });

  recordAudit(newUser.id, "auth.signup", { email: newUser.email, role: newUser.role });

  res.status(201).json({
    accessToken,
    refreshToken,
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      avatarUrl: newUser.avatarUrl,
    },
    message: "Registration successful!",
  });
}

export async function getPublicDepartments(_req: Request, res: Response) {
  const depts = await db
    .select({ id: departments.id, name: departments.name, code: departments.code })
    .from(departments);
  res.json(depts);
}

export async function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (user.expiresAt && new Date() > new Date(user.expiresAt)) {
    throw new ApiError(403, "Account access has expired. Please contact Administrator.");
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id });

  recordAudit(user.id, "auth.login", { email: user.email, role: user.role });

  res.json({
    accessToken,
    refreshToken,
    user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
  });
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) throw new ApiError(400, "refreshToken is required.");

  let payload: { sub: number };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token.");
  }

  const [user] = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
  if (!user || !user.isActive) throw new ApiError(401, "User not found.");

  if (user.expiresAt && new Date() > new Date(user.expiresAt)) {
    throw new ApiError(403, "Account access has expired. Please contact Administrator.");
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  res.json({ accessToken });
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body as { email?: string };
  if (!email) throw new ApiError(400, "Email address is required.");

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (user) {
    recordAudit(user.id, "auth.forgot_password_requested", { email });
  }

  res.json({
    message: "If an account matches that email address, password reset instructions have been sent.",
  });
}

export async function changePassword(req: Request, res: Response) {
  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Both currentPassword and newPassword are required.");
  }
  if (newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters long.");
  }

  const [user] = await db.select().from(users).where(eq(users.id, req.user!.sub)).limit(1);
  if (!user) throw new ApiError(404, "User not found.");

  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) {
    throw new ApiError(400, "Current password is incorrect.");
  }

  const passwordHash = await hashPassword(newPassword);
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, user.id));

  recordAudit(user.id, "auth.password_changed", { email: user.email });

  res.json({ message: "Password updated successfully." });
}

export async function updateProfile(req: Request, res: Response) {
  const { fullName, avatarUrl } = req.body as { fullName?: string; avatarUrl?: string };
  const userId = req.user!.sub;

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new ApiError(404, "User not found.");

  const updateData: any = { updatedAt: new Date() };
  if (fullName && fullName.trim()) updateData.fullName = fullName.trim();
  if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

  await db.update(users).set(updateData).where(eq(users.id, userId));

  const [updated] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  recordAudit(userId, "auth.profile_updated", { fullName, avatarUrl });

  res.json({ id: updated!.id, fullName: updated!.fullName, email: updated!.email, role: updated!.role, avatarUrl: updated!.avatarUrl });
}

export async function me(req: Request, res: Response) {
  const [user] = await db.select().from(users).where(eq(users.id, req.user!.sub)).limit(1);
  if (!user) throw new ApiError(404, "User not found.");
  res.json({ id: user.id, fullName: user.fullName, email: user.email, role: user.role, avatarUrl: user.avatarUrl });
}

export async function logout(_req: Request, res: Response) {
  res.status(204).send();
}

export async function adminResetPassword(req: Request, res: Response) {
  const { userId, newPassword } = req.body as { userId?: number; newPassword?: string };
  if (!userId || !newPassword || newPassword.length < 6) {
    throw new ApiError(400, "Valid userId and newPassword (min 6 chars) are required.");
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new ApiError(404, "User account not found.");

  const passwordHash = await hashPassword(newPassword);
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId));

  recordAudit(req.user!.sub, "admin.password_reset", { targetUserId: userId, targetEmail: user.email });
  res.json({ message: `Password for ${user.fullName} (${user.email}) reset successfully.` });
}
