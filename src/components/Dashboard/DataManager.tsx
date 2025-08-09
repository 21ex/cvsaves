/* Dashboard/DataManager.tsx – 2025-08-07
   Compact data-tools menu (header icon → dialog). Clears month/全部, exports CSV. */

import React, { useState } from "react";
import { Download, Trash2, Database } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ExpenseRow {
  id: string;
  date: string | Date;
  category: string;
  description: string | null;
  amount: number;
}

interface Props {
  /* all rows (only for CSV) */
  expenses: ExpenseRow[];
  /* async helpers provided by Home ----------------------------------- */
  onClearMonth: () => Promise<void>;
  onClearAll: () => Promise<void>;
}

/* ---------- component ---------- */
const DataManager: React.FC<Props> = ({
  expenses,
  onClearMonth,
  onClearAll,
}) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  /* ---- CSV helper ---- */
  const exportCsv = () => {
    if (busy) return;
    setBusy(true);

    const rows: (string | number)[][] = [
      ["Date", "Category", "Description", "Amount"],
      ...expenses
        .slice()
        .sort(
          (a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime(),
        )
        .map((e) => [
          new Date(e.date).toISOString().slice(0, 10),
          e.category,
          e.description ?? "",
          e.amount.toFixed(2),
        ]),
    ];

    const csv = rows
      .map((r) =>
        r
          .map((f) => `"${String(f).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `cvsaves-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    setBusy(false);
    setOpen(false);
  };

  /* ---- render ---- */
  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
        title="Data tools"
      >
        <Database className="h-5 w-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Data tools</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Button onClick={exportCsv} disabled={busy}>
              <Download className="h-4 w-4 mr-2" />
              Export&nbsp;CSV
            </Button>

            <Button
              variant="outline"
              onClick={async () => {
                if (
                  confirm(
                    "Delete EVERY expense in this month? This cannot be undone.",
                  )
                ) {
                  setBusy(true);
                  await onClearMonth();
                  setBusy(false);
                  setOpen(false);
                }
              }}
              disabled={busy}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear&nbsp;this&nbsp;month
            </Button>

            <Button
              variant="destructive"
              onClick={async () => {
                if (
                  confirm(
                    "Delete **ALL** data (budgets, expenses, categories) for this account? This cannot be undone.",
                  )
                ) {
                  setBusy(true);
                  await onClearAll();
                  setBusy(false);
                  setOpen(false);
                }
              }}
              disabled={busy}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear&nbsp;EVERYTHING
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DataManager;
