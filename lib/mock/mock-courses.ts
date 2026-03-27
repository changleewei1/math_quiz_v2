import type { Course } from '@/types/quiz';

const now = '2026-03-14T00:00:00.000Z';

export const mockCourses: Course[] = [
  {
    id: 'course-001',
    title: '國一先修基礎班',
    description:
      '打穩整數與代數先備觀念，從計算到簡單等式一步步建立國中數學核心能力。',
    target_weaknesses: ['number_sense', 'algebra_logic'],
    cta_link: 'https://example.com/courses/foundation',
    is_active: true,
    sort_order: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'course-002',
    title: '應用題閱讀理解加強班',
    description:
      '從題意拆解到建立算式，訓練閱讀理解與解題流程，提升應用題正確率。',
    target_weaknesses: ['word_problem'],
    cta_link: 'https://example.com/courses/reading',
    is_active: true,
    sort_order: 2,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'course-003',
    title: '圖形觀念先修班',
    description:
      '補足圖形觀察、角度與面積周長概念，讓幾何題不再卡關。',
    target_weaknesses: ['geometry'],
    cta_link: 'https://example.com/courses/geometry',
    is_active: true,
    sort_order: 3,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'course-004',
    title: '升國一全科數學先修班',
    description:
      '整合數感、代數、應用題與幾何觀念的暑期先修課程，適合多向度需要補強的學生。',
    target_weaknesses: [
      'number_sense',
      'algebra_logic',
      'word_problem',
      'geometry',
      'data_reasoning',
    ],
    cta_link: 'https://example.com/courses/comprehensive',
    is_active: true,
    sort_order: 4,
    created_at: now,
    updated_at: now,
  },
];

