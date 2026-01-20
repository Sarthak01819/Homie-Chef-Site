import Hero from './Hero'
import Services from './Services'
import Whyus from './Whyus'
import Food from './Food'
import { motion } from "framer-motion";

const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
        <Hero />
        <Services />
        <Food />
        <Whyus />
    </motion.div>
  )
}

export default Home