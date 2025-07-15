import React, { useState, useEffect } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Toaster } from "./ui/toaster";
import { useToast } from "./ui/use-toast";

import BudgetSummary     from "./Dashboard/BudgetSummary";
import SpendingChart     from "./Dashboard/SpendingChart";
import ExpenseManager    from "./Dashboard/ExpenseManager";
import MonthSelector     from "./Dashboard/MonthSelector";
import CategoryDetails   from "./Dashboard/CategoryDetails";
import CategoryBreakdown from "./Dashboard/CategoryBreakdown";
import DataManager       from "./Dashboard/DataManager";

import { useSessionContext } from "@supabase/auth-helpers-react";
import {
  getExpenses,
  addExpense,
  deleteExpense,
  getMonthlyMeta,
  upsertMonthlyMeta,
  getUserCategories,
  insertDefaultCategories,
  updateCategoryColor,
  UserCategoryRow,
} from "@/lib/db";

import { Transaction } from "@/types/supabase";

/* ---------- types ---------- */
interface Expense extends Transaction {}
interface SpendingCategory {
  name: string;
  amount: number;
  color: string;
}

const Home: React.FC = () => {
  const { session } = useSessionContext();
  const { toast }   = useToast();

  /* ---------- state ---------- */
  const [darkMode, setDarkMode] = useState(false);

  const [meta, setMeta] = useState<{ income: number; budget: number }>({
    income: 0,
    budget: 0,
  });

  const [expenses,   setExpenses]   = useState<Expense[]>([]);
  const [categories, setCategories] = useState<UserCategoryRow[]>([]);

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString("default", { month: "long" }),
  );
  const [selectedYear,  setSelectedYear]  = useState(new Date().getFullYear());

  const [selectedCategory,      setSelectedCategory]      = useState<string | null>(null);
  const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(false);

  /* month key like “2025-07” */
  const monthKey = `${selectedYear}-${String(
    new Date(Date.parse(`${selectedMonth} 1, 2000`)).getMonth() + 1,
  ).padStart(2, "0")}`;

  /* ---------- first-run: dark-mode ---------- */
  useEffect(() => {
    const stored = localStorage.getItem("budgetApp_darkMode");
    if (stored) {
      const isDark = JSON.parse(stored);
      setDarkMode(isDark);
      document.documentElement.classList.toggle("dark", isDark);
    }
  }, []);

  /* ---------- load categories ---------- */
  useEffect(() => {
    if (!session) return;
    (async () => {
      try {
        let rows = await getUserCategories(session.user.id);
        if (!rows.length) {
          await insertDefaultCategories(session.user.id);
          rows = await getUserCategories(session.user.id);
        }
        setCategories(rows);
      } catch (e: any) {
        toast({
          title: "Load categories failed",
          description: e.message,
          variant: "destructive",
        });
      }
    })();
  }, [session]);

  /* ---------- load meta ---------- */
  useEffect(() => {
    if (!session) return;
    (async () => {
      try {
        const row = await getMonthlyMeta(session.user.id, monthKey);
        setMeta(row ?? { income: 0, budget: 0 });
      } catch (e: any) {
        console.error("fetch meta:", e.message);
      }
    })();
  }, [session, monthKey]);

  /* ---------- load expenses ---------- */
  useEffect(() => {
    if (!session) return;
    (async () => {
      try {
        const data = await getExpenses(session.user.id, monthKey);
        setExpenses(data.map((e: any) => ({ ...e, date: new Date(e.date) })));
      } catch (e: any) {
        console.error("fetch expenses:", e.message);
      }
    })();
  }, [session, monthKey]);

  /* ---------- persist dark-mode ---------- */
  useEffect(() => {
    localStorage.setItem("budgetApp_darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  /* ---------- handlers ---------- */
  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
  };

  const handleAddExpense = async (e: Omit<Expense, "id">) => {
    if (!session) return;
    try {
      const row = await addExpense(session.user.id, e);
      setExpenses((prev) => [row, ...prev]);
    } catch (err: any) {
      toast({
        title: "Add failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!session) return;
    const backup = expenses.find((ex) => ex.id === id);
    setExpenses((p) => p.filter((ex) => ex.id !== id));
    try {
      await deleteExpense(id);
    } catch (err: any) {
      if (backup) setExpenses((p) => [backup, ...p]);
      toast({
        title: "Delete failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const saveMeta = async (next: { income: number; budget: number }) => {
    if (!session) return;
    setMeta(next); // optimistic
    try {
      await upsertMonthlyMeta(session.user.id, monthKey, next);
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    }
  };
  const handleBudgetChange = (v: number) => saveMeta({ income: meta.income, budget: v });
  const handleIncomeChange = (v: number) => saveMeta({ income: v,           budget: meta.budget });

  const handleCategoryColorChange = async (name: string, color: string) => {
    const row = categories.find((c) => c.name === name);
    if (!row) return;
    setCategories((prev) => prev.map((c) => (c.id === row.id ? { ...c, color } : c)));
    try {
      await updateCategoryColor(row.id, color);
    } catch (e: any) {
      toast({ title: "Save colour failed", description: e.message, variant: "destructive" });
    }
  };

  /* receive edited expense from details dialog */
  const handleExpenseUpdated = (updated: Expense) => {
    setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  /* ---------- derived ---------- */
  const filteredExpenses = expenses.filter((ex) => {
    const d = new Date(ex.date);
    return (
      d.toLocaleString("default", { month: "long" }) === selectedMonth &&
      d.getFullYear() === selectedYear
    );
  });

  const totalExpenses   = filteredExpenses.reduce((s, ex) => s + ex.amount, 0);
  const remainingBudget = meta.budget - totalExpenses;

  const spendingByCategory = filteredExpenses.reduce((acc, ex) => {
    const row = acc.find((c) => c.name === ex.category);
    if (row) row.amount += ex.amount;
    else
      acc.push({
        name:  ex.category,
        amount: ex.amount,
        color:
          categories.find((c) => c.name === ex.category)?.color || "#C9CBCF",
      });
    return acc;
  }, [] as SpendingCategory[]);

  const selectedCategoryColor =
    categories.find((c) => c.name === selectedCategory)?.color || "#C9CBCF";

  /* ---------- UI ---------- */

  ; // <- terminate previous statement to let JSX parse correctly
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">CVSaves</h1>
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            {darkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>
        </header>

        {/* month selector */}
        <MonthSelector
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={(m, y) => {
            setSelectedMonth(m);
            setSelectedYear(y);
          }}
        />

        {/* summary */}
        <div className="my-8">
          <BudgetSummary
            income={meta.income}
            budget={meta.budget}
            expenses={totalExpenses}
            remaining={remainingBudget}
            onIncomeClick={() => {}}
            onBudgetChange={handleBudgetChange}
            onIncomeChange={handleIncomeChange}
          />
        </div>

        {/* main */}
        {selectedCategory ? (
          <CategoryDetails
            category={selectedCategory}
            expenses={filteredExpenses}
            categories={categories.map((c) => c.name)}
            onBack={() => setSelectedCategory(null)}
            onDeleteExpense={handleDeleteExpense}
            onExpenseUpdated={handleExpenseUpdated}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <SpendingChart
                categories={spendingByCategory}
                totalSpending={totalExpenses}
                budget={meta.budget}
                onCategoryClick={(c) => setSelectedCategory(c)}
                onCategoryColorChange={handleCategoryColorChange}
              />

              <ExpenseManager
                budget={meta.budget}
                onBudgetChange={handleBudgetChange}
                expenses={filteredExpenses}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
              />
            </div>

            <DataManager
              expenses={expenses}
              monthlyIncome={meta.income}
              monthlyBudget={meta.budget}
              onClearAllData={() => {
                setExpenses([]);
                setMeta({ income: 0, budget: 0 });
              }}
              onClearExpenses={() => setExpenses([])}
              onExportData={() =>
                toast({ title: "Data exported", description: "Downloaded" })
              }
              onImportData={() => {}}
            />
          </>
        )}

        {/* fly-out */}
        {selectedCategory && (
          <CategoryBreakdown
            isOpen={showCategoryBreakdown}
            onClose={() => {
              setShowCategoryBreakdown(false);
              setSelectedCategory(null);
            }}
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
