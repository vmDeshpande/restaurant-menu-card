"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginAction, type LoginState } from "@/lib/actions";
import { Button } from "@/components/ui/button";

const initialState: LoginState = { error: "" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.push("/admin");
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="field-label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field-input min-h-11" placeholder="admin@example.com" />
      </div>
      <div>
        <label className="field-label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field-input min-h-11" placeholder="Enter your password" />
      </div>
      {state.error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800" role="alert">{state.error}</p>}
      {state.success && <p className="rounded-lg bg-forest-50 px-3 py-2 text-sm text-forest-700">{state.success}</p>}
      <Button type="submit" disabled={pending} className="min-h-11 w-full bg-amber-400 text-charcoal-900 shadow-sm hover:bg-amber-300 focus:ring-amber-500">
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}