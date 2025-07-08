import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign,
  Edit2,
  Check,
  X,
} from "lucide-react";

interface BudgetSummaryProps {
  income: number;
  expenses: number;
  budget: number;
  remaining: number;
  onIncomeClick?: () => void;
  onBudgetChange?: (budget: number) => void;
  onIncomeChange?: (income: number) => void;
}

const BudgetSummary = ({
  income = 5000,
  expenses = 3200,
  budget = 4000,
  remaining = 1800,
  onIncomeClick = () => {},
  onBudgetChange = () => {},
  onIncomeChange = () => {},
}: BudgetSummaryProps) => {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(budget.toString());
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [incomeInput, setIncomeInput] = useState(income.toString());
  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Determine color for remaining budget
  const getRemainingColors = () => {
    if (remaining < 0) {
      return {
        textColor: "text-red-500",
        bgColor: "bg-red-50 dark:bg-red-950",
        iconColor: "text-red-500",
      };
    } else if (remaining < 0.1 * budget) {
      return {
        textColor: "text-yellow-500",
        bgColor: "bg-yellow-50 dark:bg-yellow-950",
        iconColor: "text-yellow-500",
      };
    } else {
      return {
        textColor: "text-green-500",
        bgColor: "bg-green-50 dark:bg-green-950",
        iconColor: "text-green-500",
      };
    }
  };

  const {
    textColor: remainingColor,
    bgColor: remainingBgColor,
    iconColor: remainingIconColor,
  } = getRemainingColors();

  const handleBudgetSave = () => {
    const parsedBudget = parseFloat(budgetInput);
    if (!isNaN(parsedBudget) && parsedBudget >= 0) {
      onBudgetChange(parsedBudget);
      setIsEditingBudget(false);
    }
  };

  const handleBudgetCancel = () => {
    setBudgetInput(budget.toString());
    setIsEditingBudget(false);
  };

  const handleIncomeSave = () => {
    const parsedIncome = parseFloat(incomeInput);
    if (!isNaN(parsedIncome) && parsedIncome >= 0) {
      onIncomeChange(parsedIncome);
      setIsEditingIncome(false);
    }
  };

  const handleIncomeCancel = () => {
    setIncomeInput(income.toString());
    setIsEditingIncome(false);
  };

  return (
    <div className="w-full bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Budget Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Income Card */}
        <Card className="border-0 shadow-sm hover:shadow transition-shadow duration-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Monthly Income
                </p>
                {!isEditingIncome && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIncomeInput(income.toString());
                      setIsEditingIncome(true);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {isEditingIncome ? (
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    type="number"
                    value={incomeInput}
                    onChange={(e) => setIncomeInput(e.target.value)}
                    className="h-8 w-24 text-lg font-bold"
                    min="0"
                    step="0.01"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleIncomeSave}
                    className="h-6 w-6 p-0 text-green-600"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleIncomeCancel}
                    className="h-6 w-6 p-0 text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <h3 className="text-2xl font-bold mt-1">
                  {formatCurrency(income)}
                </h3>
              )}
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <ArrowUpCircle className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Budget Card */}
        <Card className="border-0 shadow-sm hover:shadow transition-shadow duration-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Monthly Budget
                </p>
                {!isEditingBudget && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setBudgetInput(budget.toString());
                      setIsEditingBudget(true);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {isEditingBudget ? (
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    type="number"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    className="h-8 w-24 text-lg font-bold"
                    min="0"
                    step="0.01"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBudgetSave}
                    className="h-6 w-6 p-0 text-green-600"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBudgetCancel}
                    className="h-6 w-6 p-0 text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <h3 className="text-2xl font-bold mt-1">
                  {formatCurrency(budget)}
                </h3>
              )}
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Expenses Card */}
        <Card className="border-0 shadow-sm hover:shadow transition-shadow duration-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Monthly Expenses
              </p>
              <h3 className="text-2xl font-bold mt-1">
                {formatCurrency(expenses)}
              </h3>
            </div>
            <div className="bg-amber-50 p-3 rounded-full">
              <ArrowDownCircle className="h-6 w-6 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        {/* Remaining Budget Card */}
        <Card className="border-0 shadow-sm hover:shadow transition-shadow duration-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Remaining Budget
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${remainingColor}`}>
                {formatCurrency(remaining)}
              </h3>
            </div>
            <div className={`${remainingBgColor} p-3 rounded-full`}>
              <DollarSign className={`h-6 w-6 ${remainingIconColor}`} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BudgetSummary;
