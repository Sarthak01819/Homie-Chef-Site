import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="
      w-full mt-10
      bg-white/60
      backdrop-blur-lg
      border-t border-green-900/10
      shadow-[0_-4px_20px_rgba(0,0,0,0.03)] 
    ">
      <div className=" max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img
            src="src/assets/removed-bg-logo.png"
            alt="Homie Chef Logo"
            className="h-12 w-auto"
          />
          <span className="text-lg font-semibold text-black/80 tracking-wide uppercase">
            Homie Chef
          </span>
        </div>

        <p className="text-sm text-black/60 text-center sm:text-right">
          © {new Date().getFullYear()}{' '}
          <Link
            to="/"
            className="text-black/80 hover:text-green-700 transition underline underline-offset-4"
          >
            Homie Chef
          </Link>
          . All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
