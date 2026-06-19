import React from 'react'

const Step = ({label, isActive})=> (
  <div className="flex items-center">
    <div className={`w-8 h-8 flex items-center justify-center rounded-full ${isActive? 'bg-monad-600':'bg-white/5'}`}></div>
    <div className="ml-3 text-sm text-gray-300">{label}</div>
  </div>
)

export default function Timeline(){
  const steps = [
    'Client Creates Job',
    'Funds Escrow',
    'Freelancer Submits Work',
    'AI Reviews',
    'Payment Released'
  ]

  return (
    <section className="mt-12 p-6 bg-black/30 rounded-lg border border-white/6">
      <h3 className="text-lg font-semibold text-white">Workflow</h3>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
        {steps.map((s,i)=>(
          <div key={s} className="flex flex-col items-center text-center">
            <Step label={s} isActive={i<3} />
            {i < steps.length-1 && <div className="h-0.5 bg-white/6 w-full mt-3"></div>}
          </div>
        ))}
      </div>
    </section>
  )
}
