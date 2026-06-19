import React from 'react'
import { Link, Routes, Route } from 'react-router-dom'
import Home from './views/Home'
import ClientDashboard from './views/ClientDashboard'
import FreelancerDashboard from './views/FreelancerDashboard'
import ReviewerDashboard from './views/ReviewerDashboard'
import JobDetails from './views/JobDetails'
import WalletConnect from './components/WalletConnect'

export default function App(){
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between">
          <h1 className="text-xl font-semibold">PayGuard</h1>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-sm">Home</Link>
            <Link to="/client" className="text-sm">Client</Link>
            <Link to="/freelancer" className="text-sm">Freelancer</Link>
            <Link to="/reviewer" className="text-sm">Reviewer</Link>
            <WalletConnect />
          </div>
        </div>
      </header>

      <main className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/client" element={<ClientDashboard/>} />
          <Route path="/freelancer" element={<FreelancerDashboard/>} />
          <Route path="/reviewer" element={<ReviewerDashboard/>} />
          <Route path="/job/:id" element={<JobDetails/>} />
        </Routes>
      </main>
    </div>
  )
}
