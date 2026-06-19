import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

export default function JobDetails(){
  const { id } = useParams()
  const [job, setJob] = useState(null)

  useEffect(()=>{ if (id) fetchJob() }, [id])
  async function fetchJob(){
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/jobs/${id}`)
    setJob(res.data)
  }

  if (!job) return <div>Loading...</div>
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold">{job.title}</h2>
      <div className="mt-2">Freelancer: {job.freelancer}</div>
      <div className="mt-2">Client: {job.clientAddress}</div>
      <div className="mt-2">Status: {job.status}</div>
      <div className="mt-2">Metadata: {job.metadataUri}</div>
    </div>
  )
}
