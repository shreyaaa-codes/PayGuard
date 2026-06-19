import React from 'react'

export default function DashboardCard({title, value, children, accent}){
  return (
    <div className="p-6 bg-black/40 rounded-xl border border-white/6 shadow-soft-xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-300">{title}</div>
          <div className="text-2xl font-semibold text-white mt-1">{value}</div>
        </div>
        <div className={`px-3 py-1 rounded text-sm font-medium ${accent || 'bg-monad-600 text-white'}`}>Live</div>
      </div>
      {children && <div className="mt-4 text-sm text-gray-300">{children}</div>}
    </div>
  )
}
