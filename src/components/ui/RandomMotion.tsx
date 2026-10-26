import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

const ELEGANT_VARIANT = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 0.61, 0.36, 1] as const } }
};

interface RandomMotionProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delayIndex?: number;
}

export default function RandomMotion({ children, delayIndex = 0, ...props }: RandomMotionProps) {
  const showWithDelay = {
    ...ELEGANT_VARIANT.show,
    transition: {
      ...ELEGANT_VARIANT.show.transition,
      delay: Math.min(delayIndex * 0.04, 0.2),
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10px" }}
      variants={{
        hidden: ELEGANT_VARIANT.hidden,
        show: showWithDelay
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
