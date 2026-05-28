import { receptionReceiptSchema, type ReceptionReceipt } from "./receipt.schema";

export type ReceiptPreview = {
  title: string;
  text: string;
  html: string;
};

export function renderReceptionReceiptPreview(input: ReceptionReceipt): ReceiptPreview {
  const receipt = receptionReceiptSchema.parse(input);
  const title = `Comprobante de recepción ${receipt.receiptNumber}`;
  const rows = [
    ["Ticket", receipt.ticketNumber],
    ["Cliente", receipt.customerName],
    ["Equipo", receipt.deviceLabel],
    ["Problema reportado", receipt.reportedIssue],
    ["Condicion fisica", receipt.physicalCondition],
    ["Accesorios", receipt.accessoriesReceived ?? "No registrados"],
    ["Fecha de recepción", receipt.receivedAt.toLocaleString("es-CR")],
  ];

  return {
    title,
    text: [title, ...rows.map(([label, value]) => `${label}: ${value}`)].join("\n"),
    html: [
      `<article><h1>${escapeHtml(title)}</h1>`,
      "<table>",
      ...rows.map(
        ([label, value]) =>
          `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`,
      ),
      "</table>",
      "<p>Placeholder interno: no es PDF fiscal ni comprobante de pago.</p></article>",
    ].join(""),
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
