import { db } from "@/lib/db";
import type { UserRole } from "@prisma/client";

export async function getUserByEmail(email: string) {
  return db.user.findUnique({ where: { email } });
}

export async function getUserById(id: string) {
  return db.user.findUnique({ where: { id } });
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}) {
  return db.user.create({ data });
}

export async function updateUser(
  id: string,
  data: Partial<{ name: string; image: string; emailVerified: Date }>
) {
  return db.user.update({ where: { id }, data });
}
