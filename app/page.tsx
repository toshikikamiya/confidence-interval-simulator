import React from 'react';
import dynamic from 'next/dynamic';

const ConfidenceIntervalSimulator = dynamic(
  () => import('@/components/ConfidenceIntervalSimulator'),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <ConfidenceIntervalSimulator />
    </main>
  );
}
