import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function FreelancerDashboard(){
  const [jobs, setJobs] = useState([])
  const [submission, setSubmission] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(()=>{ fetchJobs() }, [])
  async function fetchJobs(){
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/jobs`)
    setJobs(res.data)
  }

  async function submitWork(job){
    const freelancerAddress = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0]
    const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/jobs/${job._id}/submit`, { submissionUri: submission, freelancerAddress });
    alert('Submitted: ' + JSON.stringify(res.data.aiResult));
    fetchJobs();
  }

  return (
    <div>
      <h2 className="text-lg font-medium">Assigned Jobs</h2>
      <div className="grid grid-cols-1 gap-4 mt-4">
        {jobs.map((j)=>(
          <div key={j._id} className="p-4 bg-white rounded shadow">
            <div className="font-semibold">{j.title}</div>
            <div className="text-sm text-gray-500">Freelancer: {j.freelancer}</div>
            <div className="text-sm">Status: {j.status}</div>
            <div className="mt-2">
              <input className="w-full p-2 border rounded" placeholder="Submission URL or summary" value={selected===j._id ? submission : ''} onChange={(e)=>{ setSelected(j._id); setSubmission(e.target.value)}} />
              <button onClick={()=>submitWork(j)} className="mt-2 px-3 py-1 bg-blue-600 text-white rounded">Submit Work</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
