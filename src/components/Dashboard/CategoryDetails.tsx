import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowLeft, Trash2 } from "lucide-react";

interface Expense {
  id: string;
  amount: number;
  category: string;
  date: Date;
}

interface CategoryDetailsProps {
  category?: string;
  expenses?: Expense[];
  onBack?: () => void;
  onDeleteExpense?: (id: string) => void;
}

const CategoryDetails: React.FC<CategoryDetailsProps> = ({
  category = "Food",
  expenses = [
    { id: "1", amount: 45.99, category: "Food", date: new Date(2023, 5, 12) },
    { id: "2", amount: 25.5, category: "Food", date: new Date(2023, 5, 15) },
    { id: "3", amount: 12.99, category: "Food", date: new Date(2023, 5, 18) },
  ],
  onBack = () => {},
  onDeleteExpense = () => {},
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
    <Card className="w-full h-full bg-background">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <CardTitle className="text-xl font-medium">
              {category} Expenses
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {categoryExpenses.length} transactions •{" "}
              {formatCurrency(totalAmount)} total
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {formatCurrency(totalAmount)}
        </Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] rounded-md border">
          <div className="p-4">
            {categoryExpenses.length > 0 ? (
              <div className="space-y-3">
                {categoryExpenses
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime(),
                  )
                  .map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-3 rounded-md border hover:bg-muted transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-lg">
                            {formatCurrency(expense.amount)}
                          </p>
                          <span className="text-sm text-muted-foreground">
                            {format(expense.date, "MMM d, yyyy")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(expense.date, "EEEE 'at' h:mm a")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteExpense(expense.id)}
                        className="hover:bg-destructive/10 ml-2"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  ))}
              </div>
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
      </CardContent>
    </Card>
  );
};

export default CategoryDetails;
