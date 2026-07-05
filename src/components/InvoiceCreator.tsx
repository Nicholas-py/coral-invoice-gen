import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Plus, Trash2, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HOUR_TYPES = [
  { value: "regular", label: "Regular", rateMultiplier: 1 },
  { value: "overtime", label: "Overtime (1.5x)", rateMultiplier: 1.5 },
  { value: "weekend", label: "Weekend (2x)", rateMultiplier: 2 },
  { value: "holiday", label: "Holiday (2.5x)", rateMultiplier: 2.5 },
  { value: "travel", label: "Travel", rateMultiplier: 1 },
] as const;

type HourType = (typeof HOUR_TYPES)[number]["value"];

type Row = {
  id: string;
  date: string;
  type: HourType;
  hours: string;
  notes: string;
};

function newRow(): Row {
  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    type: "regular",
    hours: "",
    notes: "",
  };
}

function formatMoney(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export function InvoiceCreator() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [clientName, setClientName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState(
    `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
  );
  const [rate, setRate] = useState("");
  const [rows, setRows] = useState<Row[]>([newRow()]);

  const rateNum = parseFloat(rate) || 0;

  const totals = useMemo(() => {
    let hours = 0;
    let amount = 0;
    for (const r of rows) {
      const h = parseFloat(r.hours) || 0;
      const mult = HOUR_TYPES.find((t) => t.value === r.type)?.rateMultiplier ?? 1;
      hours += h;
      amount += h * rateNum * mult;
    }
    return { hours, amount };
  }, [rows, rateNum]);

  const updateRow = (id: string, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, newRow()]);
  const removeRow = (id: string) =>
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((r) => r.id !== id)));

  const generatePdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFont("times", "bold");
    doc.setFontSize(28);
    doc.text("INVOICE", 40, 60);

    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.text(`Invoice #: ${invoiceNumber}`, pageWidth - 40, 50, { align: "right" });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 40, 66, {
      align: "right",
    });

    doc.setFontSize(10);
    doc.setTextColor(120, 90, 100);
    doc.text("FROM", 40, 110);
    doc.setTextColor(30, 20, 25);
    doc.setFontSize(12);
    doc.text(name || "—", 40, 126);
    if (company) doc.text(company, 40, 142);

    doc.setFontSize(10);
    doc.setTextColor(120, 90, 100);
    doc.text("BILL TO", pageWidth / 2, 110);
    doc.setTextColor(30, 20, 25);
    doc.setFontSize(12);
    doc.text(clientName || "—", pageWidth / 2, 126);

    autoTable(doc, {
      startY: 170,
      head: [["Date", "Type", "Notes", "Hours", "Rate", "Amount"]],
      body: rows.map((r) => {
        const h = parseFloat(r.hours) || 0;
        const t = HOUR_TYPES.find((x) => x.value === r.type);
        const effectiveRate = rateNum * (t?.rateMultiplier ?? 1);
        return [
          r.date,
          t?.label ?? r.type,
          r.notes,
          h.toString(),
          formatMoney(effectiveRate),
          formatMoney(h * effectiveRate),
        ];
      }),
      styles: { font: "times", fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [232, 197, 208], textColor: [60, 30, 40] },
      alternateRowStyles: { fillColor: [252, 244, 247] },
      columnStyles: {
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
      },
    });

    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } })
      .lastAutoTable.finalY;
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.text(`Total hours: ${totals.hours}`, pageWidth - 40, finalY + 30, {
      align: "right",
    });
    doc.setFontSize(16);
    doc.text(`Total: ${formatMoney(totals.amount)}`, pageWidth - 40, finalY + 54, {
      align: "right",
    });

    doc.save(`${invoiceNumber}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <header className="mb-10 border-b border-border pb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Invoice</p>
          <h1 className="mt-2 font-serif text-5xl font-bold tracking-tight">
            Create an Invoice
          </h1>
          <p className="mt-3 text-muted-foreground">
            Add your details, log your hours, and export a polished PDF.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company (optional)</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Doe Consulting"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client">Bill to</Label>
            <Input
              id="client"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Client name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoice">Invoice #</Label>
            <Input
              id="invoice"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="rate">Hourly rate (USD)</Label>
            <Input
              id="rate"
              type="number"
              inputMode="decimal"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="75"
            />
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="font-serif text-2xl font-semibold">Hours</h2>
              <p className="text-sm text-muted-foreground">
                Add a row for each work session.
              </p>
            </div>
            <Button onClick={addRow} variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Add row
            </Button>
          </div>

          <div className="space-y-3">
            {rows.map((row, idx) => (
              <div
                key={row.id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                  <div className="md:col-span-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Date
                    </Label>
                    <Input
                      type="date"
                      value={row.date}
                      onChange={(e) => updateRow(row.id, { date: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Type
                    </Label>
                    <Select
                      value={row.type}
                      onValueChange={(v) => updateRow(row.id, { type: v as HourType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {HOUR_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-1">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Hrs
                    </Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={row.hours}
                      onChange={(e) => updateRow(row.id, { hours: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="md:col-span-5">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Notes
                    </Label>
                    <Textarea
                      rows={1}
                      value={row.notes}
                      onChange={(e) => updateRow(row.id, { notes: e.target.value })}
                      placeholder="What did you work on?"
                      className="min-h-[40px] resize-none"
                    />
                  </div>
                  <div className="flex items-end justify-end md:col-span-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length === 1}
                      aria-label={`Remove row ${idx + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 flex flex-col items-end gap-6 rounded-2xl border border-border bg-accent/40 p-6">
          <div className="text-right">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">
              Total hours
            </p>
            <p className="font-serif text-2xl">{totals.hours}</p>
          </div>
          <div className="text-right">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">
              Total due
            </p>
            <p className="font-serif text-4xl font-bold text-primary">
              {formatMoney(totals.amount)}
            </p>
          </div>
          <Button size="lg" onClick={generatePdf} className="mt-2">
            <FileDown className="mr-2 h-5 w-5" /> Generate PDF
          </Button>
        </section>

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          Everything stays in your browser — nothing is uploaded.
        </footer>
      </div>
    </div>
  );
}