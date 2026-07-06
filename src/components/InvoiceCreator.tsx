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
import logo from '../coral.png'
import WeekMultiSelect, { isoWeekNumber } from "./weekselect";
import { SelectedWeek } from "./weekselect"
import { table } from "console";

const HOUR_TYPES = [
  { value: "consult", label: "Consultation time", towardsmin: true },
  { value: "train", label: "Training time or info session", towardsmin: true },
  { value: "admin", label: "Admin time outside of prep/post", towardsmin: false },
] as const;

type HourType = (typeof HOUR_TYPES)[number]["value"];

type Row = {
  id: string;
  date: string;
  type: HourType;
  minutes: string;
  notes: string;
};

function round2(n:number):number {
  return Math.round(100*n)/100
}

function newRow(): Row {
  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    type: "consult",
    minutes: "30",
    notes: "",
  };
}

function formatMoney(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "CAD" });
}

export function InvoiceCreator() {
  const placeholdername = "Fiona Lake Waslander"
  const placeholderrate = "120"
  const placeholderaddress = "1172 Sherbrooke St W, Montréal, QC H3A 1H6, Canada"
  document.body.style.zoom = "125%"

  const [invoiceWeeks, setInvoiceWeeks] = useState<SelectedWeek[]>([]);

  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  const [rows, setRows] = useState<Row[]>([newRow()]);
  const [billingaddress, setBillingAddress] = useState("")

  const rateNum = parseFloat(rate) || 120;

  const totals = useMemo(() => {
    let hours = 0;
    let amount = 0;
    for (const r of rows) {
      const h = parseFloat(r.minutes) || 0;
      hours += h / 60;
      amount += h;
    }
    amount = hours * rateNum
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
    var tabley = 185

    doc.setFont("times", "bold");
    doc.setFontSize(28);
    doc.text("INVOICE", 40, 60);

    var mindate = new Date(0);
    rows.forEach((row) => {
      if (new Date(row.date) > mindate) {
        mindate = new Date(row.date)
      }
    })


    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.text(`Date: ${mindate.toLocaleDateString(undefined, { timeZone: 'UTC' })}`, pageWidth - 40, 66, {
      align: "right",
    });
    doc.text(`Rate: ${formatMoney(rateNum)}`, pageWidth - 40, 80, {
      align: "right",
    });



    doc.setFontSize(10);
    doc.setTextColor(120, 90, 100);
    doc.text("FROM", 40, 110);
    doc.setTextColor(30, 20, 25);
    doc.setFontSize(12);
    doc.text(name || placeholdername, 40, 126);

    var ba = billingaddress || placeholderaddress
    if (ba.length < 32) {
      doc.text(ba, 40, 142);
    }
    else {
      var spltspot = ba.indexOf(' ', Math.min(ba.length / 2, 35))
      if (spltspot > 40) {
        var spltspot = ba.slice(0, spltspot).lastIndexOf(' ')
      }
      doc.text(ba.slice(0, spltspot), 40, 142);
      var remaining = ba.slice(spltspot)
      if (remaining.length <= 40) {
        doc.text(remaining, 40, 158);
      }
      else {
        var spltspot = remaining.indexOf(' ', Math.min(remaining.length / 2, 35))
        doc.text(remaining.slice(0, spltspot), 40, 158)
        doc.text(remaining.slice(spltspot), 40, 172)
        tabley += 16
      }

    }


    doc.setFontSize(10);
    doc.setTextColor(120, 90, 100);
    doc.text("BILL TO", pageWidth / 2, 110);
    doc.setTextColor(30, 20, 25);
    doc.setFontSize(12);
    doc.text("Coral Health Inc.", pageWidth / 2, 126);
    doc.text("1172 Sherbrooke St W, Montréal", pageWidth / 2, 142);
    doc.text("QC H3A 1H6, Canada", pageWidth / 2, 158);
    var datecount = 0
    var minhoursextra = 0
    invoiceWeeks.forEach((week) => {
      doc.text('Week ' + isoWeekNumber(week.end) + ' (' + week.start.toLocaleDateString() + ' - ' + week.end.toLocaleDateString() + ')', 40, tabley + 10)
      doc.text(`Minimum Guaranteed Hours: ${week.minimumhours}`, pageWidth - 40, tabley + 10, {
        align: "right",
      });

      var hours: Record<string, number> = { 'consult': 0, 'train': 0, 'admin': 0 }
      rows.forEach((row) => {
        var date = new Date(row.date)
        var day = date.getUTCDate()
        var month = date.getUTCMonth()
        var year = date.getUTCFullYear()
        date.setDate(day)
        date.setMonth(month)
        date.setFullYear(year)
        if (date >= week.start && date <= week.end) {
          datecount++;
          hours[row.type] += parseFloat(row.minutes)/60;
        }
      })

      hours['consult'] = round2(hours['consult'])
      hours['admin'] = round2(hours['admin'])
      hours['train'] = round2(hours['train'])

      var tabledata = [["Consultation Time",hours['consult']], 
        ["Admin time outside of prep/post",hours['admin']],
      ["Training time or info session", hours['train']]]

      var hoursum = hours['consult']+hours['admin']+hours['train']

      if (hours['consult']+hours['train'] < week.minimumhours) {
        tabledata.push(["Additional hours from minimum guarantee", week.minimumhours-(hours['consult']+hours['train'])])
        minhoursextra += week.minimumhours-(hours['consult']+hours['train'])
        hoursum += week.minimumhours-(hours['consult']+hours['train'])
      }

      autoTable(doc, {
        startY: tabley + 15,
        head: [["Type", "Hours"]],
        body: tabledata,
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
      doc.text(`Total: ${hoursum}`,pageWidth-40, finalY+12, {"align":"right"})
      tabley = finalY + 30
    })

    if (datecount != rows.length) {
      window.alert("ERROR! Some dates selected aren't included in any of the weeks selected. Please select more weeks.");
      return

    }


    var tabledata = rows.map((r) => {
        const h = Math.round(parseFloat(r.minutes) / 60 * 100) / 100 || 0;
        const t = HOUR_TYPES.find((x) => x.value === r.type);
        const effectiveRate = rateNum;
        return [
          r.date,
          t?.label ?? r.type,
          r.notes,
          h.toString(),
          formatMoney(h * effectiveRate),
        ];
      })
    
    if (minhoursextra > 0) {
      tabledata.push(["","Additional hours from minimum guarantee","",minhoursextra.toString(),      formatMoney(rateNum*minhoursextra)])
    } 
    autoTable(doc, {
      startY: tabley + 30,
      head: [["Date", "Type", "Description", "Hours", "Amount"]],
      body: tabledata,
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
    doc.text(`Total hours: ${Math.round(100*(totals.hours+minhoursextra))/100}`, pageWidth - 40, finalY + 30, {
      align: "right",
    });
    doc.setFontSize(16);
    doc.text(`Total: ${formatMoney(totals.amount+minhoursextra*rateNum)}`, pageWidth - 40, finalY + 54, {
      align: "right",
    });

    doc.save(`Invoice_${mindate.toLocaleDateString(undefined, { timeZone: 'UTC' })}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <header className="mb-10 border-b border-border pb-8">
          <img src={logo} width="100" />
          <h1 className="mt-2 font-serif text-5xl font-bold tracking-tight">
            Invoice Creator
          </h1>
          <p className="mt-3 text-muted-foreground">
            For NPs - create an invoice automatically + download a PDF.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={placeholdername}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate">Hourly rate (CAD)</Label>
            <Input
              id="rate"
              type="number"
              inputMode="decimal"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder={placeholderrate}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="addr">Address</Label>
            <Input
              id="billdress"
              value={billingaddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              placeholder={placeholderaddress}
            />
          </div>

        </section>
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="font-serif text-2xl font-semibold">Weeks</h2>
              <p className="text-sm text-muted-foreground">
                Select the weeks the invoice is for.
              </p>
            </div>
          </div>
          <div
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <WeekMultiSelect
              onChange={(ids, weeks) => setInvoiceWeeks(weeks)}
            >

            </WeekMultiSelect>
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

          <div
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >

            <div className="space-y-3">
              {rows.map((row, idx) => (
                <div>
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
                        Minutes
                      </Label>
                      <Input
                        type="number"
                        inputMode="decimal"
                        value={row.minutes}
                        onChange={(e) => updateRow(row.id, { minutes: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="md:col-span-5">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        Description
                      </Label>
                      <Textarea
                        rows={1}
                        value={row.notes}
                        onChange={(e) => updateRow(row.id, { notes: e.target.value })}
                        placeholder=""
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
          </div>
        </section>

        <section className="mt-10 flex flex-col items-end gap-6 rounded-2xl border border-border bg-accent/40 p-6">
          <div className="text-right">
            <p className="text-lg uppercase tracking-widest text-muted-foreground">
              Total hours
            </p>
            <p className="font-serif text-4xl">{Math.round(totals.hours*100)/100}</p>
          </div>
          <div className="text-right">
            <p className="text-lg uppercase tracking-widest text-muted-foreground">
              Total due
            </p>
            <p className="font-serif text-4xl font-bold text-primary">
              {formatMoney(rateNum*totals.hours)}
            </p>
          </div>
          <div className="text-right">
            <Button size="lg" onClick={generatePdf} className="mt-2">
              <FileDown className="mr-2 h-5 w-5" /> Generate Invoice
            </Button>
          </div>
        </section>

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          AI disclaimer - this page was generated using AI and edited by a human.
        </footer>
        <footer className="mt-0 text-center text-xs text-muted-foreground">
          ©2026 Nicholas Waslander
        </footer>
      </div>
    </div>
  );
}