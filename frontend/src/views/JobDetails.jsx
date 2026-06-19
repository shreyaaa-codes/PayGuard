import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'

export default function JobDetails(){
  const { id } = useParams()
  const [job, setJob] = useState(null)

  useEffect(()=>{ if (id) fetchJob() }, [id])
  async function fetchJob(){
    try{
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/jobs/${id}`)
      setJob(res.data)
    }catch(err){ console.error(err) }
  }

  if (!job) return <div className="text-gray-400">Loading...</div>
  return (
    <div className="space-y-6">
      <div className="p-6 bg-black/40 rounded-xl border border-white/6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-gray-300">{job.title}</div>
            <div className="text-xs text-gray-400 mt-1">Client: {job.clientAddress}</div>
            <div className="text-xs text-gray-400">Freelancer: {job.freelancer}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-300">Status</div>
            <div className="font-semibold text-white">{job.status}</div>
          </div>
        </div>

        <div className="mt-6 text-gray-300">Requirements: {job.metadataUri}</div>
        <div className="mt-4 text-gray-400">On-chain Job ID: {job.onchainJobId || '—'}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-black/40 rounded-xl border border-white/6">
          <div className="font-semibold text-white">Submissions</div>
          {/* For demo, load latestSubmission if populated */}
          <div className="mt-4 text-sm text-gray-400">Latest submission: {job.latestSubmission ? job.latestSubmission : '—'}</div>
        </div>

        <div className="p-6 bg-black/40 rounded-xl border border-white/6">
          <div className="font-semibold text-white">Actions</div>
          <div className="mt-4 space-x-2">
            <button className="px-3 py-1 bg-monad-600 text-white rounded">Request Revision</button>
            <button className="px-3 py-1 bg-green-600 text-white rounded">Approve & Release</button>
            <button className="px-3 py-1 bg-red-600 text-white rounded">Refund Client</button>
          </div>
        </div>
      </div>
    </div>
  )
}
