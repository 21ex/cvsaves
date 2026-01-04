/* src/components/home.tsx – 2025-08-11
   Full file (no trimming)
   - Keeps date "T12:00:00" fix
   - Category rename cascades past expenses
   - Profile dialog (edit name/email, delete account)
   - Data tools dialog (export CSV, clear month, clear everything)
   - Header layout changed to a 3-column grid so MonthSelector is perfectly centered
   - Budget/Tracker pill (minimal change)
   - Tracker mode: hides BudgetSummary and bases chart % on total spending
   - Brand image now links to "/"
*/

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MoonIcon,
  SunIcon,
  Settings2,
  Plus,
  Trash2,
  Database,
} from "lucide-react";

/* shadcn/ui */
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Toaster } from "./ui/toaster";
import { useToast } from "./ui/use-toast";

/* dashboard */
import BudgetSummary from "./Dashboard/BudgetSummary";
import SpendingChart from "./Dashboard/SpendingChart";
import ExpenseManager from "./Dashboard/ExpenseManager";
import MonthSelector from "./Dashboard/MonthSelector";
import CategoryDetails from "./Dashboard/CategoryDetails";

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
interface SpendingCategory {
  name: string;
  amount: number;
  color: string;
}
const rand = () =>
  "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
const isoYMD = (d: Date) => d.toISOString().slice(0, 10);

/* ───────────────────────────────────────────────────────── */
const Home: React.FC = () => {
  const { session } = useSessionContext();
  const { toast } = useToast();

  /* state */
/* ---------- theme (per user, zero bleed) ---------- */
  const themeKey = (userId?: string | null) =>
    userId ? `budget_dark_${userId}` : null;

  const applyTheme = (isDark: boolean) => {
    document.documentElement.classList.toggle("dark", isDark);
  };

  // default light; do not reuse prior user’s setting
  const [dark, setDark] = useState<boolean>(false);
  const [meta, setMeta] = useState({ income: 0, budget: 0 });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cats, setCats] = useState<UserCategoryRow[]>([]);

  const [month, setMonth] = useState(
    new Date().toLocaleString("default", { month: "long" }),
  );
  const [year, setYear] = useState(new Date().getFullYear());

  const [selCat, setSelCat] = useState<string | null>(null);
  const [catDlg, setCatDlg] = useState(false);
  const [profDlg, setProfDlg] = useState(false);
  const [toolsDlg, setToolsDlg] = useState(false);

  /* footer popups */
  const [termsDlg, setTermsDlg] = useState(false);
  const [privacyDlg, setPrivacyDlg] = useState(false);

  /* profile scratch */
  const [pfFn, setPfFn] = useState("");
  const [pfLn, setPfLn] = useState("");
  const [pfEm, setPfEm] = useState("");

  /* mode (budget vs tracker) */
  const [mode, setMode] = useState<"budget" | "tracker">(() => {
    const saved = localStorage.getItem("cvs_mode");
    return (saved as "budget" | "tracker") || "budget";
  });

  const monthKey = `${year}-${String(
    new Date(Date.parse(`${month} 1, 2000`)).getMonth() + 1,
  ).padStart(2, "0")}`;

  // When session changes, load only that user's stored theme; logout resets to light.
  useEffect(() => {
    const uid = session?.user?.id ?? null;
    if (uid) {
      const key = themeKey(uid);
      try {
        const saved = key ? localStorage.getItem(key) : null;
        const next = saved !== null ? !!JSON.parse(saved) : false;
        setDark(next);
        applyTheme(next);
      } catch {
        setDark(false);
        applyTheme(false);
      }
    } else {
      setDark(false);
      applyTheme(false);
    }
  }, [session?.user?.id]);

  // Persist per-user only; guests are not persisted. Apply immediately.
  useEffect(() => {
    const uid = session?.user?.id ?? null;
    const key = themeKey(uid);
    if (uid && key) {
      try {
        localStorage.setItem(key, JSON.stringify(dark));
      } catch {
        /* ignore */
      }
    }
    applyTheme(dark);
  }, [dark, session?.user?.id]);

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
    try {
      await upsertMonthlyMeta(session.user.id, monthKey, next);
    } catch (e: any) {
      notify("Save failed", e.message);
    }
  }

  async function doLogout() {
    try {
      await supabase.auth.signOut();
    } finally {
      location.reload();
    }
  }

  /* expense CRUD */
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
      if (bak) setExpenses((p) => [bak!, ...p]);
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

  /* category helpers */
  async function addCat(name: string) {
    if (!session) return;
    try {
      const r = await addCategory(session.user.id, name, rand());
      setCats((p) => [...p, r]);
    } catch (e: any) {
      notify("Add failed", e.message);
    }
  }

  /** rename category & cascade to expenses  */
  async function renameCatSafe(id: string, newName: string, oldName: string) {
    if (!session || !newName.trim()) return;
    try {
      await renameCategory(id, newName.trim());

      // cascade past expenses that used the old category name
      await supabase
        .from("expenses")
        .update({ category: newName.trim() })
        .eq("user_id", session.user.id)
        .eq("category", oldName);

      setCats((p) =>
        p.map((c) => (c.id === id ? { ...c, name: newName.trim() } : c)),
      );
      setExpenses((p) =>
        p.map((x) =>
          x.category === oldName ? { ...x, category: newName.trim() } : x,
        ),
      );
    } catch (e: any) {
      notify("Rename failed", e.message);
    }
  }

  async function deleteCat(id: string) {
    if (!session) return;
    try {
      await deleteCategory(id);
      setCats((p) => p.filter((c) => c.id !== id));
    } catch (e: any) {
      notify("Delete failed", e.message);
    }
  }

  /* derived */
  const monthEx = expenses.filter((e) => {
    const d = new Date(e.date);
    return (
      d.toLocaleString("default", { month: "long" }) === month &&
      d.getFullYear() === year
    );
  });
  const sum = monthEx.reduce((s, e) => s + e.amount, 0);
  const remain = meta.budget - sum; // allow negative
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

  /* ----- profile save / delete ----- */
  const saveProfile = async () => {
    if (!session) return;
    try {
      await supabase.auth.updateUser({
        data: { first_name: pfFn.trim(), last_name: pfLn.trim() },
      });

      if (pfEm.trim() && pfEm.trim() !== session.user.email) {
        const { error } = await supabase.auth.updateUser({
          email: pfEm.trim(),
          emailRedirectTo: `${location.origin}/login`,
        });
        if (error) throw error;
        toast({
          title: "Verification required",
          description:
            "We sent verification links to BOTH your old and new e-mails. Complete both to finish the change.",
        });
      }
      setProfDlg(false);
    } catch (e: any) {
      notify("Update failed", e.message);
    }
  };

  const deleteAccount = async () => {
    if (!session) return;
    const ok = window.confirm(
      "Delete your account permanently? This cannot be undone.",
    );
    if (!ok) return;

    try {
      // Requires the SQL function `delete_current_user(uid uuid)` created in your DB.
      const { error } = await supabase.rpc("delete_current_user", {
        uid: session.user.id,
      });
      if (error) throw error;

      toast({ title: "Account deleted" });
      await supabase.auth.signOut();
      location.reload();
    } catch (e: any) {
      notify("Delete failed", e.message);
    }
  };

  /* ----- data tools ----- */
  const csvEscape = (s: string) => {
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const exportCsv = async () => {
    // export current month for now
    const rows = monthEx
      .slice()
      .sort((a, b) => +new Date(a.date) - +new Date(b.date))
      .map((e) => ({
        date: isoYMD(new Date(e.date)),
        category: e.category,
        description: e.description ?? "",
        amount: e.amount.toFixed(2),
      }));

    const header = ["date", "category", "description", "amount"];
    const csv = [
      header.join(","),
      ...rows.map((r) =>
        [r.date, csvEscape(r.category), csvEscape(r.description), r.amount].join(
          ",",
        ),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `cvsaves_${monthKey}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const clearMonth = async () => {
    if (!session) return;
    const ok = window.confirm(`Clear all expenses for ${month} ${year}?`);
    if (!ok) return;

    try {
      const [y, m] = monthKey.split("-").map(Number);
      const first = `${monthKey}-01`;
      const last = new Date(y, m, 0).toISOString().slice(0, 10);

      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("user_id", session.user.id)
        .gte("date", first)
        .lte("date", last);

      if (error) throw error;

      setExpenses([]); // current view is that month
      toast({ title: "Month cleared" });
    } catch (e: any) {
      notify("Clear failed", e.message);
    }
  };

  const clearEverything = async () => {
    if (!session) return;
    const ok = window.confirm(
      "Clear ALL your data (all months)? This cannot be undone.",
    );
    if (!ok) return;
    try {
      // expenses
      let { error } = await supabase
        .from("expenses")
        .delete()
        .eq("user_id", session.user.id);
      if (error) throw error;

      // monthly_meta
      const { error: e2 } = await supabase
        .from("monthly_meta")
        .delete()
        .eq("user_id", session.user.id);
      if (e2) throw e2;

      setExpenses([]);
      setMeta({ income: 0, budget: 0 });
      toast({ title: "All data cleared" });
    } catch (e: any) {
      notify("Clear failed", e.message);
    }
  };

  /* persist mode */
  useEffect(() => {
    localStorage.setItem("cvs_mode", mode);
  }, [mode]);

  /* ─────────────────── UI ─────────────────── */
  return (
    <div className="min-h-screen bg-background">
      <Toaster />

      <div className="container mx-auto px-4 py-8">
        {/* header (3-column grid so MonthSelector stays centered) */}
        <header
          className="grid grid-cols-[1fr_auto_1fr] items-center mb-8 "
          style={{ height: "76px" }}
        >
          {/* left: brand (link to home) */}
          <div className="flex items-center justify-start" style={{ height: "80px" }}>
            <h1 className="m-0 text-3xl font-bold flex items-center gap-2 -translate-x-[14px] translate-y-[6px]">
              <a href="/" aria-label="CVSaves Home">
                <img
                  src={dark ? "/brand/CVSavesWhite.svg" : "/brand/CVSavesBlack.svg"}
                  alt="CVSaves"
                  className="h-[320px] w-auto object-contain scale-[4] origin-left"
                  style={{ transform: "scale(.7)", transformOrigin: "left center" }}
                  loading="eager"
                />
              </a>
            </h1>
          </div>

          {/* center: month selector */}
          <div className="justify-self-center">
            <MonthSelector
              selectedMonth={month}
              selectedYear={year}
              onMonthChange={(m, y) => {
                setMonth(m);
                setYear(y);
              }}
            />
          </div>

          {/* right: user name + controls */}
          <div className="justify-self-end flex items-center gap-3">
            {session?.user && (
              <button
                className="text-sm text-muted-foreground hover:underline"
                onClick={() => {
                  setPfFn((session.user.user_metadata?.first_name as string) || "");
                  setPfLn((session.user.user_metadata?.last_name as string) || "");
                  setPfEm(session.user.email || "");
                  setProfDlg(true);
                }}
              >
                {session.user.user_metadata?.first_name
                  ? `${session.user.user_metadata.first_name} ${session.user.user_metadata.last_name
                    ? (session.user.user_metadata.last_name as string)[0] + "."
                    : ""
                  }`
                  : session.user.email}
              </button>
            )}

            {/* categories dialog */}
            <Button variant="outline" size="icon" onClick={() => setCatDlg(true)}>
              <Settings2 className="h-5 w-5" />
            </Button>

            {/* data tools */}
            <Button variant="outline" size="icon" onClick={() => setToolsDlg(true)}>
              <Database className="h-5 w-5" />
            </Button>

            {/* dark toggle */}
            <Button variant="outline" size="icon" onClick={() => setDark(!dark)}>
              {dark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </Button>

            <Button variant="secondary" onClick={doLogout}>
              Log out
            </Button>
          </div>
        </header>

        {/* summary — HIDDEN in tracker mode */}
        {mode === "budget" && (
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
        )}

        {/* main + mode pill (kept minimal) */}
        <div className="relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
            <div className="inline-flex items-center rounded-full bg-muted p-1 shadow-sm">
              <Button
                size="sm"
                variant={mode === "budget" ? "default" : "ghost"}
                className="h-7 px-3 rounded-full"
                onClick={() => setMode("budget")}
              >
                Budget
              </Button>
              <Button
                size="sm"
                variant={mode === "tracker" ? "default" : "ghost"}
                className="h-7 px-3 rounded-full"
                onClick={() => setMode("tracker")}
              >
                Tracker
              </Button>
            </div>
          </div>

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
                  key={`chart-${mode === "tracker" ? "t" : "b"}`} // force clean remount on toggle
                  categories={byCat}
                  totalSpending={sum}
                  budget={meta.budget}                              // <-- stop overriding with sum
                  trackerMode={mode === "tracker"}                  // <-- pass the mode explicitly
                  onCategoryClick={setSelCat}
                  onCategoryColorChange={async (name, color) => {
                    const row = cats.find((c) => c.name === name);
                    if (!row) return;
                    await updateCategoryColor(row.id, color);
                    setCats((p) => p.map((c) => (c.id === row.id ? { ...c, color } : c)));
                  }}
                />
                <ExpenseManager
                  /* Keep Expense Manager unchanged — still shows the budget line if in budget mode. */
                  budget={mode === "tracker" ? 0 : meta.budget}
                  onBudgetChange={(v) => saveMeta({ income: meta.income, budget: v })}
                  expenses={monthEx}
                  onAddExpense={addExpLocal}
                  onDeleteExpense={delExpLocal}
                  categories={cats.map((c) => c.name)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* centered favicon divider (above footer) — bigger logo without extra whitespace */}
      <div className="mt-2 mb-4 flex items-center justify-center" style={{ height: "24px" }}>
        <img
          src={dark ? "/brand/CVSavesFavWhite.svg" : "/brand/CVSavesFaviconBlack.svg"}
          alt="CVSaves"
          className="h-[192px] w-auto select-none pointer-events-none"
          style={{
            transform: "scale(1)",
            transformOrigin: "center",
            marginTop: "-48px", // keep overlap so whitespace doesn't grow
          }}
          loading="lazy"
        />
      </div>

      {/* footer */}
      <footer className="border-t mt-6">
        <div className="container mx-auto px-4 py-8 text-sm text-muted-foreground grid gap-2 text-center">
          <div>
            <span className="font-semibold text-foreground">CVSaves</span> by{" "}
            <a
              className="hover:underline font-medium text-foreground"
              href="https://cvsol.square.site"
              target="_blank"
              rel="noopener noreferrer"
            >
              CVSolutions
            </a>
          </div>
          <div className="flex items-center justify-center gap-6">
            <button
              className="hover:underline"
              onClick={() => setTermsDlg(true)}
              type="button"
            >
              Terms &amp; Conditions
            </button>
            <button
              className="hover:underline"
              onClick={() => setPrivacyDlg(true)}
              type="button"
            >
              Privacy Policy
            </button>
          </div>
          <div>
            <a className="hover:underline" href="#" onClick={(e) => e.preventDefault()}>
              Support Me
            </a>
          </div>
        </div>
      </footer>

      {/* ░░ Terms dialog ░░ */}
      <Dialog open={termsDlg} onOpenChange={setTermsDlg}>
        {/* Make the dialog scrollable */}
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto" aria-describedby="terms-desc">
          <DialogHeader>
            <DialogTitle>Terms &amp; Conditions – CVSaves</DialogTitle>
            <p className="text-xs italic text-muted-foreground">Last updated: 17 August 2025</p>
            <DialogDescription id="terms-desc" asChild>
              <div className="space-y-4 text-sm leading-6 mt-2">
                <p>
                  Welcome to CVSaves. By using our website, you agree to the following terms:
                </p>

                <h3 className="font-semibold">Purpose of CVSaves</h3>
                <p>
                  CVSaves is a free online tool that helps you track your personal expenses and
                  better understand your finances. It is for informational purposes only and should
                  not be considered financial advice.
                </p>

                <h3 className="font-semibold">Account Creation</h3>
                <ul className="list-disc ml-5 space-y-1">
                  <li>You may create an account using your email address.</li>
                  <li>
                    The name, expense entries, and categories you enter are stored securely in our
                    database so they are available each time you log in.
                  </li>
                </ul>

                <h3 className="font-semibold">Your Responsibilities</h3>
                <ul className="list-disc ml-5 space-y-1">
                  <li>You are responsible for the accuracy of the information you enter.</li>
                  <li>You agree not to use CVSaves for any unlawful purpose.</li>
                </ul>

                <h3 className="font-semibold">Privacy &amp; Data</h3>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    We collect only the information you provide (email, name, and your expense
                    entries).
                  </li>
                  <li>We do not sell your data to third parties.</li>
                  <li>
                    While we take reasonable steps to protect your data, we cannot guarantee
                    complete security.
                  </li>
                </ul>

                <h3 className="font-semibold">Links to Other Sites</h3>
                <p>
                  CVSaves may contain links to other websites (such as cvsol.square.site). We are
                  not responsible for the content, security, or privacy practices of those websites.
                </p>

                <h3 className="font-semibold">Disclaimer of Liability</h3>
                <p>
                  CVSaves is provided “as is” without warranties of any kind. We are not responsible
                  for any loss, damage, or inconvenience caused by the use or inability to use the
                  website, including any data loss.
                </p>

                <h3 className="font-semibold">Changes to These Terms</h3>
                <p>
                  We may update these terms from time to time. Continued use of CVSaves after
                  changes are posted means you accept the updated terms.
                </p>

                <h3 className="font-semibold">Governing Law</h3>
                <p>These terms are governed by the laws of Canada.</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setTermsDlg(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ░░ Privacy dialog ░░ */}
      <Dialog open={privacyDlg} onOpenChange={setPrivacyDlg}>
        {/* Make the dialog scrollable */}
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto" aria-describedby="privacy-desc">
          <DialogHeader>
            <DialogTitle>Privacy Policy – CVSaves</DialogTitle>
            <p className="text-xs italic text-muted-foreground">Last updated: 17 August 2025</p>
            <DialogDescription id="privacy-desc" asChild>
              <div className="space-y-4 text-sm leading-6 mt-2">
                <p>
                  Your privacy is important to us. This Privacy Policy explains what information we
                  collect, how we use it, and your rights regarding that information.
                </p>

                <h3 className="font-semibold">1. Information We Collect</h3>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    <b>Account Information:</b> Your email address and the name you provide.
                  </li>
                  <li>
                    <b>Expense Data:</b> Any expense entries and categories you create.
                  </li>
                  <li>
                    <b>Technical Data:</b> Basic information about your browser and device
                    (automatically collected by our hosting services for security and performance).
                  </li>
                </ul>

                <h3 className="font-semibold">2. How We Use Your Information</h3>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Create and manage your account.</li>
                  <li>Store and display your expense data each time you log in.</li>
                  <li>Maintain and improve the functionality of CVSaves.</li>
                  <li>Respond to support requests (if you contact us).</li>
                </ul>

                <h3 className="font-semibold">3. How We Store and Protect Your Data</h3>
                <p>
                  Your data is stored securely in our database (Supabase). We use reasonable
                  security measures to protect your information, but no method of storage or
                  transmission is 100% secure.
                </p>

                <h3 className="font-semibold">4. Sharing Your Information</h3>
                <p>
                  We do not sell, rent, or trade your personal information. We may share your data
                  only if required by law or to protect our legal rights.
                </p>

                <h3 className="font-semibold">5. Links to Other Websites</h3>
                <p>
                  CVSaves may include links to other websites (such as cvsol.square.site). We are
                  not responsible for the privacy practices or content of those websites.
                </p>

                <h3 className="font-semibold">6. Your Rights</h3>
                <ul className="list-disc ml-5 space-y-1">
                  <li>View the data we have about you.</li>
                  <li>Update or correct your information.</li>
                  <li>Delete your account and associated data.</li>
                </ul>
                <p>
                  To make a request, contact us through: <em>cvsol.square.site</em>
                </p>

                <h3 className="font-semibold">7. Changes to This Privacy Policy</h3>
                <p>
                  We may update this policy from time to time. We will post the updated version here
                  and change the “Last updated” date.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setPrivacyDlg(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ░░ Category dialog ░░ */}
      <Dialog open={catDlg} onOpenChange={setCatDlg}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage categories</DialogTitle>
          </DialogHeader>

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
                    renameCatSafe(c.id, v, c.name);
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
              const v = (e.currentTarget.elements[0] as HTMLInputElement).value.trim();
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

      {/* ░░ Profile dialog ░░ */}
      <Dialog open={profDlg} onOpenChange={setProfDlg}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Your profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">First name</label>
              <Input value={pfFn} onChange={(e) => setPfFn(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Last name</label>
              <Input value={pfLn} onChange={(e) => setPfLn(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">E-mail</label>
              <Input value={pfEm} onChange={(e) => setPfEm(e.target.value)} />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Button variant="destructive" onClick={deleteAccount}>
                Delete Account
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setProfDlg(false)}>
                  Cancel
                </Button>
                <Button onClick={saveProfile}>Save</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ░░ Data tools dialog ░░ */}
      <Dialog open={toolsDlg} onOpenChange={setToolsDlg}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Data tools</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Button onClick={exportCsv} className="w-full">
              Export current month to CSV
            </Button>
            <Button variant="outline" onClick={clearMonth} className="w-full">
              Clear current month
            </Button>
            <Button variant="destructive" onClick={clearEverything} className="w-full">
              Clear everything
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
