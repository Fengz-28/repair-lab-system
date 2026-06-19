"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createIntakeAction } from "@/app/admin/intake/actions";
import { RepairFormFeedback } from "@/components/repairlab";
import { RepairSubmitButton } from "@/components/repairlab/form-fields";
import { initialIntakeActionState } from "@/modules/intake/intake.action-state";

const deviceTypeOptions = [
  { value: "PHONE", label: "Teléfono" },
  { value: "TABLET", label: "Tablet" },
  { value: "LAPTOP", label: "Laptop" },
  { value: "DESKTOP", label: "Computadora de escritorio" },
  { value: "CONSOLE", label: "Consola" },
  { value: "ACCESSORY", label: "Accesorio" },
  { value: "OTHER", label: "Otro" },
];

const contactMethodOptions = [
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "EMAIL", label: "Correo electrónico" },
  { value: "PHONE", label: "Llamada telefónica" },
  { value: "NONE", label: "Sin preferencia" },
];

export function IntakeForm() {
  const [state, formAction] = useActionState(
    createIntakeAction,
    initialIntakeActionState,
  );

  return (
    <form action={formAction} className="repair-premium-card space-y-6 rounded-3xl border border-white/10 bg-zinc-950/90 p-4 shadow-sm shadow-black/25 sm:space-y-8 sm:p-6">
      <FormSection title="Cliente">
        <TextInput label="Nombre" name="customer.firstName" required />
        <TextInput label="Apellido" name="customer.lastName" />
        <TextInput label="Correo electrónico" name="customer.email" type="email" />
        <TextInput label="Teléfono" name="customer.phone" />
        <TextInput label="WhatsApp" name="customer.whatsappPhone" />
        <SelectInput
          label="Contacto preferido"
          name="customer.preferredContactMethod"
          options={contactMethodOptions}
          defaultValue="WHATSAPP"
        />
        <TextareaInput label="Notas del cliente" name="customer.notes" />
      </FormSection>

      <FormSection title="Equipo">
        <SelectInput label="Tipo de equipo" name="device.type" options={deviceTypeOptions} defaultValue="PHONE" />
        <TextInput label="Marca" name="device.brand" required />
        <TextInput label="Modelo" name="device.model" />
        <TextInput label="Serial" name="device.serial" />
        <TextInput label="Color" name="device.color" />
        <TextareaInput label="Notas del equipo" name="device.notes" />
      </FormSection>

      <FormSection title="Recepción">
        <TextareaInput label="Accesorios recibidos" name="intake.accessoriesReceived" />
        <TextareaInput label="Condición física" name="intake.physicalCondition" required />
        <TextareaInput label="Problema reportado" name="intake.reportedIssue" required />
        <TextareaInput label="Observaciones internas" name="intake.internalNotes" />
        <div className="grid gap-2">
          <label className="text-sm font-medium text-zinc-200" htmlFor="photos">
            Fotos privadas del estado inicial
          </label>
          <input
            id="photos"
            name="photos"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            multiple
            className="repair-input-surface block w-full cursor-pointer text-sm file:mr-3 file:rounded-full file:border-0 file:bg-cyan-400 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-slate-950 hover:file:bg-cyan-300"
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
    <RepairSubmitButton
      pending={pending}
      label="Registrar recepción"
      pendingLabel="Registrando..."
    />
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
      <legend className="mb-2 text-base font-semibold text-zinc-50">{title}</legend>
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
      <label className="text-sm font-medium text-zinc-200" htmlFor={name}>
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
      <label className="text-sm font-medium text-zinc-200" htmlFor={name}>
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

function SelectInput({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: Array<{ label: string; value: string }>;
  defaultValue: string;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-zinc-200" htmlFor={name}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className={fieldClassName}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

const fieldClassName = "repair-input-surface text-sm";

