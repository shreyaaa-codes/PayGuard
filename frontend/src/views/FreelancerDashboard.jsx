import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function FreelancerDashboard(){
  const [jobs, setJobs] = useState([])
  const [submission, setSubmission] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(()=>{ fetchJobs() }, [])
  async function fetchJobs(){
    try{
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/jobs`)
      setJobs(res.data.filter(j=> j.freelancer && j.freelancer.toLowerCase() === (window.ethereum?.selectedAddress || '').toLowerCase() || j.status === 'funded'))
    }catch(err){ console.error(err) }
  }

  async function submitWork(job){
    try{
      const freelancerAddress = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0]
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/jobs/${job._id}/submit`, { submissionUri: submission, freelancerAddress });
      alert('Submitted. AI result: ' + res.data.aiResult.decision);
      fetchJobs();
    }catch(err){ console.error(err); alert('Submission failed') }
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-black/40 rounded-xl border border-white/6">
        <div className="font-semibold text-white">Assigned Jobs</div>
        <div className="mt-4 text-sm text-gray-400">Jobs assigned to you or available to accept.</div>

        <div className="mt-4 grid grid-cols-1 gap-4">
          {jobs.map(j=> (
            <div key={j._id} className="p-4 bg-white/2 rounded flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-medium text-white">{j.title}</div>
                <div className="text-sm text-gray-400">Status: {j.status}</div>
                <div className="text-sm text-gray-500 mt-1">Client: {j.clientAddress}</div>
              </div>

              <div className="mt-3 md:mt-0 w-full md:w-1/2">
                <input className="w-full p-2 rounded bg-white/5 border border-white/6 text-sm" placeholder="Submission URL or notes" value={selected===j._id ? submission : ''} onChange={(e)=>{ setSelected(j._id); setSubmission(e.target.value)}} />
                <div className="mt-2 flex justify-end">
                  <button onClick={()=>submitWork(j)} className="px-4 py-2 bg-monad-600 rounded text-white">Submit Work</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
