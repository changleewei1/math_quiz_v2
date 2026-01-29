-- 最小測試題庫（每個題型最多 1 題）
-- 目的：讓練習/診斷流程能跑通，不依賴大量題目

insert into questions (
  id,
  chapter_id,
  type_id,
  difficulty,
  qtype,
  prompt,
  answer,
  choices,
  correct_choice_index,
  explain,
  is_active
)
select
  gen_random_uuid(),
  qt.chapter_id,
  qt.id,
  'easy'::difficulty_level,
  'mcq'::question_type_enum,
  concat('測試題：', qt.code, ' ', qt.name),
  'A',
  to_jsonb(array['A', 'B', 'C', 'D']),
  0,
  '最小測試題，供流程驗證使用',
  true
from question_types qt
where qt.is_active = true
  and not exists (
    select 1
    from questions q
    where q.type_id = qt.id
  )
limit 30;

