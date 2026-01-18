/**
 * 年級（科目）與學期定義
 */

export type GradeId = 'J1-MATH' | 'J2-MATH' | 'J3-MATH' | 'J2-SCI' | 'J3-SCI';

export type Term = 'upper' | 'lower';

export interface Grade {
  id: GradeId;
  name: string;  // 顯示名稱：國一數學、國二數學等
}

/**
 * 年級列表定義
 */
export const GRADES: Grade[] = [
  { id: 'J1-MATH', name: '國一數學' },
  { id: 'J2-MATH', name: '國二數學' },
  { id: 'J3-MATH', name: '國三數學' },
  { id: 'J2-SCI', name: '國二理化' },
  { id: 'J3-SCI', name: '國三理化' },
];

/**
 * 學期列表定義
 */
export const TERMS: { id: Term; name: string }[] = [
  { id: 'upper', name: '上學期' },
  { id: 'lower', name: '下學期' },
];

/**
 * 根據 grade_id 取得顯示名稱
 */
export function getGradeName(gradeId: GradeId): string {
  const grade = GRADES.find(g => g.id === gradeId);
  return grade?.name || gradeId;
}

/**
 * 根據 term 取得顯示名稱
 */
export function getTermName(term: Term): string {
  const termObj = TERMS.find(t => t.id === term);
  return termObj?.name || term;
}


