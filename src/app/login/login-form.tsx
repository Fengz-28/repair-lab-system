"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { RepairFormFeedback } from "@/components/repairlab";

import { loginAction, type LoginActionState } from "./actions";

const initialState: LoginActionState = {
  ok: false,
  message: "",
};

type LoginFormProps = {
  next?: string;
};

export function LoginForm({ next }: LoginFormProps) {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next ?? "/admin"} />
      <label className="grid gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">
        Correo
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="min-h-12 rounded-xl border border-white/10 bg-zinc-950 px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-cyan-400 focus:bg-zinc-950 focus:ring-2 focus:ring-cyan-500/25"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">
        Contraseña
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="min-h-12 rounded-xl border border-white/10 bg-zinc-950 px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-cyan-400 focus:bg-zinc-950 focus:ring-2 focus:ring-cyan-500/25"
        />
      </label>
      <RepairFormFeedback ok={state.ok} message={state.message} />
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
      className="min-h-12 w-full rounded-xl border border-cyan-300/40 bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-300 hover:shadow-cyan-300/25 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-zinc-900 disabled:text-zinc-500 disabled:shadow-none"
    >
      {pending ? "Entrando..." : "Entrar"}
    </button>
  );
}
