"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { loginAction, type LoginActionState } from "./actions";

const initialState: LoginActionState = {
  ok: false,
  message: "",
};

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <label className="grid gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="min-h-12 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-2 text-sm text-zinc-950 placeholder:text-zinc-500 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="min-h-12 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-2 text-sm text-zinc-950 placeholder:text-zinc-500 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </label>
      {state.message ? (
        <p className="rounded border border-red-900 bg-red-950 p-3 text-sm text-red-100" role="status">
          {state.message}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-12 w-full rounded-xl bg-emerald-500 px-4 py-2 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-zinc-400 disabled:shadow-none"
    >
      {pending ? "Entrando..." : "Entrar"}
    </button>
  );
}
