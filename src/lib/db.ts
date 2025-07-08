import { supabase } from "./supabase";

// ---------- EXPENSES ----------

export async function getExpenses(
  userId: string,
  monthKey: string // e.g. '2025-07'
) {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", userId)
    .like("date", `${monthKey}-%`)     // all days in the month
    .order("date", { ascending: false });

  if (error) throw error;
  return data;            // array of Expense rows
}

export async function addExpense(userId: string, expense: Omit<any, "id">) {
  const { data, error } = await supabase.from("expenses").insert([
    { ...expense, user_id: userId },
  ]);
  if (error) throw error;
  return data![0];        // inserted row
}

export async function deleteExpense(id: string) {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}

// ---------- MONTHLY META (income + budget) ----------

export async function getMonthlyMeta(userId: string, monthKey: string) {
  const { data, error } = await supabase
    .from("monthly_meta")
    .select("*")
    .eq("user_id", userId)
    .eq("month", monthKey)
    .single();

  if (error && error.code !== "PGRST116") throw error; // row not found
  return data; // null or { income, budget, ... }
}

export async function upsertMonthlyMeta(
  userId: string,
  monthKey: string,
  meta: { income: number; budget: number }
) {
  const { error } = await supabase.from("monthly_meta").upsert([
    { user_id: userId, month: monthKey, ...meta },
  ]);
  if (error) throw error;
}
