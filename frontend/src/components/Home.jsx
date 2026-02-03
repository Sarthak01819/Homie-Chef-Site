import Hero from './Hero'
import Services from './Services'
import Whyus from './Whyus'
import Food from './Food'
import { motion } from "framer-motion";
import SubscriptionPromo from './SubscriptionPromo';
import ValueStrip from './ValueStrip';
import HeroVeg from './HeroVeg';
import UserGreeting from './UserGreeting';

const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
        {/* <Hero /> */}
        <HeroVeg />
        {/* <ValueStrip /> */}
        <UserGreeting />
        <Services />
        <SubscriptionPromo />
        {/* <Food /> */}
        <Whyus />
    </motion.div>
  )
}

export default Home