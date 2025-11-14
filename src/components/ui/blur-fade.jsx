import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function BlurFade({ children, delay = 0, inView = true }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const show = inView ? isInView : true;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, filter: "blur(8px)", y: 20 }}
      animate={
        show
          ? { opacity: 1, filter: "blur(0px)", y: 0 }
          : { opacity: 0, filter: "blur(8px)", y: 20 }
      }
      transition={{ duration: 0.8, delay }}
    >
      {children}
    </motion.div>
  );
}
