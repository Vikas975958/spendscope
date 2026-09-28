"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getCategories as fetchCategoriesApi,
  createCategory as createCategoryApi,
  updateCategory as updateCategoryApi,
  deleteCategory as deleteCategoryApi,
} from "@/services/categoriesService";

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch categories from the backend service
   */
  const getCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCategoriesApi();
      setCategories(data || []);
    } catch (err) {
      const errMsg = err?.message || "Failed to load categories.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  /**
   * Create a new category
   * @param {string|object} nameOrPayload
   */
  const createCategory = async (nameOrPayload) => {
    setError(null);
    try {
      const newCategory = await createCategoryApi(nameOrPayload);
      if (newCategory) {
        setCategories((prev) => [...prev, newCategory]);
      }
      return { success: true, data: newCategory };
    } catch (err) {
      const errMsg = err?.message || "Failed to create category.";
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  /**
   * Update an existing user category
   * @param {number|string} id
   * @param {string|object} nameOrPayload
   */
  const updateCategory = async (id, nameOrPayload) => {
    setError(null);
    try {
      const updatedItem = await updateCategoryApi(id, nameOrPayload);
      if (updatedItem) {
        setCategories((prev) =>
          prev.map((cat) => (cat.id === id ? { ...cat, ...updatedItem } : cat))
        );
      }
      return { success: true, data: updatedItem };
    } catch (err) {
      const errMsg = err?.message || "Failed to update category.";
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  /**
   * Delete an existing user category
   * @param {number|string} id
   */
  const deleteCategory = async (id) => {
    setError(null);
    try {
      await deleteCategoryApi(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      return { success: true };
    } catch (err) {
      const errMsg = err?.message || "Failed to delete category.";
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  return {
    categories,
    loading,
    error,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};

export default useCategories;
