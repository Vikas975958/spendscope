import { supabase } from "@/lib/supabaseconfig";
import { store } from "@/redux";

/**
 * Helper to get current authenticated user ID directly from Redux authSlice
 */
const getAuthUserId = () => {
  try {
    const state = store?.getState?.();
    return (
      state?.authSlice?.userId ||
      state?.auth?.userId ||
      state?.authSlice?.userData?.id ||
      state?.auth?.userData?.id ||
      state?.authSlice?.userData?.user?.id ||
      state?.auth?.userData?.user?.id ||
      null
    );
  } catch {
    return null;
  }
};

/**
 * Reset/Delete all transactions belonging to the current user in Supabase.
 */
export const resetUserTransactions = async (explicitUserId) => {
  try {
    const userId = explicitUserId || getAuthUserId();

    let query = supabase.from("transactions").delete();

    if (userId) {
      query = query.or(`user_id.eq.${userId},user_id.is.null`);
    } else {
      query = query.not("id", "is", null);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error resetting transactions:", error);
      throw new Error(error.message || "Failed to reset transactions.");
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("spendscope:transactions-reset"));
    }

    return { success: true, data };
  } catch (err) {
    console.error("Reset transactions error:", err);
    return { success: false, error: err.message || "Failed to reset transactions." };
  }
};
