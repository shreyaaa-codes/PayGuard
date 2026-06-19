import React from 'react'

const Card = ({title, children, icon})=> (
  <div className="p-6 bg-black/40 rounded-lg border border-white/6">
    <div className="flex items-start space-x-4">
      <div className="w-10 h-10 rounded-md bg-gradient-to-br from-monad-500 to-monad-700 flex items-center justify-center text-white">{icon}</div>
      <div>
        <div className="font-semibold text-white">{title}</div>
        <div className="text-sm text-gray-300 mt-2">{children}</div>
      </div>
    </div>
  </div>
)

export default function FeatureCards(){
  return (
    <section id="features" className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card title="Secure Smart Contract Escrow" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L20 8V16L12 22L4 16V8L12 2Z" fill="white"/></svg>}>
        Funds are locked in a Monad smart contract — neither party can withdraw unilaterally.
      </Card>

      <Card title="AI-Powered Work Verification" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L20 8V16L12 22L4 16V8L12 2Z" fill="white"/></svg>}>
        Claude reads the original requirements and submission and provides an objective verdict.
      </Card>

      <Card title="Instant Payment Release" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L20 8V16L12 22L4 16V8L12 2Z" fill="white"/></svg>}>
        Approved work triggers automatic on-chain release — no manual withdrawals needed.
      </Card>

      <Card title="Human Arbitration Fallback" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L20 8V16L12 22L4 16V8L12 2Z" fill="white"/></svg>}>
        When AI is uncertain, cases escalate to a human reviewer for final resolution.
      </Card>
    </section>
  )
}
