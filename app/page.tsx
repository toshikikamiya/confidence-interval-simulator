'use client'

import dynamic from 'next/dynamic'

const ConfidenceIntervalSimulator = dynamic(
  () => import('../components/ConfidenceIntervalSimulator'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading Simulator...</p>
      </div>
    ),
  }
)

export default function Home() {
  return (
    <div className="container mx-auto py-8 px-4">
      <ConfidenceIntervalSimulator />
    </div>
  )
}
