import React from 'react'

export default function Hero(){
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-black/60 via-monad-800/30 to-black/40 p-8 sm:p-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">AI-Powered Escrow for Freelancers</h1>
          <p className="mt-4 text-lg text-gray-300 max-w-xl">Resolve disputes instantly with AI that compares original requirements to submissions. Fast, objective, and backed by human arbitration when needed.</p>

          <div className="mt-6 flex items-center space-x-4">
            <a href="/client" className="inline-flex items-center px-5 py-3 bg-monad-600 hover:bg-monad-500 text-white rounded-md shadow">Connect Wallet & Create Job</a>
            <a href="#features" className="text-sm text-gray-300 hover:text-white">Learn more</a>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 text-sm text-gray-400">
            <div className="bg-white/3 p-3 rounded">No platform fees</div>
            <div className="bg-white/3 p-3 rounded">Trustless smart-contract escrow</div>
            <div className="bg-white/3 p-3 rounded">Claude AI review (mockable)</div>
            <div className="bg-white/3 p-3 rounded">Human arbitration fallback</div>
          </div>
        </div>

        <div>
          <div className="bg-gradient-to-br from-monad-700 to-monad-500 p-6 rounded-xl shadow-soft-xl">
            <div className="text-sm text-white/80">Demo Preview</div>
            <div className="mt-4 bg-black/30 p-4 rounded-md">
              <div className="flex items-center justify-between text-white">
                <div>
                  <div className="text-xs text-gray-300">Job</div>
                  <div className="font-semibold">Logo & Branding Kit</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-300">Escrow</div>
                  <div className="font-semibold">0.05 ETH</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-200">
                <div className="p-2 bg-white/5 rounded">Freelancer: 0xAb...f3</div>
                <div className="p-2 bg-white/5 rounded">Client: 0xDe...a2</div>
              </div>

              <div className="mt-4 p-3 bg-black/40 rounded text-sm text-gray-100">Submission: <span className="text-gray-200">Uploaded (link)</span></div>

              <div className="mt-4 text-sm text-gray-200">AI Verdict: <span className="font-semibold">UNCERTAIN</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
