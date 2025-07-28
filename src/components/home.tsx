/* src/components/home.tsx – 2025-07-27
   full file – no trimming                                            */

import React, { useEffect, useState } from "react";
import {
  MoonIcon,
  SunIcon,
  Settings2,
  Plus,
  Trash2,
} from "lucide-react";

/* shadcn/ui */
import { Button } from "./ui/button";
import { Toaster } from "./ui/toaster";
import { useToast } from "./ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";

/* dashboard */
import BudgetSummary from "./Dashboard/BudgetSummary";
import SpendingChart from "./Dashboard/SpendingChart";
import ExpenseManager from "./Dashboard/ExpenseManager";
import MonthSelector from "./Dashboard/MonthSelector";
import CategoryDetails from "./Dashboard/CategoryDetails";
import DataManager from "./Dashboard/DataManager";

/* data / auth */
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabase";
import {
  getExpenses,
  addExpense,
  deleteExpense,
  updateExpense,
  getMonthlyMeta,
  upsertMonthlyMeta,
  getUserCategories,
  insertDefaultCategories,
  updateCategoryColor,
  addCategory,
  renameCategory,
  deleteCategory,
  UserCategoryRow,
} from "@/lib/db";
import { Transaction } from "@/types/supabase";

/* helpers */
interface Expense extends Transaction { }
interface SpendingCategory { name: string; amount: number; color: string }
const rand = () =>
  "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");

/* ─────────────────────────────────────────────────────────────────── */
const Home: React.FC = () => {
  const { session } = useSessionContext();
  const { toast } = useToast();

  /* state */
  const [dark, setDark] = useState(false);
  const [meta, setMeta] = useState({ income: 0, budget: 0 });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cats, setCats] = useState<UserCategoryRow[]>([]);

  const [month, setMonth] = useState(
    new Date().toLocaleString("default", { month: "long" }),
  );
  const [year, setYear] = useState(new Date().getFullYear());

  const [selCat, setSelCat] = useState<string | null>(null);
  const [catDlg, setCatDlg] = useState(false);

  const monthKey = `${year}-${String(
    new Date(Date.parse(`${month} 1, 2000`)).getMonth() + 1,
  ).padStart(2, "0")}`;

  /* ---------- dark-mode pref ---------- */
  useEffect(() => {
    const s = localStorage.getItem("budget_dark");
    if (s) {
      const d = JSON.parse(s);
      setDark(d);
      document.documentElement.classList.toggle("dark", d);
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("budget_dark", JSON.stringify(dark));
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  /* ---------- categories ---------- */
  useEffect(() => {
    if (!session) return;
    (async () => {
      let rows = await getUserCategories(session.user.id);
      if (!rows.length) {
        await insertDefaultCategories(session.user.id);
        rows = await getUserCategories(session.user.id);
      }
      setCats(rows);
    })().catch(console.error);
  }, [session]);

  /* ---------- monthly meta ---------- */
  useEffect(() => {
    if (!session) return;
    (async () => {
      const row = await getMonthlyMeta(session.user.id, monthKey);
      setMeta(row ?? { income: 0, budget: 0 });
    })().catch(console.error);
  }, [session, monthKey]);

  /* ---------- expenses ---------- */
  useEffect(() => {
    if (!session) return;
    (async () => {
      const data = await getExpenses(session.user.id, monthKey);
      /*  add “T12:00:00” so UTC↔local offset can’t push date back a day  */
      setExpenses(
        data.map((e: any) => ({
          ...e,
          date: new Date(`${e.date}T12:00:00`),
        })),
      );
    })().catch(console.error);
  }, [session, monthKey]);

  /* ---------- helpers ---------- */
  const notify = (t: string, d?: string) =>
    toast({ title: t, description: d, variant: d ? "destructive" : "default" });

  async function saveMeta(next: { income: number; budget: number }) {
    if (!session) return;
    setMeta(next);
    try { await upsertMonthlyMeta(session.user.id, monthKey, next); }
    catch (e: any) { notify("Save failed", e.message); }
  }

  async function doLogout() {
    try { await supabase.auth.signOut(); }
    finally { location.reload(); }
  }

  /* ---------- expense CRUD ---------- */
  function addExpLocal(e: Omit<Expense, "id">) {
    if (!session) return;
    addExpense(session.user.id, e)
      .then((row) =>
        setExpenses((p) => [
          { ...row, date: new Date(`${row.date}T12:00:00`) },
          ...p,
        ]),
      )
      .catch((err) => notify("Add failed", err.message));
  }
  function delExpLocal(id: string) {
    const bak = expenses.find((x) => x.id === id);
    setExpenses((p) => p.filter((x) => x.id !== id));
    deleteExpense(id).catch((err) => {
      notify("Delete failed", err.message);
      if (bak) setExpenses((p) => [bak, ...p]);
    });
  }
  function updExpLocal(e: Expense) {
    updateExpense(e.id, {
      amount: e.amount,
      description: e.description,
      category: e.category,
      date: e.date.toISOString(),
    })
      .then(() => setExpenses((p) => p.map((x) => (x.id === e.id ? e : x))))
      .catch((err) => notify("Save failed", err.message));
  }

  /* ---------- category helpers ---------- */
  async function addCat(name: string) {
    if (!session) return;
    try {
      const r = await addCategory(session.user.id, name, rand());
      setCats((p) => [...p, r]);
    } catch (e: any) { notify("Add failed", e.message); }
  }
  async function renameCatSafe(id: string, name: string) {
    if (!session) return;
    if (!name.trim()) return;
    try {
      await renameCategory(id, name.trim());
      setCats((p) => p.map((c) => (c.id === id ? { ...c, name: name.trim() } : c)));
    } catch (e: any) { notify("Rename failed", e.message); }
  }
  async function deleteCat(id: string) {
    if (!session) return;
    try { await deleteCategory(id); setCats((p) => p.filter((c) => c.id !== id)); }
    catch (e: any) { notify("Delete failed", e.message); }
  }

  /* ---------- derived values ---------- */
  const monthEx = expenses.filter((e) => {
    const d = new Date(e.date);
    return (
      d.toLocaleString("default", { month: "long" }) === month &&
      d.getFullYear() === year
    );
  });
  const sum = monthEx.reduce((s, e) => s + e.amount, 0);
  const remain = meta.budget - sum;
  const byCat = monthEx.reduce<SpendingCategory[]>((a, e) => {
    const row = a.find((x) => x.name === e.category);
    if (row) row.amount += e.amount;
    else
      a.push({
        name: e.category,
        amount: e.amount,
        color: cats.find((c) => c.name === e.category)?.color || "#ccc",
      });
    return a;
  }, []);

  /* ─────────────────── UI ─────────────────── */
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">

        {/* header */}
        <header className="flex justify-between items-center mb-8">
          {/* brand back on left */}
          <h1 className="text-3xl font-bold">CVSaves</h1>

          <MonthSelector
            selectedMonth={month}
            selectedYear={year}
            onMonthChange={(m, y) => { setMonth(m); setYear(y); }}
          />

          <div className="flex items-center gap-4">
            {/* user name (abbrev last) */}
            {session?.user.user_metadata?.first_name && (
              <span className="text-sm text-muted-foreground mr-1">
                {session.user.user_metadata.first_name}&nbsp;
                {session.user.user_metadata.last_name
                  ? (session.user.user_metadata.last_name as string)[0] + "."
                  : ""}
              </span>
            )}

            <Button variant="outline" size="icon" onClick={() => setCatDlg(true)}>
              <Settings2 className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setDark(!dark)}>
              {dark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </Button>
            <Button variant="secondary" onClick={doLogout}>Log out</Button>
          </div>
        </header>

        {/* summary */}
        <div className="my-8">
          <BudgetSummary
            income={meta.income}
            budget={meta.budget}
            expenses={sum}
            remaining={remain}
            onIncomeClick={() => { }}
            onBudgetChange={(v) => saveMeta({ income: meta.income, budget: v })}
            onIncomeChange={(v) => saveMeta({ income: v, budget: meta.budget })}
          />
        </div>

        {/* main */}
        {selCat ? (
          <CategoryDetails
            category={selCat}
            expenses={monthEx}
            categories={cats.map((c) => c.name)}
            onBack={() => setSelCat(null)}
            onDeleteExpense={delExpLocal}
            onExpenseUpdated={updExpLocal}
          />
        ) : (
          <>
            <div className="grid gap-8 lg:grid-cols-2 mb-8">
              <SpendingChart
                categories={byCat}
                totalSpending={sum}
                budget={meta.budget}
                onCategoryClick={setSelCat}
                onCategoryColorChange={async (name, color) => {
                  const row = cats.find((c) => c.name === name);
                  if (!row) return;
                  await updateCategoryColor(row.id, color);
                  setCats((p) => p.map((c) => (c.id === row.id ? { ...c, color } : c)));
                }}
              />
              <ExpenseManager
                budget={meta.budget}
                onBudgetChange={(v) => saveMeta({ income: meta.income, budget: v })}
                expenses={monthEx}
                onAddExpense={addExpLocal}
                onDeleteExpense={delExpLocal}
                categories={cats.map((c) => c.name)}
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
              onExportData={() => notify("Data exported")}
              onImportData={() => { }}
            />
          </>
        )}
      </div>

      {/* ░░ Category dialog ░░ */}
      <Dialog open={catDlg} onOpenChange={setCatDlg}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Manage categories</DialogTitle></DialogHeader>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {cats.map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <button
                  className="w-4 h-4 rounded-full border shrink-0"
                  style={{ backgroundColor: c.color }}
                  onClick={async () => {
                    const col = rand();
                    await updateCategoryColor(c.id, col);
                    setCats((p) =>
                      p.map((x) => (x.id === c.id ? { ...x, color: col } : x)),
                    );
                  }}
                />

                {/* uncontrolled input; save onBlur */}
                <Input
                  defaultValue={c.name}
                  className="h-7"
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (!v || v === c.name) return;
                    renameCatSafe(c.id, v);
                  }}
                />

                <Button
                  variant="ghost"
                  size="icon"
                  disabled={cats.length === 1}
                  onClick={() => deleteCat(c.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <form
            className="flex gap-2 pt-4"
            onSubmit={(e) => {
              e.preventDefault();
              const v = (
                e.currentTarget.elements[0] as HTMLInputElement
              ).value.trim();
              if (v) addCat(v);
              e.currentTarget.reset();
            }}
          >
            <Input placeholder="New category" />
            <Button size="icon" type="submit">
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
};

export default Home;
