import React, { useEffect, useState } from 'react'
import DashboardCard from '../components/DashboardCard'
import axios from 'axios'

const MOCK_CLIENT_JOBS = [
  {
    _id: 'mock-1',
    title: 'Branding & Logo Kit',
    metadataUri: 'Design a modern logo and brand kit',
    freelancer: '0xAbC123...Ff3',
    clientAddress: '0xDeF456...A12',
    escrowAmount: '0.05',
    status: 'funded',
    onchainJobId: 101,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'mock-2',
    title: 'Landing Page Copy',
    metadataUri: 'Write marketing copy for landing page',
    freelancer: '0xBfE234...C01',
    clientAddress: '0xDeF456...A12',
    escrowAmount: '0.02',
    status: 'submitted',
    latestSubmission: 'https://ipfs.io/ipfs/mock-sub-2',
    onchainJobId: 102,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'mock-3',
    title: 'Mobile App Icon Set',
    metadataUri: 'Create 3 icon sizes for iOS/Android',
    freelancer: '0xCcD345...E90',
    clientAddress: '0xDeF456...A12',
    escrowAmount: '0.01',
    status: 'approved',
    latestSubmission: 'https://ipfs.io/ipfs/mock-sub-3',
    onchainJobId: 103,
    createdAt: new Date().toISOString()
  }
]

export default function ClientDashboard(){
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  // Create job form state
  const [title, setTitle] = useState('')
  const [metadata, setMetadata] = useState('')
  const [freelancer, setFreelancer] = useState('')
  const [amount, setAmount] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(()=>{ fetchJobs() }, [])

  async function fetchJobs(){
    try{
      setLoading(true)
      const backendUrl = import.meta.env.VITE_BACKEND_URL || ''
      if (!backendUrl) {
        // No backend configured — use mock immediately
        setJobs(MOCK_CLIENT_JOBS)
        setLoading(false)
        return
      }
      const res = await axios.get(`${backendUrl}/api/jobs`)
      if (!res.data || res.data.length === 0) {
        // fallback to mock
        setJobs(MOCK_CLIENT_JOBS)
      } else {
        setJobs(res.data)
      }
    }catch(err){
      console.error('Failed to fetch jobs, using mock data', err)
      setJobs(MOCK_CLIENT_JOBS)
    }
    setLoading(false)
  }

  async function handleCreateJob(e){
    e.preventDefault()
    setCreating(true)
    const payload = { title, metadataUri: metadata, freelancer, clientAddress: 'demo-client', escrowAmount: amount }
    try{
      const backendUrl = import.meta.env.VITE_BACKEND_URL || ''
      if (!backendUrl) throw new Error('Backend URL not configured')
      const res = await axios.post(`${backendUrl}/api/jobs`, payload)
      // If backend returns created job, prepend it
      if (res.data && res.data._id) {
        setJobs(prev=>[res.data, ...prev])
      } else {
        // fallback: create local mock entry
        const mock = { ...payload, _id: 'local-' + Date.now(), status: 'funded', createdAt: new Date().toISOString() }
        setJobs(prev=>[mock, ...prev])
      }
      setTitle(''); setMetadata(''); setFreelancer(''); setAmount('')
    }catch(err){
      console.error('Create job failed, adding mock job locally', err)
      const mock = { ...payload, _id: 'local-' + Date.now(), status: 'funded', createdAt: new Date().toISOString() }
      setJobs(prev=>[mock, ...prev])
    }
    setCreating(false)
  }

  // Ensure we always have something to render
  const displayJobs = (Array.isArray(jobs) && jobs.length > 0) ? jobs : MOCK_CLIENT_JOBS
  const fundsLocked = (displayJobs || []).reduce((s,j)=> s + Number(j.escrowAmount || 0), 0).toFixed(3) + ' ETH'
  const pendingReviews = (displayJobs || []).filter(j=> j.status === 'submitted' || j.status === 'escalated').length

  function statusBadge(status){
    const base = 'px-2 py-0.5 rounded text-xs font-medium '
    if (status === 'approved') return base + 'bg-green-600 text-white'
    if (status === 'submitted') return base + 'bg-yellow-600 text-white'
    if (status === 'escalated') return base + 'bg-red-600 text-white'
    if (status === 'funded') return base + 'bg-blue-600 text-white'
    return base + 'bg-gray-600 text-white'
  }

  return (
    <div className="space-y-6">
      {/* Top cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard title="Active Escrows" value={displayJobs.length}>
          Total jobs created
        </DashboardCard>

        <DashboardCard title="Funds Locked" value={fundsLocked}>
          Aggregate value in escrow (demo)
        </DashboardCard>

        <DashboardCard title="Pending Reviews" value={pendingReviews}>
          AI uncertain cases
        </DashboardCard>
      </div>

      {/* Create Job form */}
      <div className="p-6 bg-black/40 rounded-xl border border-white/6">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-white">Create a Job</div>
          <div className="text-sm text-gray-400">Demo form — submits to backend if available</div>
        </div>

        <form onSubmit={handleCreateJob} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Title" className="p-2 rounded bg-white/5 border border-white/6" />
          <input required value={freelancer} onChange={(e)=>setFreelancer(e.target.value)} placeholder="Freelancer wallet address" className="p-2 rounded bg-white/5 border border-white/6" />
          <textarea required value={metadata} onChange={(e)=>setMetadata(e.target.value)} placeholder="Requirements or metadata URI" className="p-2 rounded bg-white/5 border border-white/6 md:col-span-2 h-28" />
          <input required value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="Amount (ETH)" className="p-2 rounded bg-white/5 border border-white/6" />
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" disabled={creating} className="px-4 py-2 bg-monad-600 text-white rounded">{creating? 'Creating...' : 'Create & Record Job'}</button>
          </div>
        </form>
      </div>

      {/* Recent Jobs */}
      <div className="p-6 bg-black/40 rounded-xl border border-white/6">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-white">Your Jobs</div>
          <div className="text-sm text-gray-400">Recent</div>
        </div>

        <div className="mt-4 space-y-4">
          {loading ? (
            <div className="text-gray-400">Loading jobs...</div>
          ) : (
            (displayJobs || []).map(j=> (
              <div key={j._id} className="p-4 bg-white/2 rounded flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">{j.title}</div>
                  <div className="text-sm text-gray-400 mt-1">Status: <span className={statusBadge(j.status)}>{j.status}</span></div>
                  <div className="text-sm text-gray-500 mt-1">Escrow: {j.escrowAmount || '—'} ETH</div>
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
