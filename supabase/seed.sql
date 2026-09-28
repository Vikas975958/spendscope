-- ============================================================
-- seed.sql
-- Sample catalog data taken directly from the Product List &
-- Description and Course List docs. Prices are left at 0 —
-- update once pricing is finalized. Run with:
--   supabase db execute -f supabase/seed.sql
-- or paste into the SQL editor after the migrations have run.
-- ============================================================

do $$
declare
  v_pig_serum_id        uuid := gen_random_uuid();
  v_pig_pink_id         uuid := gen_random_uuid();
  v_pig_bright_id       uuid := gen_random_uuid();
  v_str_serum_id        uuid := gen_random_uuid();
  v_str_device_id       uuid := gen_random_uuid();
  v_bn_mask_id          uuid := gen_random_uuid();
  v_bn_butter_id        uuid := gen_random_uuid();
  v_bn_lotion_id        uuid := gen_random_uuid();

  v_pig_pink_10_id      uuid := gen_random_uuid();
  v_pig_bright_10_id    uuid := gen_random_uuid();

  v_pigmaregen_course_id uuid := gen_random_uuid();
  v_striaregen_course_id uuid := gen_random_uuid();

  v_pigmaregen_only_id    uuid := gen_random_uuid();
  v_pigmaregen_kit_id     uuid := gen_random_uuid();
  v_striaregen_only_id    uuid := gen_random_uuid();
  v_striaregen_kit_id     uuid := gen_random_uuid();
begin

  -- ---------- Pigmentation Solutions (locked) ----------
  insert into public.products (id, slug, name, category, is_locked, description, is_published) values
    (v_pig_serum_id,  'depigmentation-serum', 'Depigmentation Serum', 'pigmentation_solutions', true,
      'A gentle resurfacing formula designed to prepare pigmented skin before intensive brightening treatments.', true),
    (v_pig_pink_id,   'pink-brightening-cream', 'Pink Brightening Cream', 'pigmentation_solutions', true,
      'A targeted aftercare cream formulated to support skin recovery following professional intimate brightening treatments. Helps maintain a naturally pink appearance while promoting a more even-looking skin tone and reducing the appearance of future pigmentation. Ideal for nipples, intimate areas, and other delicate pigmented skin.', true),
    (v_pig_bright_id, 'brightening-intense-cream', 'Brightening Intense Cream', 'pigmentation_solutions', true,
      'A targeted aftercare formula developed to support professional brightening treatments. Helps maintain a visibly brighter, more even-looking skin tone while minimizing the appearance of recurring pigmentation for longer-lasting results. Ideal for underarms, inner thighs, body folds, knees, elbows, and other pigmented areas.', true);

  insert into public.product_variants (product_id, qty_label, price) values
    (v_pig_serum_id, '1 pcs', 0),
    (v_pig_pink_id, '10 pcs', 0),
    (v_pig_pink_id, '30 pcs', 0),
    (v_pig_pink_id, '50 pcs', 0),
    (v_pig_bright_id, '10 pcs', 0),
    (v_pig_bright_id, '30 pcs', 0),
    (v_pig_bright_id, '50 pcs', 0);

  select id into v_pig_pink_10_id from public.product_variants where product_id = v_pig_pink_id and qty_label = '10 pcs';
  select id into v_pig_bright_10_id from public.product_variants where product_id = v_pig_bright_id and qty_label = '10 pcs';

  -- ---------- Stretchmark Solutions (locked) ----------
  insert into public.products (id, slug, name, category, is_locked, description, is_published) values
    (v_str_serum_id,  'stretchmark-regeneration-serum', 'Stretchmark Regeneration Serum', 'stretchmark_solutions', true,
      'An advanced regenerative serum engineered with next-generation biotech actives to support skin renewal and improve the appearance of stretch marks, leaving skin visibly smoother, firmer, and healthier-looking.', true),
    (v_str_device_id, 'stretchmark-regen-device', 'Stretchmark Regen Device', 'stretchmark_solutions', true,
      'A next-generation professional skin treatment device engineered for precision, consistency, and optimal product delivery. Designed to enhance treatment performance while supporting advanced skin regeneration protocols with greater accuracy and control.', true);

  insert into public.product_variants (product_id, qty_label, price) values
    (v_str_serum_id, '1 pcs', 0),
    (v_str_device_id, '1 pcs', 0);

  -- ---------- Brightening Series / Blue Nila (open to everyone) ----------
  insert into public.products (id, slug, name, category, is_locked, description, key_ingredients, is_published) values
    (v_bn_mask_id,   'blue-nila-powder-mask', 'Blue Nila Powder Mask', 'brightening_series', false,
      'A luxurious brightening powder mask infused with Moroccan Blue Nila and advanced brightening actives to help tone-correct, brighten, and restore a smoother, more radiant complexion. Suitable for both face and body.',
      '["Moroccan Blue Nila","Alpha Arbutin","Niacinamide","Yoghurt Extract","Rice Extract"]'::jsonb, true),
    (v_bn_butter_id, 'blue-nila-exosome-body-butter', 'Blue Nila Exosome Body Butter', 'brightening_series', false,
      'An ultra-moisturizing body butter formulated with French-imported Blue Exosome and authentic Moroccan Blue Nila to deeply nourish, replenish moisture, and support healthier-looking skin. Enriched with Pentavitin® and Shea Butter for long-lasting hydration and a smoother, softer skin feel.',
      '["2% French Blue Exosome","1% Pentavitin","Moroccan Blue Nila","Shea Butter"]'::jsonb, true),
    (v_bn_lotion_id, 'blue-nila-exosome-tone-up-lotion', 'Blue Nila Exosome Tone Up Lotion', 'brightening_series', false,
      'A lightweight tone-up lotion formulated with French-imported Blue Exosome, Moroccan Blue Nila, 10% Niacinamide, and 1% Alpha Arbutin to instantly enhance skin radiance while helping improve the appearance of uneven skin tone. Leaves skin looking naturally brighter with a smooth, fresh finish.',
      '["2% French Blue Exosome","10% Niacinamide","1% Alpha Arbutin","Moroccan Blue Nila"]'::jsonb, true);

  insert into public.product_variants (product_id, qty_label, price) values
    (v_bn_mask_id, '1 pcs', 0),
    (v_bn_butter_id, '1 pcs', 0),
    (v_bn_lotion_id, '1 pcs', 0);

  -- ---------- Pigmaregen Course ----------
  insert into public.courses (id, slug, name, product_line, description, protocol_bullets, is_published) values
    (v_pigmaregen_course_id, 'pigmaregen-course', 'Pigmaregen™ Course', 'pigmentation',
      E'<p>Master VEELAB''s signature <strong>non-medical pigmentation system</strong> for <strong>Pink Intimate</strong> and <strong>Dark Fold Brightening</strong> treatments. Learn our exclusive treatment methodology through a comprehensive online program designed for beauty professionals, combining professional education, premium treatment products, and intelligent technology to help you deliver safe, consistent, and high-quality results.</p><p><strong>Powered by VEELAB AI™</strong> — our proprietary skin analysis platform, exclusively available to VEELAB professionals.</p>',
      '["Comprehensive course","Veelab PIGMAREGEN™ Signature Treatment Protocol","Pink Intimate & Dark Fold Brightening techniques","Exclusive VEELAB AI™ Skin Analysis System"]'::jsonb,
      true);

  insert into public.course_options (id, course_id, type, price, ai_credits, description, validity_days) values
    (v_pigmaregen_only_id, v_pigmaregen_course_id, 'course_only', 0, 30, E'Perfect for professionals who want to master the complete PIGMAREGEN™ treatment system through VEELAB''s online learning platform.', 7),
    (v_pigmaregen_kit_id, v_pigmaregen_course_id, 'course_plus_kit', 0, 30, 'The complete professional package for learning PIGMAREGEN™ treatment system and starting your treatments with confidence.', 7);

  insert into public.starter_kit_items (course_option_id, product_id, product_variant_id, quantity) values
    (v_pigmaregen_kit_id, v_pig_serum_id, null, 1),
    (v_pigmaregen_kit_id, v_pig_pink_id, v_pig_pink_10_id, 10),
    (v_pigmaregen_kit_id, v_pig_bright_id, v_pig_bright_10_id, 10);

  insert into public.course_product_unlock (course_id, unlocks_category) values
    (v_pigmaregen_course_id, 'pigmentation_solutions');

  -- ---------- Striaregen Course ----------
  insert into public.courses (id, slug, name, product_line, description, protocol_bullets, is_published) values
    (v_striaregen_course_id, 'striaregen-course', 'Striaregen™ Regeneration Course', 'stretchmark',
      E'<p>Master VEELAB''s professional <strong>non-medical stretchmark regeneration system</strong>, developed to improve the appearance of stretchmarks through advanced skin renewal techniques. This comprehensive online program combines expert education, premium professional products, and intelligent technology to help beauty professionals deliver consistent, high-quality results with confidence.</p><p><strong>Powered by VEELAB AI™</strong> — our proprietary skin analysis platform, exclusively available to VEELAB professionals.</p>',
      '["Comprehensive course","Veelab STRIAREGEN™ Signature Treatment Protocol","Professional treatment methodology","Exclusive VEELAB AI™ Skin Analysis System"]'::jsonb,
      true);

  insert into public.course_options (id, course_id, type, price, ai_credits, description, validity_days) values
    (v_striaregen_only_id, v_striaregen_course_id, 'course_only', 0, 30, E'Perfect for professionals who want to master VEELAB''s Stretchmark Regeneration treatment system through our online learning platform.', 7),
    (v_striaregen_kit_id, v_striaregen_course_id, 'course_plus_kit', 0, 30, 'The complete professional package for learning and performing stretchmark regeneration treatments with confidence.', 7);

  insert into public.starter_kit_items (course_option_id, product_id, product_variant_id, quantity) values
    (v_striaregen_kit_id, v_str_device_id, null, 1),
    (v_striaregen_kit_id, v_str_serum_id, null, 1);

  insert into public.course_product_unlock (course_id, unlocks_category) values
    (v_striaregen_course_id, 'stretchmark_solutions');

  -- ---------- AI Credit packages (placeholders — client to confirm) ----------
  insert into public.ai_credit_packages (name, credits_amount, price, sort_order) values
    ('10 Credits', 10, 0, 1),
    ('30 Credits', 30, 0, 2),
    ('50 Credits', 50, 0, 3);

end $$;
