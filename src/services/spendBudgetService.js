import { supabase } from "@/lib/supabaseconfig";
import { store } from "@/redux";

/**
 * Helper to get current authenticated user ID directly from Redux auth state
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
 * Fetch spend budget entries with pagination and optional filtering
 * WITHOUT any category functionality.
 */
export const getSpendBudgets = async (params = {}) => {
  try {
    const explicitUserId = params?.userId;
    const page = params?.page;
    const limit = params?.limit;
    const type = params?.type; // 'Fund' or 'Expense'
    const search = params?.search;

    const userId = explicitUserId || getAuthUserId();

    let query = supabase
      .from("spend_budgets")
      .select("*", { count: "exact" });

    if (userId) {
      query = query.or(`user_id.eq.${userId},user_id.is.null`);
    }

    if (type && type !== "all") {
      query = query.eq("type", type);
    }

    if (search && search.trim()) {
      query = query.ilike("note", `%${search.trim()}%`);
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
      console.error("Supabase query error for spend_budgets:", error);
      throw new Error(error.message || "Failed to fetch spend budget items.");
    }

    const items = (data || []).map((b) => ({
      id: b.id,
      amount: parseFloat(b.amount) || 0,
      type: b.type === "Income" ? "Fund" : b.type || "Expense",
      note: b.note || "",
      date: b.date || new Date().toISOString().split("T")[0],
      created_at: b.created_at,
    }));

    items.totalCount =
      typeof count === "number" && !isNaN(count) ? count : items.length;

    return items;
  } catch (err) {
    console.error("Spend budget query error:", err);
    throw err;
  }
};

/**
 * Fetch all spend budget entries for total balance calculation (Fund, Expense, Balance)
 */
export const getAllSpendBudgets = async (explicitUserId = null) => {
  try {
    const userId = explicitUserId || getAuthUserId();

    let query = supabase.from("spend_budgets").select("id, amount, type");

    if (userId) {
      query = query.or(`user_id.eq.${userId},user_id.is.null`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching all spend_budgets:", error);
      throw new Error(error.message || "Failed to calculate totals.");
    }

    let totalFund = 0;
    let totalExpense = 0;

    (data || []).forEach((item) => {
      const amt = parseFloat(item.amount) || 0;
      if (item.type === "Fund" || item.type === "Income") {
        totalFund += amt;
      } else {
        totalExpense += amt;
      }
    });

    return {
      totalFund,
      totalExpense,
      balance: totalFund - totalExpense,
    };
  } catch (err) {
    console.error("Spend budget totals error:", err);
    return { totalFund: 0, totalExpense: 0, balance: 0 };
  }
};

/**
 * Add a new Spend Budget entry:
 * ONLY Fund and Expense, without category functionality.
 */
export const createSpendBudget = async ({
  amount,
  type, // 'Fund' or 'Expense'
  note,
  date,
  userId: explicitUserId,
}) => {
  try {
    const userId = explicitUserId || getAuthUserId();

    const normalizedType =
      type === "Fund" || type === "Income" ? "Fund" : "Expense";

    const payload = {
      amount: parseFloat(amount),
      type: normalizedType,
      note: note ? note.trim() : null,
      date: date || new Date().toISOString().split("T")[0],
      ...(userId ? { user_id: userId } : {}),
    };

    const { data, error } = await supabase
      .from("spend_budgets")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("Supabase error inserting spend budget:", error);
      throw new Error(error.message || "Failed to create budget entry.");
    }

    return {
      id: data.id,
      amount: parseFloat(data.amount) || 0,
      type: data.type,
      note: data.note || "",
      date: data.date,
      created_at: data.created_at,
    };
  } catch (err) {
    console.error("Create spend budget error:", err);
    throw err;
  }
};

/**
 * Delete a Spend Budget entry
 */
export const deleteSpendBudget = async (id) => {
  try {
    if (!id) throw new Error("Entry ID is required.");

    const { error } = await supabase
      .from("spend_budgets")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase error deleting spend budget:", error);
      throw new Error(error.message || "Failed to delete budget entry.");
    }

    return true;
  } catch (err) {
    console.error("Delete spend budget error:", err);
    throw err;
  }
};
