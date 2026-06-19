import React, { useEffect, useState } from 'react'
import axios from 'axios'

const MOCK_FREELANCER_JOBS = [
  {
    _id: 'fmock-1',
    title: 'Branding & Logo Kit',
    clientAddress: '0xDeF456...A12',
    status: 'funded',
    submissionStatus: 'Not submitted'
  },
  {
    _id: 'fmock-2',
    title: 'Landing Page Copy',
    clientAddress: '0xDeF456...A12',
    status: 'submitted',
    submissionStatus: 'Under AI review'
  },
  {
    _id: 'fmock-3',
    title: 'Mobile App Icon Set',
    clientAddress: '0xDeF456...A12',
    status: 'approved',
    submissionStatus: 'Approved'
  }
]

export default function FreelancerDashboard(){
  const [jobs, setJobs] = useState([])
  const [submissionMap, setSubmissionMap] = useState({})

  useEffect(()=>{ fetchJobs() }, [])

  async function fetchJobs(){
    try{
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/jobs`)
      let data = res.data || []
      if (!Array.isArray(data) || data.length === 0) data = MOCK_FREELANCER_JOBS
      // Choose jobs assigned to current account if possible, otherwise show mock/demo ones
      setJobs(data.slice(0,3))
    }catch(err){
      console.error('Failed to fetch jobs, using mock freelancer data', err)
      setJobs(MOCK_FREELANCER_JOBS)
    }
  }

  async function submitWork(job){
    const submissionUri = submissionMap[job._id] || 'https://ipfs.io/ipfs/demo-submission'
    try{
      const freelancerAddress = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0]
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/jobs/${job._id}/submit`, { submissionUri, freelancerAddress })
      alert('Submitted. AI result: ' + (res.data?.aiResult?.decision || 'UNCERTAIN'))
      // update local status
      setJobs(prev=> prev.map(p=> p._id === job._id ? { ...p, status: res.data?.job?.status || 'submitted', submissionStatus: res.data?.aiResult?.decision || 'Under AI review' } : p))
    }catch(err){
      console.error('Submission failed, updating mock status locally', err)
      setJobs(prev=> prev.map(p=> p._id === job._id ? { ...p, status: 'submitted', submissionStatus: 'Under AI review' } : p))
      alert('Submission simulated locally (demo)')
    }
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
                <div className="text-sm text-gray-400">Status: <span className={`px-2 py-0.5 rounded text-xs ${j.status === 'approved' ? 'bg-green-600' : j.status === 'submitted' ? 'bg-yellow-600' : 'bg-blue-600'}`}>{j.status}</span></div>
                <div className="text-sm text-gray-500 mt-1">Client: {j.clientAddress}</div>
              </div>

              <div className="mt-3 md:mt-0 w-full md:w-1/2">
                <input className="w-full p-2 rounded bg-white/5 border border-white/6 text-sm" placeholder="Submission URL or notes" value={submissionMap[j._1d] || ''} onChange={(e)=> setSubmissionMap(prev=> ({...prev, [j._id]: e.target.value}))} />
                <div className="mt-2 flex justify-end">
                  <button onClick={()=> submitWork(j)} className="px-4 py-2 bg-monad-600 rounded text-white">Submit Work</button>
                </div>
                <div className="mt-2 text-sm text-gray-400">{j.submissionStatus || 'Not submitted'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
