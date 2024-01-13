// REACT COMPONENTS
import { useEffect, useRef } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

import Configuration from "../utils/Config";

function Reveal({ children, customDelay = 0.25 }) {
  const ref = useRef(null);
  const theme = Configuration.get("theme");
  const isInView = useInView(ref, { once: true });

  const mainControls = useAnimation();
  const slideControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
      slideControls.start("visible");
    }
  }, [isInView]);

  return (
    <div ref={ref} className="relative overflow-hidden">
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration: 0.5, delay: customDelay }}
      >
        {children}
      </motion.div>
      <motion.div
        variants={{
          hidden: { left: 0 },
          visible: { left: "100%" },
        }}
        initial="hidden"
        animate={slideControls}
        transition={{ duration: 0.5, ease: "easeIn", delay: customDelay }}
        className="absolute top-0 bottom-4 left-0 right-0"
        style={{ backgroundColor: theme.bgColor }}
      />
    </div>
  );
}

export default Reveal;
