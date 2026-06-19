import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'

export default function ConnectWallet(){
  const [account, setAccount] = useState(null)

  useEffect(()=>{
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts)=> setAccount(accounts[0] || null))
    }
    return ()=>{
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', ()=>{})
      }
    }
  }, [])

  async function connect(){
    if (!window.ethereum) return alert('Please install MetaMask to use PayGuard')
    try{
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setAccount(accounts[0])
    }catch(err){ console.error(err) }
  }

  if (account) {
    return (
      <div className="px-3 py-1 rounded-full bg-white/5 border border-white/6 text-sm text-white">
        {account.slice(0,6)}...{account.slice(-4)}
      </div>
    )
  }

  return (
    <button onClick={connect} className="px-4 py-2 rounded-md bg-monad-600 hover:bg-monad-500 text-white font-medium">Connect Wallet</button>
  )
}
