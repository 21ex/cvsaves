import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { CalendarIcon, PlusCircle, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Transaction } from "@/types/supabase";

interface Expense extends Transaction {}

interface ExpenseManagerProps {
  budget?: number;
  onBudgetChange?: (budget: number) => void;
  expenses?: Expense[];
  onAddExpense?: (expense: Omit<Expense, "id">) => void;
  onDeleteExpense?: (id: string) => void;
}

const ExpenseManager: React.FC<ExpenseManagerProps> = ({
  budget = 1000,
  onBudgetChange = () => {},
  expenses = [
    { id: "1", amount: 45.99, category: "Food", date: new Date(2023, 5, 12) },
    {
      id: "2",
      amount: 120,
      category: "Transportation",
      date: new Date(2023, 5, 15),
    },
    {
      id: "3",
      amount: 65.5,
      category: "Entertainment",
      date: new Date(2023, 5, 18),
    },
  ],
  onAddExpense = () => {},
  onDeleteExpense = () => {},
}) => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [newBudget, setNewBudget] = useState(budget.toString());

  const categories = [
    "Food",
    "Transportation",
    "Entertainment",
    "Housing",
    "Utilities",
    "Healthcare",
    "Shopping",
    "Other",
  ];

  const handleAddExpense = () => {
    if (!amount || !category || !date) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    onAddExpense({
      amount: parsedAmount,
      category,
      description,
      date,
    });

    // Reset form
    setAmount("");
    setCategory("");
    setDescription("");
    setDate(new Date());
  };

  const handleBudgetSave = () => {
    const parsedBudget = parseFloat(newBudget);
    if (!isNaN(parsedBudget) && parsedBudget >= 0) {
      onBudgetChange(parsedBudget);
      setIsBudgetDialogOpen(false);
    }
  };

  return (
    <Card className="w-full h-full bg-background">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-medium">Expense Manager</CardTitle>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Budget: ${budget.toFixed(2)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setNewBudget(budget.toString());
              setIsBudgetDialogOpen(true);
            }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                type="text"
                placeholder="Coffee at Starbucks"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
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
            onClick={handleAddExpense}
            disabled={!amount || !category || !date || parseFloat(amount) <= 0}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
          </Button>

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Recent Expenses</h3>
            <ScrollArea className="h-[200px] rounded-md border">
              <div className="p-4">
                {expenses.length > 0 ? (
                  <ul className="space-y-3">
                    {expenses
                      .sort(
                        (a, b) =>
                          new Date(b.date).getTime() -
                          new Date(a.date).getTime(),
                      )
                      .map((expense) => (
                        <li
                          key={expense.id}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                        >
                          <div>
                            <p className="font-medium">
                              ${expense.amount.toFixed(2)}
                            </p>
                            {expense.description && (
                              <p className="text-sm text-foreground">
                                {expense.description}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              {expense.category}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground mr-2">
                              {format(expense.date, "MMM d, yyyy")}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteExpense(expense.id)}
                              className="hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No expenses yet
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>

      <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Budget</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="budget">Monthly Budget</Label>
            <Input
              id="budget"
              type="number"
              min="0"
              step="0.01"
              value={newBudget}
              onChange={(e) => setNewBudget(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBudgetDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleBudgetSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ExpenseManager;
