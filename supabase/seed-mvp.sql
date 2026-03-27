-- =========================================================
-- 升國一數學弱點分析 MVP Seed Data
-- =========================================================

-- Questions
INSERT INTO admission_questions (
  id, prompt, image_url, choices, correct_answer, explanation, dimension, difficulty, is_active, sort_order
) VALUES
  (
    '2b2d5f2d-4ab0-4a05-8d2f-4b3c0b8b6f01',
    '小華有 250 元，買文具花 178 元，還剩多少元？',
    NULL,
    '["62","72","78","82"]',
    '72',
    '用 250 - 178 = 72。',
    'number_sense',
    'easy',
    true,
    1
  ),
  (
    'fb5d6a8e-3e9b-4a2d-83a1-0f9f1cf5a202',
    '哪個分數最大？',
    NULL,
    '["3/5","5/8","2/3","7/12"]',
    '2/3',
    '2/3 約為 0.666，大於其他選項。',
    'number_sense',
    'medium',
    true,
    2
  ),
  (
    'ae7b1c9c-08e4-4f3a-9b86-8c0b8e4c1b03',
    '0.8 + 1.35 = ?',
    NULL,
    '["2.05","2.15","2.25","1.95"]',
    '2.15',
    '小數點對齊相加：0.8 + 1.35 = 2.15。',
    'number_sense',
    'hard',
    true,
    3
  ),
  (
    '9c75c1a3-3f3e-4d1f-9ad8-40e0b7b2c404',
    '若 x + 7 = 20，x = ?',
    NULL,
    '["10","12","13","14"]',
    '13',
    '20 - 7 = 13。',
    'algebra_logic',
    'easy',
    true,
    4
  ),
  (
    'f3ed2a34-7b9a-4dc8-9b64-5a6f4a8a5505',
    '2, 4, 7, 11, 16, ?',
    NULL,
    '["21","22","23","24"]',
    '22',
    '差為 2,3,4,5，下一個差為 6，所以 16 + 6 = 22。',
    'algebra_logic',
    'medium',
    true,
    5
  ),
  (
    'b1cf0f8d-2d39-4ef2-9e9b-0fda1c1a8d06',
    '若 a - 5 = 12，則 a + 3 = ?',
    NULL,
    '["18","19","20","21"]',
    '20',
    'a = 17，所以 a + 3 = 20。',
    'algebra_logic',
    'hard',
    true,
    6
  ),
  (
    '6e60cf18-57e1-4c3f-8c9c-6f2d19e9c607',
    '一本書 45 元，買 3 本再用 10 元袋子，總共多少？',
    NULL,
    '["140","145","150","155"]',
    '145',
    '45 × 3 = 135，135 + 10 = 145。',
    'word_problem',
    'easy',
    true,
    7
  ),
  (
    '14c7c2d9-9fb2-4bb6-8f4f-6c2b1c9f8c08',
    '水桶有 18 公升水，先倒出 5 公升，再平均分成 2 桶，每桶幾公升？',
    NULL,
    '["6","6.5","7","7.5"]',
    '6.5',
    '(18 - 5) ÷ 2 = 6.5。',
    'word_problem',
    'medium',
    true,
    8
  ),
  (
    '7a34d1bf-88a5-4d6a-9d69-4c9f4a9a9f09',
    '班上 32 人，女生比男生多 4 人，男生幾人？',
    NULL,
    '["12","14","16","18"]',
    '14',
    '設男生為 x，女生為 x+4，2x+4=32，x=14。',
    'word_problem',
    'hard',
    true,
    9
  ),
  (
    '4f0d55e5-4fb6-4f93-9f2f-3e4c3d2f0a10',
    '三角形內角和為幾度？',
    NULL,
    '["90","180","270","360"]',
    '180',
    '三角形內角和固定為 180 度。',
    'geometry',
    'easy',
    true,
    10
  ),
  (
    '3a0e2b1a-2f1c-4c4a-8b19-4fb01bfb0b11',
    '長方形長 8 公分、寬 5 公分，面積多少？',
    NULL,
    '["13","30","40","48"]',
    '40',
    '面積 = 長 × 寬 = 8 × 5 = 40。',
    'geometry',
    'medium',
    true,
    11
  ),
  (
    '8d4bba62-0c5a-4c6d-9c3b-5e1f5b8d2c12',
    '正方形的周長是 24 公分，邊長是多少？',
    NULL,
    '["4","5","6","8"]',
    '6',
    '正方形周長 = 4 × 邊長，所以邊長 = 24 ÷ 4 = 6。',
    'geometry',
    'hard',
    true,
    12
  ),
  (
    '1b2f7f4c-2c0a-4f4c-86c0-7b2b9c3f0d13',
    '表格：A班 18 人、B班 22 人、C班 20 人，哪班人數最多？',
    NULL,
    '["A班","B班","C班","一樣多"]',
    'B班',
    '22 人最多，所以 B 班最多。',
    'data_reasoning',
    'easy',
    true,
    13
  ),
  (
    'f5a3b2a1-7b1f-4e45-8e9e-0b6c2c1f0e14',
    '長條圖顯示：蘋果 30、香蕉 20、橘子 25，蘋果比香蕉多幾個？',
    NULL,
    '["5","10","15","20"]',
    '10',
    '30 - 20 = 10。',
    'data_reasoning',
    'medium',
    true,
    14
  ),
  (
    'd1a2b3c4-5d6e-4f70-8a9b-0c1d2e3f4a15',
    '四次測驗分數 70, 80, 75, 85，平均分數多少？',
    NULL,
    '["75","77.5","78","80"]',
    '77.5',
    '(70 + 80 + 75 + 85) ÷ 4 = 77.5。',
    'data_reasoning',
    'hard',
    true,
    15
  )
ON CONFLICT (id) DO UPDATE SET
  prompt = EXCLUDED.prompt,
  image_url = EXCLUDED.image_url,
  choices = EXCLUDED.choices,
  correct_answer = EXCLUDED.correct_answer,
  explanation = EXCLUDED.explanation,
  dimension = EXCLUDED.dimension,
  difficulty = EXCLUDED.difficulty,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

-- Courses
INSERT INTO courses (
  id, title, description, target_weaknesses, cta_link, is_active, sort_order
) VALUES
  (
    'course-001',
    '國一先修基礎班',
    '打穩整數與代數先備觀念，從計算到簡單等式一步步建立國中數學核心能力。',
    '["number_sense","algebra_logic"]',
    'https://example.com/courses/foundation',
    true,
    1
  ),
  (
    'course-002',
    '應用題閱讀理解加強班',
    '從題意拆解到建立算式，訓練閱讀理解與解題流程，提升應用題正確率。',
    '["word_problem"]',
    'https://example.com/courses/reading',
    true,
    2
  ),
  (
    'course-003',
    '圖形觀念先修班',
    '補足圖形觀察、角度與面積周長概念，讓幾何題不再卡關。',
    '["geometry"]',
    'https://example.com/courses/geometry',
    true,
    3
  ),
  (
    'course-004',
    '升國一全科數學先修班',
    '整合數感、代數、應用題與幾何觀念的暑期先修課程，適合多向度需要補強的學生。',
    '["number_sense","algebra_logic","word_problem","geometry","data_reasoning"]',
    'https://example.com/courses/comprehensive',
    true,
    4
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  target_weaknesses = EXCLUDED.target_weaknesses,
  cta_link = EXCLUDED.cta_link,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;


