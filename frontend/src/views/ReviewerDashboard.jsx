import React, { useEffect, useState } from 'react'
import axios from 'axios'

const MOCK_ESCALATIONS = [
  {
    _id: 'rmock-1',
    title: 'Landing Page Copy - Dispute',
    clientAddress: '0xDeF456...A12',
    aiVerdict: 'UNCERTAIN',
    status: 'escalated',
    latestSubmission: 'https://ipfs.io/ipfs/demo1'
  },
  {
    _id: 'rmock-2',
    title: 'Logo Revisions - Dispute',
    clientAddress: '0xDeF456...A12',
    aiVerdict: 'REJECTED',
    status: 'escalated',
    latestSubmission: 'https://ipfs.io/ipfs/demo2'
  }
]

export default function ReviewerDashboard(){
  const [jobs, setJobs] = useState([])

  useEffect(()=>{ fetchJobs() }, [])

  async function fetchJobs(){
    try{
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/jobs`)
      let data = res.data || []
      // filter escalated
      const escalated = (Array.isArray(data) ? data.filter(j=> j.status === 'escalated') : [])
      if (!escalated || escalated.length === 0) {
        setJobs(MOCK_ESCALATIONS)
      } else {
        setJobs(escalated)
      }
    }catch(err){
      console.error('Failed to fetch escalations, using mock data', err)
      setJobs(MOCK_ESCALATIONS)
    }
  }

  async function decide(job, approve){
    try{
      const reviewer = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0]
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/jobs/${job._id}/review`, { approve, reviewerAddress: reviewer })
      alert('Decision recorded')
      // remove from list
      setJobs(prev=> prev.filter(p=> p._id !== job._id))
    }catch(err){
      console.error('Decision failed, updating mock locally', err)
      setJobs(prev=> prev.filter(p=> p._id !== job._id))
      alert('Decision applied locally (demo)')
    }
  }

  return (
    <div className="space-y-6">
      <div className="font-semibold text-white">Escalated Jobs</div>
      <div className="grid grid-cols-1 gap-4">
        {jobs.map(j=> (
          <div key={j._id} className="p-4 bg-white/2 rounded flex items-center justify-between">
            <div>
              <div className="font-medium text-white">{j.title}</div>
              <div className="text-sm text-gray-400">AI verdict: <span className={`px-2 py-0.5 rounded text-xs ${j.aiVerdict === 'APPROVED' ? 'bg-green-600' : j.aiVerdict === 'REJECTED' ? 'bg-red-600' : 'bg-yellow-600'}`}>{j.aiVerdict}</span></div>
              <div className="text-sm text-gray-500 mt-1">Submission: <a className="text-monad-600" href={j.latestSubmission}>{j.latestSubmission}</a></div>
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
