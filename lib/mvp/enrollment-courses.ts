/**
 * 招生版推薦課程（靜態目錄，報告頁依檢測結果帶入推薦理由）
 */
export type EnrollmentCourseTemplate = {
  id: string;
  title: string;
  description: string;
  targetStudents: string;
  ctaLabel: string;
};

export const ENROLLMENT_COURSE_TEMPLATES: EnrollmentCourseTemplate[] = [
  {
    id: 'course_foundation',
    title: '國一先修基礎班',
    description:
      '系統複習整數、分數、小數與四則運算，並銜接國中代數符號與簡單方程式，適合需要先穩住計算與數感的學生。',
    targetStudents: '升國一、計算易粗心或數感不穩定的學生',
    ctaLabel: '了解課程內容',
  },
  {
    id: 'course_word_problem',
    title: '應用題閱讀理解加強班',
    description:
      '從讀題、抓關鍵字、畫圖與列式開始，練習把生活情境轉成數學式子，降低「看得懂字、寫不出式」的狀況。',
    targetStudents: '題意理解弱、應用題常卡關的學生',
    ctaLabel: '了解課程內容',
  },
  {
    id: 'course_geometry',
    title: '圖形觀念先修班',
    description:
      '建立角度、周長、面積與基本圖形性質的直覺，搭配題型演練，讓幾何題不再只靠死背公式。',
    targetStudents: '圖形題常錯、空間與度量觀念需加強的學生',
    ctaLabel: '了解課程內容',
  },
  {
    id: 'course_full_track',
    title: '升國一全科數學先修班',
    description:
      '依國一上學期重點設計，涵蓋數與量、代數入門、幾何與資料判讀，適合希望一次補齊銜接度的家庭。',
    targetStudents: '希望暑假完整銜接國一數學、建立學習節奏的學生',
    ctaLabel: '了解課程內容',
  },
];
