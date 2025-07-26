/* src/components/Dashboard/CategoryDetails.tsx
   – date-shift fix (2025-07-17)                                        */

import React, { useState } from "react";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { Transaction } from "@/types/supabase";
import { updateExpense } from "@/lib/db";

/* ---------- props ---------- */
interface Props {
  category: string;
  expenses: Transaction[];
  categories: string[];
  onBack: () => void;
  onDeleteExpense: (id: string) => void;
  onExpenseUpdated: (exp: Transaction) => void;
}

const CategoryDetails: React.FC<Props> = ({
  category,
  expenses,
  categories,
  onBack,
  onDeleteExpense,
  onExpenseUpdated,
}) => {
  const [open, setOpen] = useState(false);
  const [editing, setEdit] = useState<Transaction | null>(null);

  const iso = (d: string | Date) =>
    typeof d === "string" ? d.slice(0, 10) : d.toISOString().slice(0, 10);

  /* ----- edit helpers ----- */
  const startEdit = (ex: Transaction) => {
    setEdit(ex);
    setOpen(true);
  };

  const save = async () => {
    if (!editing) return;
    const updated = await updateExpense(editing.id, {
      amount: editing.amount,
      description: editing.description,
      category: editing.category,
      date: iso(editing.date),
    });
    /* ░░  local-midnight parse so the UI shows correct day instantly ░░ */
    onExpenseUpdated({
      ...updated,
      date: new Date(updated.date + "T00:00:00"),
    });
    setOpen(false);
    if (updated.category !== category) onBack();
  };

  const visible = expenses.filter((e) => e.category === category);

  /* ---------- render ---------- */
  return (
    <>
      {/* header */}
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">{category} Expenses</h2>
        <span className="ml-auto rounded-md bg-muted px-3 py-1 text-sm font-medium">
          {visible.length} transactions • $
          {visible.reduce((s, e) => s + e.amount, 0).toFixed(2)} total
        </span>
      </div>

      {/* list */}
      <div className="space-y-4">
        {visible.map((ex) => (
          <div
            key={ex.id}
            className="border rounded-md p-4 flex items-center gap-4"
          >
            <div className="flex-1">
              <p className="font-semibold">${ex.amount.toFixed(2)}</p>
              {ex.description && (
                <p className="text-muted-foreground text-sm">
                  {ex.description}
                </p>
              )}
              <p className="text-muted-foreground text-sm">
                {new Date(ex.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => startEdit(ex)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteExpense(ex.id)}
              className="hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* edit dialog */}
      {editing && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Edit Expense</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* amount */}
              <div>
                <Label>Amount ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editing.amount}
                  onChange={(e) =>
                    setEdit({ ...editing, amount: +e.target.value })
                  }
                />
              </div>

              {/* description */}
              <div>
                <Label>Description</Label>
                <Input
                  value={editing.description ?? ""}
                  onChange={(e) =>
                    setEdit({ ...editing, description: e.target.value })
                  }
                />
              </div>

              {/* category */}
              <div>
                <Label>Category</Label>
                <Select
                  value={editing.category}
                  onValueChange={(v) => setEdit({ ...editing, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* date */}
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={iso(editing.date)}
                  onChange={(e) =>
                    setEdit({
                      ...editing,
                      date: new Date(e.target.value).toISOString(),
                    })
                  }
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={save}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default CategoryDetails;
