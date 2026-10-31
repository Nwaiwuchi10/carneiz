import { Suspense } from 'react';
import TrackOrderPage from '@/src/views/track-order';

export default function AppTrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafafa]" />}>
      <TrackOrderPage />
    </Suspense>
  );
}
