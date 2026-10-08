import React, { useMemo } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type CustomVariant = {
  hidden: any;
  show: {
    opacity: number;
    y?: number;
    x?: number;
    scale?: number;
    rotate?: number;
    rotateX?: number;
    transition: any;
  }
};

const VARIANTS: CustomVariant[] = [
  // 1. Springy pop up
  {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 250, damping: 20 } }
  },
  // 2. Slide from left with slight rotate
  {
    hidden: { opacity: 0, x: -30, rotate: -3 },
    show: { opacity: 1, x: 0, rotate: 0, transition: { type: 'spring', stiffness: 200, damping: 22 } }
  },
  // 3. Fade and scale
  {
    hidden: { opacity: 0, scale: 0.85 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } }
  },
  // 4. Slide from bottom with elastic effect
  {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 150, damping: 12 } }
  },
  // 5. Flip-like reveal
  {
    hidden: { opacity: 0, rotateX: 30, y: 20 },
    show: { opacity: 1, rotateX: 0, y: 0, transition: { type: 'spring', stiffness: 200, damping: 25 } }
  }
];

interface RandomMotionProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delayIndex?: number;
}

export default function RandomMotion({ children, delayIndex = 0, ...props }: RandomMotionProps) {
  // Randomly pick a variant but keep it stable across renders
  const selectedVariant = useMemo(() => {
    return VARIANTS[Math.floor(Math.random() * VARIANTS.length)];
  }, []);

  const showWithDelay = {
    ...selectedVariant.show,
    transition: {
      ...selectedVariant.show.transition,
      delay: delayIndex * 0.1, // Stagger effect
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-20px" }}
      variants={{
        hidden: selectedVariant.hidden,
        show: showWithDelay
      }}
      whileHover={{ 
        y: -4, 
        scale: 1.01,
        transition: { type: 'spring', stiffness: 400 } 
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
