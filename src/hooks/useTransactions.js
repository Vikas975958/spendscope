"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getTransactions as fetchTransactionsApi,
  createTransaction as createTransactionApi,
  deleteTransaction as deleteTransactionApi,
} from "@/services/transactionsService";

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch all transactions
   */
  const getTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTransactionsApi();
      setTransactions(data || []);
    } catch (err) {
      setError(err?.message || "Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getTransactions();

    const handleResetEvent = () => {
      setTransactions([]);
      getTransactions();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("spendscope:transactions-reset", handleResetEvent);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("spendscope:transactions-reset", handleResetEvent);
      }
    };
  }, [getTransactions]);

  /**
   * Add a new transaction
   */
  const addTransaction = async (payload) => {
    setError(null);
    try {
      const newTx = await createTransactionApi(payload);
      if (newTx) {
        setTransactions((prev) => [newTx, ...prev]);
      }
      return { success: true, data: newTx };
    } catch (err) {
      const errMsg = err?.message || "Failed to add transaction.";
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  /**
   * Delete a transaction
   */
  const removeTransaction = async (id) => {
    setError(null);
    try {
      await deleteTransactionApi(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      return { success: true };
    } catch (err) {
      const errMsg = err?.message || "Failed to delete transaction.";
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  /**
   * Calculate financial totals: Total Income, Total Expense, Net Balance
   */
  const { totalIncome, totalExpense, balance } = useMemo(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach((t) => {
      const val = parseFloat(t.amount) || 0;
      if (t.type === "Income") {
        income += val;
      } else {
        expense += val;
      }
    });

    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
    };
  }, [transactions]);

  /**
   * Fetch paginated transactions on demand
   */
  const fetchPaginatedTransactions = useCallback(async (params) => {
    try {
      const result = await fetchTransactionsApi(params);
      return {
        data: result || [],
        totalCount: result?.totalCount ?? (result || []).length,
      };
    } catch (err) {
      console.error(err);
      return { data: [], totalCount: 0 };
    }
  }, []);

  return {
    transactions,
    loading,
    error,
    totalIncome,
    totalExpense,
    balance,
    getTransactions,
    fetchPaginatedTransactions,
    addTransaction,
    deleteTransaction: removeTransaction,
  };
};

export default useTransactions;
