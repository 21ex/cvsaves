import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Edit2, DollarSign } from "lucide-react";

interface IncomeManagerProps {
  monthlyIncome?: number;
  onIncomeChange?: (income: number) => void;
}

const IncomeManager: React.FC<IncomeManagerProps> = ({
  monthlyIncome = 5000,
  onIncomeChange = () => {},
}) => {
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [newIncome, setNewIncome] = useState(monthlyIncome.toString());

  const handleIncomeSave = () => {
    const parsedIncome = parseFloat(newIncome);
    if (!isNaN(parsedIncome) && parsedIncome >= 0) {
      onIncomeChange(parsedIncome);
      setIsIncomeDialogOpen(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <>
      <Card className="w-full bg-background">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-medium">Monthly Income</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setNewIncome(monthlyIncome.toString());
              setIsIncomeDialogOpen(true);
            }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="bg-green-50 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {formatCurrency(monthlyIncome)}
              </p>
              <p className="text-sm text-muted-foreground">
                Current monthly income
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Monthly Income</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="income">Monthly Income</Label>
            <Input
              id="income"
              type="number"
              min="0"
              step="0.01"
              value={newIncome}
              onChange={(e) => setNewIncome(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsIncomeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleIncomeSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IncomeManager;
