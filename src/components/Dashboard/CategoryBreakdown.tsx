import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { format } from "date-fns";
import { X, Trash2 } from "lucide-react";
import { Transaction } from "@/types/supabase";

interface CategoryBreakdownProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  categoryColor: string;
  expenses: Transaction[];
  onDeleteExpense: (id: string) => void;
}

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  isOpen,
  onClose,
  category,
  categoryColor,
  expenses,
  onDeleteExpense,
}) => {
  const categoryExpenses = expenses.filter(
    (expense) => expense.category === category,
  );
  const totalAmount = categoryExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: categoryColor }}
            />
            <SheetTitle className="text-xl font-medium">
              {category} Expenses
            </SheetTitle>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {formatCurrency(totalAmount)}
          </Badge>
        </SheetHeader>

        <div className="mt-6">
          <p className="text-sm text-muted-foreground mb-4">
            {categoryExpenses.length} transactions
          </p>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-3">
              {categoryExpenses.length > 0 ? (
                categoryExpenses
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime(),
                  )
                  .map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-start justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-lg">
                            {formatCurrency(expense.amount)}
                          </p>
                          <span className="text-sm text-muted-foreground">
                            {format(expense.date, "MMM d, yyyy")}
                          </span>
                        </div>
                        {expense.description && (
                          <p className="text-sm text-foreground mb-1 truncate">
                            {expense.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {format(expense.date, "EEEE 'at' h:mm a")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteExpense(expense.id)}
                        className="hover:bg-destructive/10 ml-2 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  ))
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    No {category.toLowerCase()} expenses
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    No expenses found for this category in the selected period
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CategoryBreakdown;
