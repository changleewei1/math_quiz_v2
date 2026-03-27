import BookingPageClient from '@/components/booking/BookingPageClient';
import { parseBookingUrlParams } from '@/components/booking/booking-utils';

interface BookingPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const sp = await searchParams;
  const initialParams = parseBookingUrlParams({
    studentName: first(sp.studentName),
    name: first(sp.name),
    level: first(sp.level),
    overallLevel: first(sp.overallLevel),
    weak: first(sp.weak),
    weakDimensions: first(sp.weakDimensions),
    course: first(sp.course),
    recommendedCourse: first(sp.recommendedCourse),
    sessionId: first(sp.sessionId),
    leadId: first(sp.leadId),
  });

  return <BookingPageClient initialParams={initialParams} />;
}
