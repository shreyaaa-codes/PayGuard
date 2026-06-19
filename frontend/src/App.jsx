import React from 'react'
import { Link, Routes, Route } from 'react-router-dom'
import Home from './views/Home'
import ClientDashboard from './views/ClientDashboard'
import FreelancerDashboard from './views/FreelancerDashboard'
import ReviewerDashboard from './views/ReviewerDashboard'
import JobDetails from './views/JobDetails'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export default function App(){
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/client" element={<ClientDashboard/>} />
          <Route path="/freelancer" element={<FreelancerDashboard/>} />
          <Route path="/reviewer" element={<ReviewerDashboard/>} />
          <Route path="/job/:id" element={<JobDetails/>} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
