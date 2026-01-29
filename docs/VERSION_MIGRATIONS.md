# v1 / v2 / v3 Supabase 版本清單

目標：清楚區分每個版本要套用的 SQL。

> 執行順序：**schema → seed → feature**

---

## v1（空機版 / 無題目）

### 必要
1. `supabase/schema.sql`
2. `supabase/seed.sql`
3. `supabase/seed_j1_math_upper_skill_tree.sql`
4. `supabase/seed_j1_math_lower_skill_tree.sql`
5. `supabase/seed_j2_math_upper_skill_tree.sql`
6. `supabase/seed_j2_math_lower_skill_tree.sql`
7. `supabase/seed_j3_math_upper_skill_tree.sql`
8. `supabase/seed_j3_math_lower_skill_tree.sql`
9. `supabase/seed_j2_sci_upper_skill_tree.sql`
10. `supabase/seed_j2_sci_lower_skill_tree.sql`
11. `supabase/seed_j3_sci_upper_skill_tree.sql`
12. `supabase/seed_j3_sci_lower_skill_tree.sql`

### 選用
- `supabase/add_brand_settings.sql`
- `supabase/add_classes.sql`
- `supabase/add_teachers.sql`
- `supabase/add_students.sql`

---

## v2（題庫版）

### 必要（含 v1）
- v1 全部

### 題庫
- `supabase/seed_min_questions.sql`（最小題庫）
  - 若你有完整題庫，改用 `supabase/seed_questions.sql` 或自訂匯入

---

## v3（功能擴充版）

### 必要（含 v2）
- v2 全部

### 新功能
- `supabase/add_diagnostic_tables.sql`
- `supabase/migrations/20260118_add_exam_questions.sql`
- `supabase/migrations/20260118_enable_rls_min.sql`

---

## 注意事項

- 若你要每個客戶獨立部署，建議每個版本使用**獨立 Supabase 專案**
- RLS 啟用後，server 必須使用 `SUPABASE_SERVICE_ROLE_KEY`

