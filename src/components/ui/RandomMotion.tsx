import React, { useMemo } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

// Refined professional variants instead of random chaotic ones
const ELEGANT_VARIANT = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 25 } }
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
      delay: delayIndex * 0.08, // Subtle stagger effect
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
      whileHover={{ 
        y: -2, 
        transition: { type: 'spring', stiffness: 350, damping: 30 } 
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
