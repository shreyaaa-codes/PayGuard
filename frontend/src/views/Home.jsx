import React from 'react'
import { Link } from 'react-router-dom'

export default function Home(){
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Welcome to PayGuard</h2>
      <p className="text-gray-600 mb-6">AI-powered escrow for freelancers and clients. Connect your wallet to get started.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/client" className="p-4 bg-blue-50 rounded hover:bg-blue-100">
          <div className="font-semibold">Client Dashboard</div>
          <div className="text-sm text-gray-500">Create jobs and fund escrow</div>
        </Link>

        <Link to="/freelancer" className="p-4 bg-green-50 rounded hover:bg-green-100">
          <div className="font-semibold">Freelancer Dashboard</div>
          <div className="text-sm text-gray-500">View assigned jobs and submit work</div>
        </Link>

        <Link to="/reviewer" className="p-4 bg-yellow-50 rounded hover:bg-yellow-100">
          <div className="font-semibold">Reviewer Dashboard</div>
          <div className="text-sm text-gray-500">Resolve escalated disputes</div>
        </Link>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p>Developer notes:</p>
        <ul className="list-disc ml-5">
          <li>Set <code>VITE_BACKEND_URL</code> and <code>VITE_CONTRACT_ADDRESS</code> in <code>.env.local</code>.</li>
          <li>Connect MetaMask to your local Hardhat or testnet network.</li>
          <li>Backend must be running at the configured <code>VITE_BACKEND_URL</code>.</li>
        </ul>
      </div>
    </div>
  )
}
