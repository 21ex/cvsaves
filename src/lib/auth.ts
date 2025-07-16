import { supabase } from "./supabase";

/**
 * Signs the user out (clears auth cookie / local storage session).
 * Throws if Supabase returns an error.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
