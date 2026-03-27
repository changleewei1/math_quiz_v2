import PageContainer from '@/components/layout/PageContainer';
import SectionHeader from '@/components/marketing/SectionHeader';

const faqs = [
  {
    question: '這份檢測適合誰？',
    answer: '適合小學六年級升國一的學生與家長，尤其想了解暑假補強方向的家庭。',
  },
  {
    question: '需要花多久時間？',
    answer: '約 10 分鐘即可完成測驗並取得初步分析結果。',
  },
  {
    question: '做完會得到什麼？',
    answer: '可獲得 AI 弱點分析、向度分數摘要、補救建議與課程銜接方向。',
  },
  {
    question: '檢測是免費的嗎？',
    answer: '是的，本診斷完全免費，目的在於協助家長了解孩子狀況。',
  },
  {
    question: '做完一定要報名嗎？',
    answer: '不需要強制報名，分析結果可作為家長的學習規劃參考。',
  },
];

export default function FAQSection() {
  return (
    <section className="bg-slate-50 py-14 sm:py-16">
      <PageContainer>
        <SectionHeader
          title="常見問題"
          subtitle="想先了解更多？以下是家長最常詢問的問題。"
        />
        <div className="mt-10 space-y-4">
          {faqs.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900">
                {item.question}
              </summary>
              <p className="mt-3 text-sm text-slate-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}


