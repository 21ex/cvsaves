import React, { useState, useEffect } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Toaster } from "./ui/toaster";
import { useToast } from "./ui/use-toast";
import BudgetSummary from "./Dashboard/BudgetSummary";
import SpendingChart from "./Dashboard/SpendingChart";
import ExpenseManager from "./Dashboard/ExpenseManager";

import MonthSelector from "./Dashboard/MonthSelector";
import CategoryDetails from "./Dashboard/CategoryDetails";
import CategoryBreakdown from "./Dashboard/CategoryBreakdown";
import DataManager from "./Dashboard/DataManager";
import {
  Transaction,
  Category,
  MonthData,
  MonthlyData,
} from "@/types/supabase";

interface Expense extends Transaction {}

interface SpendingCategory {
  name: string;
  amount: number;
  color: string;
}

const Home = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [monthlyData, setMonthlyData] = useState<MonthlyData>({});
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { name: "Food", color: "#FF6384" },
    { name: "Transportation", color: "#36A2EB" },
    { name: "Entertainment", color: "#FFCE56" },
    { name: "Housing", color: "#4BC0C0" },
    { name: "Utilities", color: "#9966FF" },
    { name: "Healthcare", color: "#FF9F40" },
    { name: "Shopping", color: "#C9CBCF" },
    { name: "Other", color: "#36A2EB" },
  ]);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString("default", { month: "long" }),
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(false);
  const { toast } = useToast();

  // Get current month key
  const currentMonthKey = `${selectedYear}-${String(new Date(Date.parse(selectedMonth + " 1, 2000")).getMonth() + 1).padStart(2, "0")}`;

  // Get current month data with defaults
  const currentMonthData = monthlyData[currentMonthKey] || {
    income: 5000,
    budget: 4000,
  };

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("budgetApp_darkMode");
    const savedMonthlyData = localStorage.getItem("budgetApp_monthlyData");
    const savedExpenses = localStorage.getItem("budgetApp_expenses");
    const savedCategories = localStorage.getItem("budgetApp_categories");

    if (savedDarkMode) {
      const isDark = JSON.parse(savedDarkMode);
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add("dark");
      }
    }
    if (savedMonthlyData) setMonthlyData(JSON.parse(savedMonthlyData));
    if (savedCategories) setCategories(JSON.parse(savedCategories));
    if (savedExpenses) {
      const parsedExpenses = JSON.parse(savedExpenses).map((expense: any) => ({
        ...expense,
        date: new Date(expense.date),
      }));
      setExpenses(parsedExpenses);
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("budgetApp_darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("budgetApp_monthlyData", JSON.stringify(monthlyData));
  }, [monthlyData]);

  useEffect(() => {
    localStorage.setItem("budgetApp_categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("budgetApp_expenses", JSON.stringify(expenses));
  }, [expenses]);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    toast({
      title: `Switched to ${newDarkMode ? "dark" : "light"} mode`,
      description: "Theme preference saved",
    });
  };

  const handleAddExpense = (expense: Omit<Expense, "id">) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setExpenses((prev) => [newExpense, ...prev]);
    toast({
      title: "Expense added",
      description: `Added ${expense.amount.toFixed(2)} for ${expense.category}`,
    });
  };

  const handleDeleteExpense = (id: string) => {
    const expenseToDelete = expenses.find((e) => e.id === id);
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    if (expenseToDelete) {
      toast({
        title: "Expense deleted",
        description: `Removed ${expenseToDelete.amount.toFixed(2)} expense`,
      });
    }
  };

  const handleBudgetChange = (newBudget: number) => {
    setMonthlyData((prev) => ({
      ...prev,
      [currentMonthKey]: {
        ...currentMonthData,
        budget: newBudget,
      },
    }));
    toast({
      title: "Budget updated",
      description: `Monthly budget set to ${newBudget.toFixed(2)}`,
    });
  };

  const handleIncomeChange = (newIncome: number) => {
    setMonthlyData((prev) => ({
      ...prev,
      [currentMonthKey]: {
        ...currentMonthData,
        income: newIncome,
      },
    }));
    toast({
      title: "Income updated",
      description: `Monthly income set to ${newIncome.toFixed(2)}`,
    });
  };

  const handleCategoryColorChange = (categoryName: string, color: string) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.name === categoryName ? { ...cat, color } : cat)),
    );
    toast({
      title: "Category color updated",
      description: `${categoryName} color changed`,
    });
  };

  const handleMonthChange = (month: string, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    toast({
      title: "Month changed",
      description: `Viewing ${month} ${year}`,
    });
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setShowCategoryBreakdown(true);
  };

  const handleBackToOverview = () => {
    setSelectedCategory(null);
  };

  const handleCloseCategoryBreakdown = () => {
    setShowCategoryBreakdown(false);
    setSelectedCategory(null);
  };

  const handleClearAllData = () => {
    setExpenses([]);
    setMonthlyData({});
    localStorage.removeItem("budgetApp_expenses");
    localStorage.removeItem("budgetApp_monthlyData");
    toast({
      title: "All data cleared",
      description: "All expenses, income, and budget data has been reset",
    });
  };

  const handleClearExpenses = () => {
    setExpenses([]);
    localStorage.removeItem("budgetApp_expenses");
    toast({
      title: "Expenses cleared",
      description: "All expense records have been deleted",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Data exported",
      description: "Your budget data has been downloaded",
    });
  };

  const handleImportData = (data: any) => {
    try {
      if (data.expenses) {
        const importedExpenses = data.expenses.map((expense: any) => ({
          ...expense,
          date: new Date(expense.date),
        }));
        setExpenses(importedExpenses);
      }
      if (data.monthlyData) setMonthlyData(data.monthlyData);
      if (data.categories) setCategories(data.categories);
      // Legacy support
      if (data.monthlyIncome || data.monthlyBudget) {
        setMonthlyData((prev) => ({
          ...prev,
          [currentMonthKey]: {
            income: data.monthlyIncome || currentMonthData.income,
            budget: data.monthlyBudget || currentMonthData.budget,
          },
        }));
      }

      toast({
        title: "Data imported",
        description: "Your budget data has been successfully imported",
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description: "There was an error importing your data",
        variant: "destructive",
      });
    }
  };

  // Filter expenses by selected month and year
  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    const expenseMonth = expenseDate.toLocaleString("default", {
      month: "long",
    });
    const expenseYear = expenseDate.getFullYear();
    return expenseMonth === selectedMonth && expenseYear === selectedYear;
  });

  // Calculate totals for selected month
  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const remainingBudget = currentMonthData.budget - totalExpenses;

  // Calculate spending by category for the chart (filtered by month)
  const spendingByCategory = filteredExpenses.reduce((acc, expense) => {
    const existing = acc.find((cat) => cat.name === expense.category);
    if (existing) {
      existing.amount += expense.amount;
    } else {
      const categoryColor =
        categories.find((cat) => cat.name === expense.category)?.color ||
        "#C9CBCF";
      acc.push({
        name: expense.category,
        amount: expense.amount,
        color: categoryColor,
      });
    }
    return acc;
  }, [] as SpendingCategory[]);

  // Get selected category color
  const selectedCategoryColor =
    categories.find((cat) => cat.name === selectedCategory)?.color || "#C9CBCF";

  return (
    <div
      className={`min-h-screen bg-background transition-colors duration-300`}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">CVSavesTooMuch</h1>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>
        </header>

        {/* Month Selector */}
        <section className="mb-8">
          <MonthSelector
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={handleMonthChange}
          />
        </section>

        {/* Budget Summary Cards */}
        <section className="mb-8">
          <BudgetSummary
            income={currentMonthData.income}
            budget={currentMonthData.budget}
            expenses={totalExpenses}
            remaining={remainingBudget}
            onIncomeClick={() => {}}
            onBudgetChange={handleBudgetChange}
            onIncomeChange={handleIncomeChange}
          />
        </section>

        {selectedCategory ? (
          /* Category Details View */
          <section>
            <CategoryDetails
              category={selectedCategory}
              expenses={filteredExpenses}
              onBack={handleBackToOverview}
              onDeleteExpense={handleDeleteExpense}
            />
          </section>
        ) : (
          /* Main Content - Chart and Expense Manager */
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Spending Chart */}
              <section>
                <SpendingChart
                  categories={spendingByCategory}
                  totalSpending={totalExpenses}
                  budget={currentMonthData.budget}
                  onCategoryClick={handleCategoryClick}
                  onCategoryColorChange={handleCategoryColorChange}
                />
              </section>

              {/* Expense Manager */}
              <section>
                <ExpenseManager
                  budget={currentMonthData.budget}
                  onBudgetChange={handleBudgetChange}
                  expenses={filteredExpenses}
                  onAddExpense={handleAddExpense}
                  onDeleteExpense={handleDeleteExpense}
                />
              </section>
            </div>
            {/* Additional Management Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Data Manager */}
              <section>
                <DataManager
                  expenses={expenses}
                  monthlyIncome={currentMonthData.income}
                  monthlyBudget={currentMonthData.budget}
                  onClearAllData={handleClearAllData}
                  onClearExpenses={handleClearExpenses}
                  onExportData={handleExportData}
                  onImportData={handleImportData}
                />
              </section>
            </div>
          </>
        )}

        {/* Category Breakdown Fly-out */}
        {selectedCategory && (
          <CategoryBreakdown
            isOpen={showCategoryBreakdown}
            onClose={handleCloseCategoryBreakdown}
            category={selectedCategory}
            categoryColor={selectedCategoryColor}
            expenses={filteredExpenses}
            onDeleteExpense={handleDeleteExpense}
          />
        )}
      </div>
      <Toaster />
    </div>
  );
};

export default Home;
