-- ============================================================
-- Update RLS policies to allow smooth demo & authenticated usage
-- ============================================================

-- 1. Transactions Policies
DROP POLICY IF EXISTS "Allow users to select their transactions" ON public.transactions;
CREATE POLICY "Allow users to select their transactions" ON public.transactions
    FOR SELECT
    USING (auth.uid() IS NULL OR user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "Allow users to insert transactions" ON public.transactions;
CREATE POLICY "Allow users to insert transactions" ON public.transactions
    FOR INSERT
    WITH CHECK (auth.uid() IS NULL OR user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "Allow users to update their transactions" ON public.transactions;
CREATE POLICY "Allow users to update their transactions" ON public.transactions
    FOR UPDATE
    USING (auth.uid() IS NULL OR user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "Allow users to delete their transactions" ON public.transactions;
CREATE POLICY "Allow users to delete their transactions" ON public.transactions
    FOR DELETE
    USING (auth.uid() IS NULL OR user_id = auth.uid() OR user_id IS NULL);

-- 2. Categories Policies
DROP POLICY IF EXISTS "Allow users to view categories" ON public.categories;
CREATE POLICY "Allow users to view categories" ON public.categories
    FOR SELECT
    USING (is_default = true OR user_id = auth.uid() OR user_id IS NULL OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Allow users to insert categories" ON public.categories;
CREATE POLICY "Allow users to insert categories" ON public.categories
    FOR INSERT
    WITH CHECK ((auth.uid() IS NULL OR user_id = auth.uid() OR user_id IS NULL) AND is_default = false);

DROP POLICY IF EXISTS "Allow users to update categories" ON public.categories;
CREATE POLICY "Allow users to update categories" ON public.categories
    FOR UPDATE
    USING ((auth.uid() IS NULL OR user_id = auth.uid() OR user_id IS NULL) AND is_default = false);

DROP POLICY IF EXISTS "Allow users to delete categories" ON public.categories;
CREATE POLICY "Allow users to delete categories" ON public.categories
    FOR DELETE
    USING ((auth.uid() IS NULL OR user_id = auth.uid() OR user_id IS NULL) AND is_default = false);
