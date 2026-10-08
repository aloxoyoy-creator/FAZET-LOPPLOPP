import React, { useMemo } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

const INFINITE_VARIANTS = [
  // 1. Slow Float Up and Down
  { y: [0, -6, 0] },
  // 2. Slow Float Left and Right
  { x: [0, -4, 0] },
  // 3. Gentle Breathe (Scale)
  { scale: [1, 1.03, 1] },
  // 4. Subtle Rocking (Rotate)
  { rotate: [0, -2, 2, 0] },
  // 5. Rotate & Float combined
  { y: [0, -4, 0], rotate: [0, 1, -1, 0] },
  // 6. Pulse glow (we'll just do scale + opacity)
  { scale: [1, 1.02, 1], opacity: [1, 0.9, 1] }
];

interface ContinuousMotionProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high';
}

export default function ContinuousMotion({ children, intensity = 'low', ...props }: ContinuousMotionProps) {
  const selectedAnimation = useMemo(() => {
    return INFINITE_VARIANTS[Math.floor(Math.random() * INFINITE_VARIANTS.length)];
  }, []);

  const duration = useMemo(() => {
    // Randomize duration between 3 to 6 seconds so they don't all sync up
    return 3 + Math.random() * 3;
  }, []);

  return (
    <motion.div
      animate={selectedAnimation as any}
      transition={{
        duration: intensity === 'low' ? duration + 2 : duration,
        repeat: Infinity,
        ease: "easeInOut",
        repeatType: "mirror"
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
