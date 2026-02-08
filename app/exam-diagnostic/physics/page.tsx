'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ExamDiagnosticPhysicsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/mock-exam');
  }, [router]);

  return null;
}

