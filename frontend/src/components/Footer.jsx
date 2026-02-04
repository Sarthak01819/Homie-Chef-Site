import { Link } from 'react-router-dom'
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <motion.footer 
      className="
      w-full
      backdrop-blur-lg
      border-t border-black/30
    "
    style={{
        background: "var(--brand-wood-gradient)",
        borderColor: "rgba(15,23,42,0.08)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className=" max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img
            src={"/images/logo3.png"}
            alt="Homie Chef Logo"
            className="h-12 w-auto"
          />
          <span className="text-lg font-semibold text-white/90 tracking-wide uppercase">
            Homie Chef
          </span>
        </div>

        <p className="text-sm text-white/60 text-center sm:text-right">
          © {new Date().getFullYear()}{' '}
          <Link
            to="/"
            className="text-white/80 hover:text-green-700 transition underline underline-offset-4"
          >
            Homie Chef
          </Link>
          . All rights reserved.
        </p>
      </div>
    </motion.footer>
  )
}

export default Footer
