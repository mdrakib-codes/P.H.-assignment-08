import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Booking, Studio } from "@/types";

export type InvoiceStudio = Pick<
  Studio,
  | "title"
  | "category"
  | "location"
  | "hourlyRate"
  | "securityDeposit"
  | "ownerName"
  | "ownerEmail"
>;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(date);
}

export function generateInvoice(booking: Booking, studio: InvoiceStudio) {
  const doc = new jsPDF();
  const issuedDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
  }).format(new Date());
  const invoiceNumber = `SS-${booking._id.toUpperCase()}`;
  const billedName = booking.userName || "StudioSpace guest";
  const hourlyRate =
    booking.hours > 0 ? booking.totalPrice / booking.hours : studio.hourlyRate;

  doc.setFillColor(36, 42, 56);
  doc.rect(0, 0, 210, 42, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("StudioSpace", 16, 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Studio booking invoice", 16, 30);

  doc.setTextColor(35, 40, 52);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Invoice", 16, 57);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Invoice number: ${invoiceNumber}`, 16, 67);
  doc.text(`Date issued: ${issuedDate}`, 16, 74);

  doc.setFont("helvetica", "bold");
  doc.text("Billed to", 16, 91);
  doc.text("Host", 110, 91);
  doc.setFont("helvetica", "normal");
  doc.text(doc.splitTextToSize(billedName, 78), 16, 98);
  doc.text(doc.splitTextToSize(booking.userEmail, 78), 16, 105);
  doc.text(doc.splitTextToSize(studio.ownerName, 78), 110, 98);
  doc.text(doc.splitTextToSize(booking.hostEmail || studio.ownerEmail, 78), 110, 105);

  doc.setFont("helvetica", "bold");
  doc.text("Studio and booking", 16, 122);
  doc.setFont("helvetica", "normal");
  doc.text(doc.splitTextToSize(studio.title, 178), 16, 129);
  doc.text(`${studio.category} · ${studio.location}`, 16, 136);
  doc.text(
    `${formatDate(booking.date)} · ${booking.startTime}–${booking.endTime} · ${booking.hours} ${booking.hours === 1 ? "hour" : "hours"}`,
    16,
    143,
  );

  autoTable(doc, {
    startY: 151,
    head: [["Description", "Amount"]],
    body: [
      [`Studio booking (${booking.hours} × ${formatCurrency(hourlyRate)})`, formatCurrency(booking.totalPrice)],
      ["Refundable security deposit (separate)", formatCurrency(studio.securityDeposit)],
      ["Booking total (deposit excluded)", formatCurrency(booking.totalPrice)],
    ],
    theme: "grid",
    headStyles: { fillColor: [36, 42, 56], textColor: [255, 255, 255] },
    styles: { font: "helvetica", fontSize: 10, cellPadding: 3 },
    columnStyles: { 1: { halign: "right", cellWidth: 48 } },
    margin: { left: 16, right: 16 },
  });

  doc.setFontSize(8);
  doc.setTextColor(105, 111, 122);
  doc.text(
    "The refundable security deposit is listed separately and is not included in the booking total above.",
    16,
    264,
  );
  doc.text(`Booking reference: ${booking._id}`, 16, 272);
  doc.text("Thank you for booking with StudioSpace.", 16, 280);

  doc.save(`StudioSpace-Invoice-${booking._id}.pdf`);
}
