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
 * Fetch all transactions dynamically from Supabase database joined with Categories.
 * Uses Redux auth state directly instead of calling supabase.auth.getUser().
 */
export const getTransactions = async (params = {}) => {
  try {
    let explicitUserId = null;
    let page = null;
    let limit = null;
    let startDate = null;
    let endDate = null;

    if (typeof params === "string") {
      explicitUserId = params;
    } else if (typeof params === "object" && params !== null) {
      explicitUserId = params.userId || params.explicitUserId;
      page = params.page;
      limit = params.limit;
      startDate = params.startDate;
      endDate = params.endDate;
    }

    const userId = explicitUserId || getAuthUserId();

    let query = supabase
      .from("transactions")
      .select("*, categories (id, name, type, icon, color_code)", {
        count: "exact",
      });

    if (userId) {
      query = query.or(`user_id.eq.${userId},user_id.is.null`);
    }

    if (startDate && endDate) {
      query = query.gte("date", startDate).lte("date", endDate);
    } else if (startDate) {
      query = query.gte("date", startDate);
    } else if (endDate) {
      query = query.lte("date", endDate);
    }

    query = query
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (limit && page) {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
    } else if (limit) {
      query = query.limit(limit);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error("Supabase query error for transactions:", error);
      throw new Error(error.message || "Failed to fetch transactions.");
    }

    const items = (data || []).map((t) => ({
      id: t.id,
      amount: parseFloat(t.amount) || 0,
      type: t.type || t.categories?.type || "Expense",
      category_id: t.category_id,
      category: t.categories?.name || "Uncategorized",
      category_icon: "🏷️",
      color_code: t.categories?.color_code || "#FF6B6B",
      date: t.date || new Date().toISOString().split("T")[0],
      note: t.note || "",
      created_at: t.created_at,
    }));

    items.totalCount =
      typeof count === "number" && !isNaN(count) ? count : items.length;

    return items;
  } catch (err) {
    console.error("Transactions query error:", err);
    throw err;
  }
};

/**
 * Create a new transaction in Supabase database.
 * Uses Redux auth state directly instead of calling supabase.auth.getUser().
 */
export const createTransaction = async ({
  amount,
  type,
  category_id,
  date,
  note,
  userId: explicitUserId,
}) => {
  try {
    const userId = explicitUserId || getAuthUserId();

    const payload = {
      amount: parseFloat(amount),
      type: type || "Expense",
      category_id: category_id && !isNaN(category_id) ? parseInt(category_id) : null,
      date: date || new Date().toISOString().split("T")[0],
      note: note ? note.trim() : null,
      ...(userId ? { user_id: userId } : {}),
    };

    const { data, error } = await supabase
      .from("transactions")
      .insert([payload])
      .select("*, categories (id, name, type, icon, color_code)")
      .single();

    if (error) {
      console.error("Supabase error inserting transaction:", error);
      throw new Error(error.message || "Failed to create transaction.");
    }

    return {
      id: data.id,
      amount: parseFloat(data.amount) || 0,
      type: data.type || "Expense",
      category_id: data.category_id,
      category: data.categories?.name || "Uncategorized",
      category_icon: "🏷️",
      color_code: data.categories?.color_code || "#FF6B6B",
      date: data.date,
      note: data.note || "",
      created_at: data.created_at,
    };
  } catch (err) {
    console.error("Transaction creation error:", err);
    throw err;
  }
};

/**
 * Delete a transaction by ID in Supabase database.
 */
export const deleteTransaction = async (id) => {
  try {
    if (!id) throw new Error("Transaction ID is required.");

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase error deleting transaction:", error);
      throw new Error(error.message || "Failed to delete transaction.");
    }

    return true;
  } catch (err) {
    console.error("Delete transaction error:", err);
    throw err;
  }
};
