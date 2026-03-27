import type { Dimension } from '@/lib/questions';
import { DIMENSION_LABEL } from '@/lib/questions';
import type { MvpMistakeRecord } from '@/types/mvp-funnel';
import type { MvpOverallLevel } from '@/types/mvp-funnel';

function dimLabels(dims: Dimension[]): string {
  return dims.map((d) => DIMENSION_LABEL[d]).join('、');
}

function uniqueMistakeSummary(mistakes: MvpMistakeRecord[]): { types: string[]; concepts: string[] } {
  const types = [...new Set(mistakes.map((m) => m.mistake_type))];
  const concepts = [...new Set(mistakes.map((m) => m.concept_tag))];
  return { types, concepts };
}

/**
 * 1. 顧問式總結（依等級策略 + 弱點向度）
 * 可選帶入姓名、總分，讓語氣更個人化。
 */
export function generateExecutiveSummary(
  level: MvpOverallLevel,
  weakDimensions: Dimension[],
  context?: { studentName?: string; totalScore?: number }
): string {
  const name = context?.studentName?.trim() || '孩子';
  const score = context?.totalScore;
  const weakStr = dimLabels(weakDimensions);
  const hasWeak = weakDimensions.length > 0;

  if (level === 'A') {
    const s = score !== undefined ? `本次檢測總分約 ${score} 分，` : '';
    return `${name} 的整體程度落在 A 等級，${s}代表在升國一先備上已具備明顯優勢。接下來的重點不是「補缺口」，而是把能力轉成國中題型的節奏與綜合度，並保留錯題追蹤習慣，讓段考穩定在高水準。${hasWeak ? `其中「${weakStr}」仍可當成精進切入點，用少量高品質題目做拔高即可。` : '五大面向相對均衡時，建議以先修＋專題整合為主，提前熟悉國一敘述長度與多步驟要求。'}`;
  }

  if (level === 'B') {
    const s = score !== undefined ? `總分約 ${score} 分，` : '';
    return `整體程度為 B 等級，${s}代表基礎大致到位，但升國一時「節奏變快、題目變長」仍可能放大落差。${hasWeak ? `目前較關鍵的落差集中在「${weakStr}」；這些面向在國一常與後續單元連動，暑假先補到更穩，開學後較不容易被一次塞入大量新符號與步驟壓垮。` : '建議用銜接班把解題格式、檢查習慣與題型轉換練熟，讓孩子進國中時是「帶著方法上場」，而不是硬跟進度。'}我們會建議以「銜接＋鞏固」為主，先把會的變穩，再把弱的變會。`;
  }

  if (level === 'C') {
    const s = score !== undefined ? `總分約 ${score} 分，` : '';
    return `整體程度為 C 等級，${s}顯示孩子仍具備一定基礎，但若以國一課堂節奏來看，有明顯跟不上班級進度的風險：並非能力不好，而是缺口會在開學後被進度快速放大。${hasWeak ? `優先處理「${weakStr}」這類結構性弱點，通常比盲目刷題更能看見分數與信心回溫。` : '建議把暑假視為「補齊門檻」的窗口，用分階段計畫把計算、讀題與列式習慣一次建立起來。'}現在處理的成本通常低於開學後每週追進度；越早把地基補好，後續越省力。`;
  }

  // D
  const s = score !== undefined ? `總分約 ${score} 分，` : '';
  return `整體程度為 D 等級，${s}代表多項先備仍偏薄弱；以顧問角度直言，若不在升國一前做有系統的重建，開學後容易出現「聽不懂→不想寫→更跟不上」的惡性循環。${hasWeak ? `本次特別需要正視的面向包含「${weakStr}」；建議從最底層可理解的小步驟開始，把正確率與題意轉換拉回來。` : '建議以重建基礎為唯一優先，先求能做對、再求做快，避免直接跳入國一綜合題。'}這不是標籤，而是一份路線圖：現在開始補，仍然來得及，但需要家長與孩子一起投入固定節奏。`;
}

/**
 * 2. 弱點摘要：結合錯因類型與概念標籤（若無錯題紀錄則依弱點向度敘述）
 */
export function generateWeaknessSummary(level: MvpOverallLevel, mistakes: MvpMistakeRecord[]): string {
  const { types, concepts } = uniqueMistakeSummary(mistakes);

  if (mistakes.length === 0) {
    if (level === 'A') {
      return '本次未蒐集到大量錯題模式，代表整體作答品質不錯。接下來可把力氣放在「錯因分類」與「題型整合」：即使是少數錯誤，也建議追出是計算、讀題還是觀念誤解，才能讓高程度維持得更久。';
    }
    if (level === 'B') {
      return '從向度分數來看，孩子不是「完全不會」，而是某些類型在升國一後會被放大成失分點。建議把錯題依「計算／讀題／列式／觀念」快速分類，每週固定一小時做針對性修正，通常兩三週就能看到穩定度提升。';
    }
    if (level === 'C') {
      return '綜合本次表現，弱點較像「分散但反覆」：單題看起來都差一點，累積後就會拉低整體。暑假適合用結構化練習把錯因收斂，避免開學後每一次段考都在補不同的洞。';
    }
    return '本次結果顯示基礎落差範圍較廣，更需要用「少量多次＋清楚訂正」重建信心。建議先從孩子最不抗拒的單元切入，把成功經驗拉回來，再逐步加大範圍。';
  }

  const typeStr = types.slice(0, 4).join('、');
  const conceptStr = concepts.slice(0, 5).join('、');

  const risk =
    level === 'A'
      ? '這些錯因多半可透過精準訂正在短期內收斂，適合做進階前的最後打磨。'
      : level === 'B'
        ? '這類錯誤在國一綜合題中會被放大，建議在銜接期先處理「列式與讀題習慣」，再談速度。'
        : level === 'C'
          ? '若開學前未處理，這些錯因容易在段考中反覆出現，形成「每次都差一點」的挫折感。'
          : '顧問建議把這些錯因視為重建順序的路標：先降難度、先把流程做對，再逐步加回題干長度與步驟數。';

  return `從錯題背後的模式來看，孩子較常出現的狀況包含：${typeStr}；相關概念集中在：${conceptStr}。${risk}家長只要把握一個原則：每次錯誤都要對應到「哪一種錯因」，而不是只改答案，進步會快很多。`;
}

/**
 * 3. 學習順序（1～3 步），依等級調整語氣與力度
 */
export function generateStudyPlan(level: MvpOverallLevel, weakDimensions: Dimension[]): string[] {
  const has = (d: Dimension) => weakDimensions.includes(d);
  const steps: string[] = [];

  const push = (s: string) => {
    if (!steps.includes(s)) steps.push(s);
  };

  if (level === 'D' || level === 'C') {
    if (has('number_sense') || weakDimensions.length === 0)
      push('第一步：先以整數、分數、小數與四則運算為核心，每天短時間練習，目標是「正確率優先」，建立可複製的計算與檢查流程。');
    if (has('algebra_logic') || (level === 'D' && weakDimensions.length === 0))
      push('第二步：在計算穩定後，進入等量關係與簡單列式，讓孩子練習把一句話寫成式子，銜接國一代數語言。');
    if (has('word_problem'))
      push('第三步：加入讀題與解題步驟（圈關鍵字、分段理解、驗算），把「看得懂」轉成「寫得出」，避免只靠直覺猜運算。');
    if (has('geometry')) push('幾何與度量可與前述並行或稍後，重點放在圖形意義與公式為何成立，而非死背。');
    if (has('data_reasoning')) push('資料判讀建議用生活圖表練習「一句話結論」，再進入比較與趨勢，降低對長題干的排斥。');
  } else if (level === 'B') {
    push('第一步：鎖定本次弱點向度，採「少量題目＋完整訂正」把漏洞補到 80 分以上的穩定度。');
    push('第二步：加入國一常見敘述長度與兩步驟以上的綜合題，訓練時間分配與格式書寫。');
    push('第三步：每週固定一次錯題回顧，讓錯因被追蹤，而不是考完就忘。');
  } else {
    push('第一步：維持計算與核心觀念的「保鮮練習」，每週一次即可，重點在質不在量。');
    push('第二步：以專題或挑戰題做拔高（多步驟、開放思考、錯題改編），銜接國一前段考思維。');
    push('第三步：建立自主檢核習慣（極限檢查、反向代入、另一種解法），讓高分能延續到國中。');
  }

  if (steps.length < 3) {
    const pad: Record<MvpOverallLevel, string[]> = {
      D: [
        '補齊最底層運算與單位理解，確保每題都能說出「為什麼這樣算」。',
        '用固定時段做訂正與複習，讓同一類錯誤不重複出現。',
        '逐步拉長題干與步驟數，模擬國一課堂節奏。',
      ],
      C: [
        '先把最常失分的題型做「小專題」集中突破，再進入下一類。',
        '每週保留一次親子檢視：只看錯因與步驟，不只看分數。',
        '搭配銜接教材，把「會的」先寫得穩，再談難度。',
      ],
      B: [
        '維持固定練習節奏並追蹤弱項是否回溫。',
        '加入綜合題與檢查習慣，減少粗心型失分。',
        '讓孩子口述解題策略，強化國中需要的表達與推理。',
      ],
      A: [
        '維持錯題追蹤與策略多樣化，避免只靠直覺解題。',
        '適度接觸開放與整合題，保留思考彈性。',
        '與老師對齊先修深度，避免過度超前造成反噬。',
      ],
    };
    for (const line of pad[level]) {
      if (steps.length >= 3) break;
      if (!steps.includes(line)) steps.push(line);
    }
  }

  return steps.slice(0, 3);
}

/**
 * 4. 家長建議（行為導向）
 */
export function generateParentAdvice(level: MvpOverallLevel): string[] {
  if (level === 'A') {
    return [
      '您可以用「每週一次檢核」取代盯每天寫很多：讓孩子講解一道題的完整思路，比多做十題更能穩住高程度。',
      '先修與拔高並行時，請留意情緒與負荷；目標是保持好奇與挑戰感，而不是提早透支。若孩子願意，安排試聽讓老師評估最適合的進階節奏，通常能少走冤枉路。',
    ];
  }
  if (level === 'B') {
    return [
      '這個分數帶的孩子最需要「固定節奏」：每天 20～30 分鐘比假日爆量更有效；家長只要協助守住時段，不必每題都會教。',
      '當孩子卡關時，先問「題目要你求什麼」與「已知有哪些」，再動筆；這能直接對應國中長題幹。建議預約試聽，由老師協助把弱點對應到具體班級與教材深度。',
    ];
  }
  if (level === 'C') {
    return [
      '請把暑假視為「降低開學風險」的投資：越早開始，越能用較溫和坡度補起來；越晚開始，壓力越容易落回孩子身上。',
      '陪伴重點放在「看得見的小成功」：一次只訂一個小目標，完成就具體肯定。若您不確定從哪裡下手，讓老師先看過孩子的作答習慣與錯因，會比盲目買題本更有效。',
    ];
  }
  return [
    '此階段最需要的是「不指責的重建」：把目標拆到孩子做得到的一步，並保留固定訂正時間。',
    '家長不必全程解題，但要全程參與節奏：幾點寫、寫多久、錯了怎麼改，比答案對錯更重要。建議盡快安排試聽，讓教學團隊協助建立可執行的基礎重建計畫。',
  ];
}

/**
 * 5. 課程推薦理由（依模板 id 產出成交導向一句話，疊加等級策略）
 */
export function generateCourseRecommendation(
  level: MvpOverallLevel,
  weakDimensions: Dimension[]
): Record<string, string> {
  const weakStr = dimLabels(weakDimensions);
  const focus = weakStr || '本次檢測所呈現的銜接需求';

  const levelHook =
    level === 'A'
      ? '孩子已具優勢，適合在「不拖慢」的前提下往先修與整合題前進，讓國一維持領先。'
      : level === 'B'
        ? '最符合「關鍵落差」的處理方式，是把弱點補穩並銜接國一節奏，避免開學被題量壓垮。'
        : level === 'C'
          ? '此程度最需要結構化引導與分階段目標，降低跟不上班級的風險，暑假是最佳時間點。'
          : '需要從能理解的小步驟重建信心與能力，由老師把教材難度與進度調到孩子跟得上的範圍。';

  return {
    course_foundation: `【${focus}】與計算／數感銜接高度相關。${levelHook} 先修基礎班能把運算與數量感拉到「國一課堂跟得上」的水準，後續代數與應用題才接得起來。`,
    course_word_problem: `錯題模式若常落在讀題、列式與情境轉換，與應用題加強班的核心訓練一致。${levelHook} 讓孩子學會「把題目講清楚再動筆」，對國中素養題特別關鍵。`,
    course_geometry: `圖形與度量若偏弱，開學後綜合圖形題容易一次失分很多。${levelHook} 圖形觀念班用觀念＋題型並行，補上「看得出關係」的能力，而不只是背公式。`,
    course_full_track: `若您希望暑假用一條完整路徑處理銜接，全科先修最省溝通成本。${levelHook} 由老師依本次弱點調整起點，把五大面向一次排進可執行的學習節奏。`,
  };
}

/** 給報告「具體學習建議」列表用（補足 UI；內容仍依等級與弱點） */
export function generateActionableStudySuggestions(
  level: MvpOverallLevel,
  weakDimensions: Dimension[]
): string[] {
  const has = (d: Dimension) => weakDimensions.includes(d);
  const out: string[] = [];

  if (has('number_sense'))
    out.push('計算面：每天 10～15 分鐘，只做「會做但易錯」的題型，並用一道題寫出完整檢查步驟。');
  if (has('algebra_logic'))
    out.push('代數面：練習「口頭翻譯」—把文字敘述說成等量關係，再寫成式子；先求對，再求快。');
  if (has('word_problem'))
    out.push('應用題：規定自己先寫「求什麼、給什麼、用什麼關係」三行，再列式，減少漏讀與誤解。');
  if (has('geometry'))
    out.push('幾何：每題都草繪圖形並標已知條件，先問「這個量在圖上代表什麼」再代公式。');
  if (has('data_reasoning'))
    out.push('圖表：練習用一句話描述趨勢或差異，再回頭找數據證明，符合國中素養題表述方式。');

  if (out.length < 2) {
    if (level === 'A')
      out.push('安排每週一次整合題或競賽思維小挑戰，並保留錯題本做「改寫題目」訓練。');
    else if (level === 'B')
      out.push('每週選定兩個弱點小主題，各做 3～5 題就停，重點是訂正與口述思路。');
    else out.push('以 20 分鐘為一單位，完成「練習—訂正—複習」閉環，比單次寫很久更能建立節奏。');
  }

  return out.slice(0, 4);
}
