import React, { useState } from "react";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Transaction } from "@/types/supabase";
import { updateExpense } from "@/lib/db";

interface Props {
  category: string;
  expenses: Transaction[];
  onBack: () => void;
  onDeleteExpense: (id: string) => void;
  onExpenseUpdated: (e: Transaction) => void;
}

const CategoryDetails: React.FC<Props> = ({
  category,
  expenses,
  onBack,
  onDeleteExpense,
  onExpenseUpdated,
}) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const startEdit = (ex: Transaction) => {
    setEditing(ex);
    setOpen(true);
  };

  const iso = (d: string | Date) =>
    typeof d === "string" ? d.slice(0, 10) : d.toISOString().slice(0, 10);

  const saveEdit = async () => {
    if (!editing) return;
    const updated = await updateExpense(editing.id, {
      amount: editing.amount,
      description: editing.description,
      category: editing.category,
      date: iso(editing.date),
    });
    onExpenseUpdated({ ...updated, date: new Date(updated.date) });
    setOpen(false);

    if (updated.category !== category) onBack();
  };

  const visible = expenses.filter((e) => e.category === category);

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
          <div key={ex.id} className="border rounded-md p-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="font-semibold">${ex.amount.toFixed(2)}</p>
              {ex.description && (
                <p className="text-muted-foreground text-sm">{ex.description}</p>
              )}
              <p className="text-muted-foreground text-sm">
                {new Date(ex.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            <Button variant="ghost" size="icon" onClick={() => startEdit(ex)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDeleteExpense(ex.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* edit dialog */}
      {editing && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>

          <DialogContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amt">Amount ($)</Label>
                <Input
                  id="amt"
                  type="number"
                  step="0.01"
                  value={editing.amount}
                  onChange={(e) => setEditing({ ...editing, amount: +e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="desc">Description</Label>
                <Input
                  id="desc"
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>

              <div>
                <Label>Category</Label>
                <Select
                  value={editing.category}
                  onValueChange={(v) => setEditing({ ...editing, category: v })}
                >
                  <SelectTrigger />
                  <SelectContent>
                    {["Housing", "Food", "Transportation", "Entertainment", "Utilities", "Other"].map(
                      (c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={iso(editing.date)}
                  onChange={(e) =>
                    setEditing({
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
                <Button onClick={saveEdit}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default CategoryDetails;
