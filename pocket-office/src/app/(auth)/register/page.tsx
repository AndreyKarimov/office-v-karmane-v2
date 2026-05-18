"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { registerAction, googleSignInAction } from "@/lib/auth-actions";

export default function RegisterPage() {
  const router = useRouter();
  const autoLoginRef = useRef(false);
  const [state, formAction, pending] = useActionState(registerAction, {
    success: false,
  });

  useEffect(() => {
    if (state.success && state.email && state.password && !autoLoginRef.current) {
      autoLoginRef.current = true;
      signIn("credentials", {
        email: state.email,
        password: state.password,
        redirect: false,
      }).then((result) => {
        if (result?.ok) {
          router.push("/onboarding");
        } else {
          router.push("/login");
        }
      });
    }
  }, [state, router]);

  return (
    <Card className="p-6 md:p-8">
      <div className="mb-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded bg-primary text-on-primary font-bold mx-auto mb-3">
          ОК
        </div>
        <h1 className="text-headline-md">Регистрация</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Создайте аккаунт и начните управлять задачами
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <Input label="Имя" name="name" type="text" placeholder="Ваше имя" required />
        <Input label="Email" name="email" type="email" placeholder="mail@example.com" required />
        <Input label="Пароль" name="password" type="password" placeholder="Минимум 8 символов" required />
        <Input label="Подтвердите пароль" name="confirmPassword" type="password" placeholder="Повторите пароль" required />

        {state.error && (
          <p className="text-label-sm text-error bg-error/10 rounded p-2">{state.error}</p>
        )}

        <div className="text-label-md text-on-surface-variant">
          Регистрируясь, вы принимаете{" "}
          <Link href="/terms" className="text-primary hover:underline">условия использования</Link>{" "}
          и{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            политику конфиденциальности
          </Link>
        </div>

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Регистрация..." : "Создать аккаунт"}
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-border-light">
        <div className="flex flex-col gap-3">
          <form action={googleSignInAction}>
            <Button variant="ghost" type="submit" className="w-full">
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Войти через Google
            </Button>
          </form>
        </div>
      </div>

      <div className="mt-4 text-center text-body-md">
        <span className="text-on-surface-variant">Уже есть аккаунт? </span>
        <Link href="/login" className="text-primary font-medium hover:underline">
          Войти
        </Link>
      </div>
    </Card>
  );
}
