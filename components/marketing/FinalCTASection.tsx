import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';

export default function FinalCTASection() {
  return (
    <section className="bg-indigo-600 py-14 sm:py-16">
      <PageContainer>
        <div className="rounded-3xl bg-indigo-700/40 px-6 py-10 text-center text-white shadow-lg sm:px-10">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            先了解孩子的數學基礎，再安排升國一準備
          </h2>
          <p className="mt-4 text-sm text-indigo-100 sm:text-base">
            免費診斷報告讓家長有依據地安排暑期補強與先修規劃。
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
          >
            開始免費檢測
          </Link>
        </div>
      </PageContainer>
    </section>
  );
}

