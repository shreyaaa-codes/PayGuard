import React from 'react'

export default function Footer(){
  return (
    <footer className="border-t border-t-gray-800 bg-black/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-sm text-gray-400 flex items-center justify-between">
        <div>© {new Date().getFullYear()} PayGuard — Built for demos. Use responsibly.</div>
        <div className="space-x-4">
          <a className="hover:text-white">Docs</a>
          <a className="hover:text-white">Security</a>
          <a className="hover:text-white">Privacy</a>
        </div>
      </div>
    </footer>
  )
}
