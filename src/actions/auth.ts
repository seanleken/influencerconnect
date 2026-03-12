"use server";

import { getUserByEmail, createUser } from "@/services/user.service";
import { registerSchema } from "@/schemas/auth";
import { signIn, signOut } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

export async function register(formData: unknown) {
  const result = registerSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { name, email, password, role } = result.data;

  const existing = await getUserByEmail(email);
  if (existing) {
    return { success: false, error: "An account with this email already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await createUser({ name, email, passwordHash, role });

  return { success: true };
}

export async function login(formData: unknown) {
  const result = (await import("@/schemas/auth")).loginSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { email, password } = result.data;

  try {
    await signIn("credentials", { email, password, redirect: false });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Invalid email or password" };
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
