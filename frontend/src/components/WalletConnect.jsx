import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'

export default function WalletConnect(){
  const [account, setAccount] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => setAccount(accounts[0] || null));
    }
  }, []);

  async function connect() {
    if (!window.ethereum) return alert('Install MetaMask');
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0]);
  }

  return (
    <div>
      {account ? (
        <div className="text-sm">{account.slice(0,6)}...{account.slice(-4)}</div>
      ) : (
        <button onClick={connect} className="px-3 py-1 bg-blue-600 text-white rounded">Connect Wallet</button>
      )}
    </div>
  )
}
