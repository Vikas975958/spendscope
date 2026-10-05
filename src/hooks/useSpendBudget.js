"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getSpendBudgets,
  getAllSpendBudgets,
  createSpendBudget,
  deleteSpendBudget,
} from "@/services/spendBudgetService";

export const useSpendBudget = () => {
  const [budgets, setBudgets] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totals, setTotals] = useState({
    totalFund: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  /*
   * Refresh summary totals (Fund, Expense, Balance)
   */
  const loadTotals = useCallback(async () => {
    try {
      const summary = await getAllSpendBudgets();
      setTotals(summary);
    } catch (err) {
      console.error("Failed to load totals:", err);
    }
  }, []);

  /**
   * Fetch paginated spend budget entries
   */
  const fetchPaginatedBudgets = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSpendBudgets(params);
        setBudgets(data || []);
        setTotalCount(data?.totalCount ?? (data || []).length);
        return {
          data: data || [],
          totalCount: data?.totalCount ?? (data || []).length,
        };
      } catch (err) {
        const errMsg = err?.message || "Failed to load budget entries.";
        setError(errMsg);
        return { data: [], totalCount: 0 };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadTotals();
  }, [loadTotals]);

  /**
   * Add a new entry (ONLY Fund and Expense, without categories)
   */
  const addEntry = async ({ amount, type, note, date }) => {
    setError(null);
    try {
      const newEntry = await createSpendBudget({ amount, type, note, date });
      await loadTotals();
      return { success: true, data: newEntry };
    } catch (err) {
      const errMsg = err?.message || "Failed to add budget entry.";
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  /**
   * Delete an entry
   */
  const removeEntry = async (id) => {
    setError(null);
    try {
      await deleteSpendBudget(id);
      await loadTotals();
      return { success: true };
    } catch (err) {
      const errMsg = err?.message || "Failed to delete budget entry.";
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  return {
    budgets,
    totalCount,
    totals,
    totalFund: totals.totalFund,
    totalExpense: totals.totalExpense,
    balance: totals.balance,
    loading,
    error,
    fetchPaginatedBudgets,
    loadTotals,
    addEntry,
    deleteEntry: removeEntry,
  };
};

export default useSpendBudget;
