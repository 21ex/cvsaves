import { supabase } from "./supabase";

/* helper ────────────────────────────────────────────── */
/** Always store plain `YYYY-MM-DD` regardless of local tz. */
const toDateString = (d: Date | string) =>
  typeof d === "string" ? d.slice(0, 10) : d.toISOString().slice(0, 10);

/* ───────── EXPENSES ───────── */

export async function getExpenses(userId: string, monthKey: string) {
  const [y, m] = monthKey.split("-").map(Number);
  const first = `${monthKey}-01`;
  const last = new Date(y, m, 0).toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", userId)
    .gte("date", first)
    .lte("date", last)
    .order("date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addExpense(
  userId: string,
  expense: Omit<any, "id" | "user_id">
) {
  const { data, error } = await supabase
    .from("expenses")
    .insert([
      {
        ...expense,
        user_id: userId,
        date: toDateString(expense.date),   // 👈 fixes off-by-one
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteExpense(id: string) {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}

export async function updateExpense(id: string, fields: any) {
  const { data, error } = await supabase
    .from("expenses")
    .update({
      ...fields,
      date: toDateString(fields.date),      // 👈 fixes off-by-one
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ───────── MONTHLY META ───────── */

export async function getMonthlyMeta(userId: string, month: string) {
  const { data, error } = await supabase
    .from("monthly_meta")
    .select("income,budget")
    .eq("user_id", userId)
    .eq("month", month)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function upsertMonthlyMeta(
  userId: string,
  month: string,
  meta: { income: number; budget: number }
) {
  const { error } = await supabase
    .from("monthly_meta")
    .upsert([{ user_id: userId, month, ...meta }])
    .select()
    .single();

  if (error) throw error;
}

/* ────────── USER CATEGORIES ────────── */

export interface UserCategoryRow {
  id: string;
  user_id: string;
  name: string;
  color: string;
}

export async function getUserCategories(userId: string) {
  const { data, error } = await supabase
    .from("user_categories")
    .select("id,name,color")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as UserCategoryRow[];
}

export async function insertDefaultCategories(userId: string) {
  const defaults = [
    { name: "Food", color: "#FF6384" },
    { name: "Transportation", color: "#36A2EB" },
    { name: "Entertainment", color: "#FFCE56" },
    { name: "Housing", color: "#4BC0C0" },
    { name: "Utilities", color: "#9966FF" },
    { name: "Healthcare", color: "#FF9F40" },
    { name: "Shopping", color: "#C9CBCF" },
    { name: "Other", color: "#36A2EB" },
  ].map((c) => ({ ...c, user_id: userId }));

  const { error } = await supabase.from("user_categories").insert(defaults);
  if (error) throw error;
}

export async function updateCategoryColor(id: string, color: string) {
  const { error } = await supabase
    .from("user_categories")
    .update({ color })
    .eq("id", id);
  if (error) throw error;
}

/* extra helpers (unchanged) ─────────────────────────── */

export async function addCategory(
  userId: string,
  name: string,
  color: string
): Promise<UserCategoryRow> {
  const { data, error } = await supabase
    .from("user_categories")
    .insert([{ user_id: userId, name, color }])
    .select()
    .single();

  if (error) throw error;
  return data as UserCategoryRow;
}

export async function renameCategory(id: string, newName: string) {
  const { error } = await supabase
    .from("user_categories")
    .update({ name: newName })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from("user_categories")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
