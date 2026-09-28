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
 * Fetch all categories dynamically from Supabase categories table.
 * Returns default categories (is_default = true) and user's custom categories.
 */
export const getCategories = async (explicitUserId) => {
  try {
    const userId = explicitUserId || getAuthUserId();
    let query = supabase.from("categories").select("*");

    if (userId) {
      query = query.or(`is_default.eq.true,user_id.eq.${userId},user_id.is.null`);
    } else {
      query = query.or("is_default.eq.true,user_id.is.null");
    }

    const { data, error } = await query
      .order("is_default", { ascending: false })
      .order("name", { ascending: true });

    if (error) {
      console.error("Supabase categories fetch error:", error);
      throw new Error(error.message || "Failed to fetch categories.");
    }

    return (data || []).map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type || "Expense",
      icon: "🏷️",
      color_code: c.color_code || "#FF6B6B",
      is_default: c.is_default ?? false,
      user_id: c.user_id,
      created_at: c.created_at,
    }));
  } catch (err) {
    console.error("Error in getCategories service:", err);
    throw err;
  }
};

/**
 * Create category in Supabase categories table.
 * Supports string name or object { name, type, icon, color_code }.
 */
export const createCategory = async (payload, explicitUserId) => {
  try {
    const categoryName = typeof payload === "string" ? payload.trim() : payload?.name?.trim();
    if (!categoryName) {
      throw new Error("Category name is required.");
    }

    const userId = explicitUserId || getAuthUserId();

    const insertPayload = {
      name: categoryName,
      type: typeof payload === "object" ? payload.type || "Expense" : "Expense",
      icon: "🏷️",
      color_code: typeof payload === "object" ? payload.color_code || "#FF6B6B" : "#FF6B6B",
      is_default: false,
      ...(userId ? { user_id: userId } : {}),
    };

    const { data, error } = await supabase
      .from("categories")
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      if (error.code === "23505" || error.message.includes("unique")) {
        throw new Error("A category with this name already exists.");
      }
      throw new Error(error.message || "Failed to create category.");
    }

    return data;
  } catch (err) {
    console.error("Error in createCategory service:", err);
    throw err;
  }
};

/**
 * Update category in Supabase categories table.
 * Supports string name or object with fields to update.
 */
export const updateCategory = async (id, payload) => {
  try {
    if (!id) throw new Error("Category ID is required.");

    const updatePayload = typeof payload === "string" ? { name: payload.trim() } : payload;

    const { data, error } = await supabase
      .from("categories")
      .update(updatePayload)
      .eq("id", id)
      .eq("is_default", false)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || "Failed to update category.");
    }

    return data;
  } catch (err) {
    console.error("Error in updateCategory service:", err);
    throw err;
  }
};

/**
 * Delete category in Supabase categories table.
 */
export const deleteCategory = async (id) => {
  try {
    if (!id) throw new Error("Category ID is required.");

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("is_default", false);

    if (error) {
      throw new Error(error.message || "Failed to delete category.");
    }

    return true;
  } catch (err) {
    console.error("Error in deleteCategory service:", err);
    throw err;
  }
};
