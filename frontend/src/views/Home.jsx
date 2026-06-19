import React from 'react'
import Hero from '../components/Hero'
import FeatureCards from '../components/FeatureCards'
import Timeline from '../components/Timeline'

export default function Home(){
  return (
    <div className="space-y-8">
      <Hero />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <FeatureCards />

          <Timeline />
        </div>

        <aside className="space-y-6">
          <div className="p-6 bg-black/40 rounded-xl border border-white/6">
            <div className="text-sm text-gray-300">Live Demo</div>
            <div className="text-xl font-semibold text-white mt-2">Automated escrow workflows</div>
            <div className="mt-4 text-gray-400 text-sm">Use the dashboards to create jobs, submit work, and simulate AI/human review flows.</div>
          </div>

          <div className="p-6 bg-black/40 rounded-xl border border-white/6">
            <div className="text-sm text-gray-300">Demo Tips</div>
            <ol className="mt-3 text-sm text-gray-400 list-decimal ml-5 space-y-2">
              <li>Create a job as client and fund escrow using MetaMask.</li>
              <li>Submit work as freelancer.</li>
              <li>Use reviewer dashboard to resolve escalations.</li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  )
}
