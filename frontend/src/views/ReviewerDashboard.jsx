import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function ReviewerDashboard(){
  const [jobs, setJobs] = useState([])

  useEffect(()=>{ fetchJobs() }, [])
  async function fetchJobs(){
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/jobs`)
    setJobs(res.data.filter(j=>j.status==='escalated'))
  }

  async function decide(job, approve){
    const reviewer = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0]
    const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/jobs/${job._id}/review`, { approve, reviewerAddress: reviewer });
    alert('Decision recorded');
    fetchJobs();
  }

  return (
    <div>
      <h2 className="text-lg font-medium">Escalated Jobs</h2>
      <div className="mt-4 space-y-4">
        {jobs.map(j=> (
          <div key={j._id} className="p-4 bg-white rounded shadow">
            <div className="font-semibold">{j.title}</div>
            <div className="text-sm">Status: {j.status}</div>
            <div className="mt-2">
              <button onClick={()=>decide(j, true)} className="px-3 py-1 bg-green-600 text-white rounded mr-2">Approve</button>
              <button onClick={()=>decide(j, false)} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
