"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { loginAction } from "@/lib/auth-actions";

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(loginAction, {
    success: false,
  });

  useEffect(() => {
    if (state.success && state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [state, router]);

  return (
    <Card className="p-6 md:p-8">
      <div className="mb-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded bg-primary text-on-primary font-bold mx-auto mb-3">
          ОК
        </div>
        <h1 className="text-headline-md">Вход в аккаунт</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Войдите, чтобы продолжить работу
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <Input label="Email" name="email" type="email" placeholder="mail@example.com" required />
        <Input label="Пароль" name="password" type="password" placeholder="••••••••" required />

        {state.error && (
          <p className="text-label-sm text-error bg-error/10 rounded p-2">{state.error}</p>
        )}

        <div className="flex items-center justify-between text-label-md">
          <label className="flex items-center gap-2 text-on-surface-variant cursor-pointer">
            <input type="checkbox" className="rounded border-outline-variant" />
            Запомнить меня
          </label>
          <Link href="/reset-password" className="text-primary hover:underline">
            Забыли пароль?
          </Link>
        </div>
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Вход..." : "Войти"}
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-border-light text-center text-body-md">
        <span className="text-on-surface-variant">Нет аккаунта? </span>
        <Link href="/register" className="text-primary font-medium hover:underline">
          Зарегистрироваться
        </Link>
      </div>
    </Card>
  );
}
