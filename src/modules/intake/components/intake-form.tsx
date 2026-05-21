"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createIntakeAction } from "@/app/admin/intake/actions";
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
    <form action={formAction} className="space-y-6 rounded border border-zinc-200 p-4 dark:border-zinc-800 sm:space-y-8 sm:p-6">
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
            accept="image/*"
            multiple
            className="block w-full text-sm dark:text-zinc-100"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Placeholder privado: se registra metadata y storageKey; no se publica en /public.
          </p>
        </div>
      </FormSection>

      {state.message ? (
        <div
          className={`rounded border p-3 text-sm ${
            state.ok
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
          role="status"
        >
          <p>{state.message}</p>
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
      className="min-h-11 w-full rounded bg-zinc-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-400 sm:w-auto"
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
        className="min-h-11 w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
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
        className="min-h-24 w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
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
        className="min-h-11 w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
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
