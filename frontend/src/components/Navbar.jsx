import React from 'react'
import { Link } from 'react-router-dom'
import ConnectWallet from './ConnectWallet'

export default function Navbar(){
  return (
    <header className="bg-gradient-to-r from-black/60 via-black/40 to-black/30 border-b border-b-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-monad-600 flex items-center justify-center shadow-soft-xl">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L20 8V16L12 22L4 16V8L12 2Z" fill="white" opacity="0.95"/>
              </svg>
            </div>
            <div>
              <div className="text-white font-semibold">PayGuard</div>
              <div className="text-xs text-gray-400">AI Escrow · Monad</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/client" className="text-gray-300 hover:text-white">Client</Link>
            <Link to="/freelancer" className="text-gray-300 hover:text-white">Freelancer</Link>
            <Link to="/reviewer" className="text-gray-300 hover:text-white">Reviewer</Link>
            <a href="#features" className="text-gray-300 hover:text-white">Features</a>
          </nav>

          <div className="flex items-center space-x-3">
            <ConnectWallet />
          </div>
        </div>
      </div>
    </header>
  )
}
