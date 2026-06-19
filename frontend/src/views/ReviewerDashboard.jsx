import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function ReviewerDashboard(){
  const [jobs, setJobs] = useState([])

  useEffect(()=>{ fetchJobs() }, [])
  async function fetchJobs(){
    try{
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/jobs`)
      setJobs(res.data.filter(j=> j.status === 'escalated'))
    }catch(err){ console.error(err) }
  }

  async function decide(job, approve){
    try{
      const reviewer = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0]
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/jobs/${job._id}/review`, { approve, reviewerAddress: reviewer });
      alert('Decision recorded');
      fetchJobs();
    }catch(err){ console.error(err); alert('Decision failed') }
  }

  return (
    <div className="space-y-6">
      <div className="font-semibold text-white">Escalated Jobs</div>
      <div className="grid grid-cols-1 gap-4">
        {jobs.map(j=> (
          <div key={j._id} className="p-4 bg-white/2 rounded flex items-center justify-between">
            <div>
              <div className="font-medium text-white">{j.title}</div>
              <div className="text-sm text-gray-400">Status: {j.status}</div>
              <div className="text-sm text-gray-500">Client: {j.clientAddress}</div>
            </div>
            <div className="space-x-2">
              <button onClick={()=>decide(j, true)} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
              <button onClick={()=>decide(j, false)} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
