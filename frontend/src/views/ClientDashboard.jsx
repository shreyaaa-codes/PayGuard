import React, { useState } from 'react'
import axios from 'axios'
import { ethers } from 'ethers'
import escrowAbi from '../contract/escrowAbi.json'

export default function ClientDashboard(){
  const [title, setTitle] = useState('')
  const [metadata, setMetadata] = useState('')
  const [freelancer, setFreelancer] = useState('')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState('')

  async function createJobOnchainAndRecord() {
    if (!window.ethereum) return alert('Install MetaMask');
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Contract address should be in environment or config
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    if (!contractAddress) return alert('Set VITE_CONTRACT_ADDRESS in .env');

    const contract = new ethers.Contract(contractAddress, escrowAbi.abi, signer);

    try {
      setStatus('Sending transaction to fund escrow...');
      const tx = await contract.createJob(freelancer, metadata, { value: ethers.utils.parseEther(amount) });
      setStatus('Waiting for network confirmation...');
      const receipt = await tx.wait();

      // Parse JobCreated event to get onchain jobId safely
      let jobId = null;
      if (Array.isArray(receipt.events)) {
        const event = receipt.events.find((e) => e.event === 'JobCreated' || (e.event === undefined && e.topics && String(e.topics[0]).includes('JobCreated')));
        if (event && event.args && event.args.length > 0) {
          try {
            jobId = event.args[0];
            // handle BigNumber
            if (jobId && typeof jobId.toNumber === 'function') jobId = jobId.toNumber();
          } catch (err) {
            console.warn('Failed to parse jobId from event args', err);
            jobId = null;
          }
        }
      }

      if (!jobId) {
        setStatus('Transaction confirmed but JobCreated event not found — job will be recorded without onchainJobId.');
      }

      // Create job record in backend
      setStatus('Recording job in backend...');
      const clientAddress = await signer.getAddress();
      const payload = { title, metadataUri: metadata, freelancer, clientAddress, escrowAmount: amount, txHash: receipt.transactionHash };
      if (jobId !== null) payload.onchainJobId = jobId;

      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/jobs`, payload);

      setStatus('Job created: ' + res.data._id);
    } catch (err) {
      console.error(err);
      setStatus('Failed: ' + (err.message || err));
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Create Job & Fund Escrow</h2>
      <input className="w-full p-2 border rounded" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
      <textarea className="w-full p-2 border rounded" placeholder="Requirements / metadata URI" value={metadata} onChange={(e)=>setMetadata(e.target.value)} />
      <input className="w-full p-2 border rounded" placeholder="Freelancer wallet address" value={freelancer} onChange={(e)=>setFreelancer(e.target.value)} />
      <input className="w-full p-2 border rounded" placeholder="Amount in ETH (e.g. 0.01)" value={amount} onChange={(e)=>setAmount(e.target.value)} />
      <button onClick={createJobOnchainAndRecord} className="px-4 py-2 bg-green-600 text-white rounded">Create & Fund Escrow</button>
      <div className="text-sm text-gray-600">{status}</div>
    </div>
  )
}
