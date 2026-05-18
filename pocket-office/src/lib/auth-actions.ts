"use server";

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "Имя обязательно").max(100),
  email: z.string().email("Некорректный email"),
  password: z.string().min(8, "Пароль должен быть не менее 8 символов"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

type RegisterResult = {
  success: boolean;
  error?: string;
  email?: string;
  password?: string;
};

export async function registerAction(
  _prev: RegisterResult,
  formData: FormData,
): Promise<RegisterResult> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Ошибка валидации" };
  }

  const email = parsed.data.email.toLowerCase();

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: "Пользователь с таким email уже существует" };
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name: parsed.data.name,
          passwordHash,
        },
      });

      const tenant = await tx.tenant.create({
        data: {
          name: "Моя компания",
        },
      });

      await tx.tenantMember.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
          role: "ADMIN",
        },
      });
    });

    return { success: true, email, password: parsed.data.password };
  } catch {
    return { success: false, error: "Произошла ошибка при регистрации" };
  }
}

const loginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(1, "Пароль обязателен"),
});

type LoginResult = {
  success: boolean;
  error?: string;
  redirectTo?: string;
};

export async function loginAction(
  _prev: LoginResult,
  formData: FormData,
): Promise<LoginResult> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Ошибка валидации" };
  }

  try {
    const result = await nextAuthSignIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirect: false,
    });

    if (result?.error) {
      if (result.error === "CredentialsSignin") {
        return { success: false, error: "Неверный email или пароль" };
      }
      return { success: false, error: "Ошибка входа" };
    }

    const callbackUrl = formData.get("callbackUrl") as string;
    return { success: true, redirectTo: callbackUrl || "/dashboard" };
  } catch {
    return { success: false, error: "Произошла ошибка при входе" };
  }
}

export async function logoutAction() {
  await nextAuthSignOut({ redirectTo: "/" });
}

export async function googleSignInAction() {
  await nextAuthSignIn("google", { redirectTo: "/dashboard" });
}
