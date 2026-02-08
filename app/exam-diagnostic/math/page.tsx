'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ExamDiagnosticMathPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/mock-exam');
  }, [router]);

  return null;
}

