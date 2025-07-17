/* src/components/Dashboard/ExpenseManager.tsx
   – fixed version 2025-07-16
*/
import React, { useState } from "react";
import { format } from "date-fns";
import {
  PlusCircle,
  Trash2,
  Calendar as CalendarIcon,
} from "lucide-react";

/* ── shadcn/ui primitives ───────────────────────────── */
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
/* ───────────────────────────────────────────────────── */

import { Transaction } from "@/types/supabase";

/* ---------- types ---------- */
interface Expense extends Transaction { }
interface Props {
  /* budget meta */
  budget: number;
  onBudgetChange: (v: number) => void;

  /* live expense list */
  expenses: Expense[];

  /* add / delete hooks */
  onAddExpense: (e: Omit<Expense, "id">) => void;
  onDeleteExpense: (id: string) => void;

  /* category names provided by Home so it’s always current */
  categories: string[];
}

const ExpenseManager: React.FC<Props> = ({
  budget,
  onBudgetChange,
  expenses,
  onAddExpense,
  onDeleteExpense,
  categories,
}) => {
  /* form state */
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());

  /* edit-budget dialog */
  const [dlgOpen, setDlgOpen] = useState(false);
  const [draftBudg, setDraftBudg] = useState(budget.toString());

  /* ---------- helpers ---------- */
  const resetForm = () => {
    setAmount("");
    setCategory("");
    setDescription("");
    setDate(new Date());
  };

  const handleAdd = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0 || !category || !date) return;
    onAddExpense({ amount: val, category, description, date });
    resetForm();
  };

  /* ---------- UI ---------- */
  return (
    <Card className="w-full h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Expense Manager</CardTitle>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Budget:&nbsp;${budget.toFixed(2)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDraftBudg(budget.toString());
              setDlgOpen(true);
            }}
          >
            <PlusCircle className="h-4 w-4 rotate-45" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* form fields */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amt">Amount</Label>
            <Input
              id="amt"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
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
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
            />
          </div>

          <div>
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Button
          className="w-full"
          disabled={!amount || !category || !date || +amount <= 0}
          onClick={handleAdd}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
        </Button>

        {/* recent list */}
        <div>
          <h3 className="text-sm font-medium mb-2">Recent Expenses</h3>
          <ScrollArea className="h-[200px] rounded-md border">
            <div className="p-4 space-y-3">
              {expenses.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No expenses yet
                </p>
              )}
              {expenses
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime(),
                )
                .map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                  >
                    <div>
                      <p className="font-medium">${ex.amount.toFixed(2)}</p>
                      {ex.description && (
                        <p className="text-sm">{ex.description}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {ex.category}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {format(ex.date, "MMM d, yyyy")}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteExpense(ex.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>

      {/* ===== budget dialog ===== */}
      <Dialog open={dlgOpen} onOpenChange={setDlgOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Adjust budget</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Monthly budget ($)</Label>
            <Input
              value={draftBudg}
              type="number"
              min="0"
              step="0.01"
              onChange={(e) => setDraftBudg(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() => setDlgOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const v = parseFloat(draftBudg);
                if (!isNaN(v) && v >= 0) onBudgetChange(v);
                setDlgOpen(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ExpenseManager;