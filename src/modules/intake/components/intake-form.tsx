"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createIntakeAction } from "@/app/admin/intake/actions";
import { RepairFormFeedback } from "@/components/repairlab";
import { initialIntakeActionState } from "@/modules/intake/intake.action-state";

const deviceTypes = [
  "PHONE",
  "TABLET",
  "LAPTOP",
  "DESKTOP",
  "CONSOLE",
  "ACCESSORY",
  "OTHER",
] as const;

const contactMethods = ["WHATSAPP", "EMAIL", "PHONE", "NONE"] as const;

export function IntakeForm() {
  const [state, formAction] = useActionState(
    createIntakeAction,
    initialIntakeActionState,
  );

  return (
    <form action={formAction} className="space-y-6 rounded-3xl border border-white/10 bg-zinc-950/90 p-4 shadow-sm shadow-black/25 sm:space-y-8 sm:p-6">
      <FormSection title="Cliente">
        <TextInput label="Nombre" name="customer.firstName" required />
        <TextInput label="Apellido" name="customer.lastName" />
        <TextInput label="Email" name="customer.email" type="email" />
        <TextInput label="Telefono" name="customer.phone" />
        <TextInput label="WhatsApp" name="customer.whatsappPhone" />
        <SelectInput
          label="Contacto preferido"
          name="customer.preferredContactMethod"
          options={contactMethods}
          defaultValue="WHATSAPP"
        />
        <TextareaInput label="Notas del cliente" name="customer.notes" />
      </FormSection>

      <FormSection title="Equipo">
        <SelectInput label="Tipo" name="device.type" options={deviceTypes} defaultValue="PHONE" />
        <TextInput label="Marca" name="device.brand" required />
        <TextInput label="Modelo" name="device.model" />
        <TextInput label="Serial" name="device.serial" />
        <TextInput label="Color" name="device.color" />
        <TextareaInput label="Notas del equipo" name="device.notes" />
      </FormSection>

      <FormSection title="Recepcion">
        <TextareaInput label="Accesorios recibidos" name="intake.accessoriesReceived" />
        <TextareaInput label="Condicion fisica" name="intake.physicalCondition" required />
        <TextareaInput label="Problema reportado" name="intake.reportedIssue" required />
        <TextareaInput label="Observaciones internas" name="intake.internalNotes" />
        <div className="grid gap-2">
          <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="photos">
            Fotos privadas del estado inicial
          </label>
          <input
            id="photos"
            name="photos"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            multiple
            className="block w-full text-sm dark:text-zinc-100"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Archivos privados: se guardan fuera de /public y solo el admin puede abrirlos.
          </p>
        </div>
      </FormSection>

      {state.message ? (
        <div className="grid gap-3">
          <RepairFormFeedback ok={state.ok} message={state.message} />
          {state.ticketNumber ? <p>Ticket: {state.ticketNumber}</p> : null}
          {state.receiptNumber ? <p>Comprobante: {state.receiptNumber}</p> : null}
          {state.ticketId ? (
            <a
              className="mt-2 inline-block font-medium underline"
              href={`/admin/tickets/${state.ticketId}`}
            >
              Ver ticket creado
            </a>
          ) : null}
        </div>
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
      className="min-h-11 w-full rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-black text-black shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:border disabled:border-white/5 disabled:bg-zinc-900 disabled:text-zinc-500 disabled:shadow-none sm:w-auto"
    >
      {pending ? "Registrando..." : "Registrar recepcion"}
    </button>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="grid gap-4">
      <legend className="mb-2 text-base font-semibold text-zinc-950 dark:text-zinc-50">{title}</legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function TextInput({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className={fieldClassName}
      />
    </div>
  );
}

function TextareaInput({
  label,
  name,
  required = false,
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-2 sm:col-span-2">
      <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor={name}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        required={required}
        rows={3}
        className={fieldClassName}
      />
    </div>
  );
}

function SelectInput<T extends string>({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: readonly T[];
  defaultValue: T;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor={name}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className={fieldClassName}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

const fieldClassName =
  "min-h-11 w-full rounded-2xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-500 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20";
