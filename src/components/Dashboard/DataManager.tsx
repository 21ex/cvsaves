import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Trash2,
  Download,
  Upload,
  RotateCcw,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface Expense {
  id: string;
  amount: number;
  category: string;
  date: Date;
}

interface DataManagerProps {
  expenses?: Expense[];
  monthlyIncome?: number;
  monthlyBudget?: number;
  onClearAllData?: () => void;
  onClearExpenses?: () => void;
  onExportData?: () => void;
  onImportData?: (data: any) => void;
}

const DataManager: React.FC<DataManagerProps> = ({
  expenses = [],
  monthlyIncome = 5000,
  monthlyBudget = 4000,
  onClearAllData = () => {},
  onClearExpenses = () => {},
  onExportData = () => {},
  onImportData = () => {},
}) => {
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [showClearExpensesDialog, setShowClearExpensesDialog] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleExportData = () => {
    const data = {
      expenses: expenses,
      monthlyIncome,
      monthlyBudget,
      exportDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `budget-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onExportData();
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        onImportData(data);
      } catch (error) {
        console.error("Error importing data:", error);
      }
    };
    reader.readAsText(file);

    // Reset the input
    event.target.value = "";
  };

  return (
    <>
      <Card className="w-full bg-background">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-medium">
                  Data Tools
                </CardTitle>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Export Data */}
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="flex items-center justify-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Data</span>
                </Button>

                {/* Import Data */}
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Import Data</span>
                  </Button>
                </div>

                {/* Clear Expenses */}
                <Button
                  variant="outline"
                  onClick={() => setShowClearExpensesDialog(true)}
                  className="flex items-center justify-center space-x-2"
                  disabled={expenses.length === 0}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Clear Expenses</span>
                </Button>

                {/* Clear All Data */}
                <Button
                  variant="destructive"
                  onClick={() => setShowClearAllDialog(true)}
                  className="flex items-center justify-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear All Data</span>
                </Button>
              </div>

              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  <strong>Data Summary:</strong> {expenses.length} expenses •
                  Income: ${monthlyIncome.toFixed(2)} • Budget: $
                  {monthlyBudget.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Clear All Data Dialog */}
      <AlertDialog
        open={showClearAllDialog}
        onOpenChange={setShowClearAllDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Data</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your expenses, income, and budget
              settings. This action cannot be undone. Consider exporting your
              data first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onClearAllData();
                setShowClearAllDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Expenses Dialog */}
      <AlertDialog
        open={showClearExpensesDialog}
        onOpenChange={setShowClearExpensesDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Expenses</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your expense records. Your income
              and budget settings will be preserved. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onClearExpenses();
                setShowClearExpensesDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear Expenses
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DataManager;
