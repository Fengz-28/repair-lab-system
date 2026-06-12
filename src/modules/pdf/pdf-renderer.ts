import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

const pageMargin = 48;
const pageWidth = 595.28;
const pageHeight = 841.89;
const lineHeight = 16;

type PdfContext = {
  doc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  boldFont: PDFFont;
  y: number;
};

export type PdfTableColumn<T> = {
  label: string;
  width: number;
  align?: "left" | "right";
  value: (row: T) => string;
};

export async function createPdfContext() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([pageWidth, pageHeight]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  return {
    doc,
    page,
    font,
    boldFont,
    y: pageHeight - pageMargin,
  } satisfies PdfContext;
}

export async function savePdf(ctx: PdfContext) {
  addFooter(ctx);
  return Buffer.from(await ctx.doc.save());
}

export function drawHeader(ctx: PdfContext, title: string, documentNumber: string) {
  drawText(ctx, "FengzLab", pageMargin, ctx.y, 18, true);
  drawText(ctx, "Documento de servicio", pageMargin, ctx.y - 18, 9);
  drawText(ctx, title, 390, ctx.y, 18, true);
  drawText(ctx, documentNumber, 390, ctx.y - 18, 10);
  ctx.y -= 58;
  drawRule(ctx);
}

export function drawSectionTitle(ctx: PdfContext, title: string) {
  ensureSpace(ctx, 36);
  ctx.y -= 8;
  drawText(ctx, title, pageMargin, ctx.y, 12, true);
  ctx.y -= 10;
  drawRule(ctx);
  ctx.y -= 8;
}

export function drawKeyValues(ctx: PdfContext, items: [string, string][], columns = 2) {
  const columnWidth = (pageWidth - pageMargin * 2) / columns;
  const rows = Math.ceil(items.length / columns);

  ensureSpace(ctx, rows * 34 + 8);

  items.forEach(([label, value], index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = pageMargin + column * columnWidth;
    const y = ctx.y - row * 34;

    drawText(ctx, label.toUpperCase(), x, y, 7, true, rgb(0.38, 0.38, 0.42));
    drawWrappedText(ctx, value || "-", x, y - 13, columnWidth - 16, 9);
  });

  ctx.y -= rows * 34 + 6;
}

export function drawParagraph(ctx: PdfContext, text: string, size = 9) {
  const lines = wrapText(ctx, text, pageWidth - pageMargin * 2, size);
  ensureSpace(ctx, lines.length * lineHeight + 8);
  lines.forEach((line) => {
    drawText(ctx, line, pageMargin, ctx.y, size);
    ctx.y -= lineHeight;
  });
}

export function drawTable<T>(ctx: PdfContext, columns: PdfTableColumn<T>[], rows: T[]) {
  const rowHeight = 24;
  const tableWidth = columns.reduce((sum, column) => sum + column.width, 0);

  ensureSpace(ctx, rowHeight * 2);
  drawBox(ctx, pageMargin, ctx.y - rowHeight + 6, tableWidth, rowHeight, rgb(0.95, 0.95, 0.96));

  let x = pageMargin;
  columns.forEach((column) => {
    drawText(ctx, column.label, x + 6, ctx.y - 9, 8, true);
    x += column.width;
  });
  ctx.y -= rowHeight;

  if (rows.length === 0) {
    ensureSpace(ctx, rowHeight);
    drawText(ctx, "Sin lineas registradas.", pageMargin + 6, ctx.y - 9, 9);
    ctx.y -= rowHeight;
    return;
  }

  rows.forEach((row) => {
    ensureSpace(ctx, rowHeight);
    x = pageMargin;
    columns.forEach((column) => {
      const value = truncate(column.value(row), column.width > 180 ? 58 : 18);
      const textWidth = ctx.font.widthOfTextAtSize(value, 8);
      const textX = column.align === "right" ? x + column.width - textWidth - 6 : x + 6;
      drawText(ctx, value, textX, ctx.y - 9, 8);
      x += column.width;
    });
    drawRule(ctx, ctx.y - 18, rgb(0.9, 0.9, 0.92));
    ctx.y -= rowHeight;
  });
}

export function drawTotals(ctx: PdfContext, totals: [string, string][]) {
  const x = 360;
  const width = pageWidth - pageMargin - x;
  ensureSpace(ctx, totals.length * 22 + 8);

  totals.forEach(([label, value], index) => {
    const y = ctx.y - index * 22;
    drawText(ctx, label, x, y, 9, index === totals.length - 1);
    const textWidth = ctx.boldFont.widthOfTextAtSize(value, 10);
    drawText(ctx, value, x + width - textWidth, y, 10, index === totals.length - 1);
  });

  ctx.y -= totals.length * 22 + 8;
}

function addFooter(ctx: PdfContext) {
  const footer = `Generado el ${new Date().toLocaleString("es-CR")} - Documento generado por FengzLab`;
  drawText(ctx, footer, pageMargin, 30, 8, false, rgb(0.45, 0.45, 0.48));
}

function ensureSpace(ctx: PdfContext, required: number) {
  if (ctx.y - required > 56) {
    return;
  }

  addFooter(ctx);
  ctx.page = ctx.doc.addPage([pageWidth, pageHeight]);
  ctx.y = pageHeight - pageMargin;
}

function drawRule(ctx: PdfContext, y = ctx.y, color = rgb(0.82, 0.82, 0.85)) {
  ctx.page.drawLine({
    start: { x: pageMargin, y },
    end: { x: pageWidth - pageMargin, y },
    thickness: 0.7,
    color,
  });
  ctx.y -= 10;
}

function drawBox(ctx: PdfContext, x: number, y: number, width: number, height: number, color: ReturnType<typeof rgb>) {
  ctx.page.drawRectangle({ x, y, width, height, color });
}

function drawText(
  ctx: PdfContext,
  text: string,
  x: number,
  y: number,
  size: number,
  bold = false,
  color = rgb(0.12, 0.12, 0.14),
) {
  ctx.page.drawText(safeText(text), {
    x,
    y,
    size,
    font: bold ? ctx.boldFont : ctx.font,
    color,
  });
}

function drawWrappedText(ctx: PdfContext, text: string, x: number, y: number, width: number, size: number) {
  wrapText(ctx, text, width, size).slice(0, 2).forEach((line, index) => {
    drawText(ctx, line, x, y - index * 11, size);
  });
}

function wrapText(ctx: PdfContext, text: string, maxWidth: number, size: number) {
  const words = safeText(text).split(/\s+/);
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (ctx.font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
      return;
    }

    if (current) {
      lines.push(current);
    }
    current = word;
  });

  if (current) {
    lines.push(current);
  }

  return lines.length > 0 ? lines : [""];
}

function safeText(text: string) {
  return text
    .replace(/[Ã¡Ã Ã¤Ã¢]/gi, "a")
    .replace(/[Ã©Ã¨Ã«Ãª]/gi, "e")
    .replace(/[Ã­Ã¬Ã¯Ã®]/gi, "i")
    .replace(/[Ã³Ã²Ã¶Ã´]/gi, "o")
    .replace(/[ÃºÃ¹Ã¼Ã»]/gi, "u")
    .replace(/Ã±/gi, "n")
    .replace(/[áàäâ]/gi, "a")
    .replace(/[éèëê]/gi, "e")
    .replace(/[íìïî]/gi, "i")
    .replace(/[óòöô]/gi, "o")
    .replace(/[úùüû]/gi, "u")
    .replace(/ñ/gi, "n")
    .replace(/[^\x20-\x7E]/g, "");
}

function truncate(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 3)}...` : value;
}

