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
          className="min-h-12 rounded-xl border border-white/10 bg-zinc-950 px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-emerald-400 focus:bg-zinc-950 focus:ring-2 focus:ring-emerald-500/25"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="min-h-12 rounded-xl border border-white/10 bg-zinc-950 px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-emerald-400 focus:bg-zinc-950 focus:ring-2 focus:ring-emerald-500/25"
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
      className="min-h-12 w-full rounded-xl border border-emerald-300/40 bg-emerald-500 px-4 py-2 text-sm font-black text-black shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 hover:shadow-cyan-400/20 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-zinc-900 disabled:text-zinc-500 disabled:shadow-none"
    >
      {pending ? "Entrando..." : "Entrar"}
    </button>
  );
}
