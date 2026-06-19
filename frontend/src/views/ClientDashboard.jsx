import React, { useEffect, useState } from 'react'
import DashboardCard from '../components/DashboardCard'
import axios from 'axios'

export default function ClientDashboard(){
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{ fetchJobs() }, [])

  async function fetchJobs(){
    try{
      setLoading(true)
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/jobs`)
      setJobs(res.data)
    }catch(err){ console.error(err) }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard title="Active Escrows" value={jobs.length}>
          Total jobs created
        </DashboardCard>

        <DashboardCard title="Funds Locked" value="0.12 ETH">
          Aggregate value in escrow (demo)
        </DashboardCard>

        <DashboardCard title="Pending Reviews" value="2">
          AI uncertain cases
        </DashboardCard>
      </div>

      <div className="p-6 bg-black/40 rounded-xl border border-white/6">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-white">Your Jobs</div>
          <div className="text-sm text-gray-400">Recent</div>
        </div>

        <div className="mt-4 space-y-4">
          {loading ? (
            <div className="text-gray-400">Loading jobs...</div>
          ) : (
            jobs.map(j=> (
              <div key={j._id} className="p-4 bg-white/2 rounded flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">{j.title}</div>
                  <div className="text-sm text-gray-400">Status: {j.status}</div>
                </div>
                <a href={`/job/${j._id}`} className="text-sm text-monad-600">View</a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
