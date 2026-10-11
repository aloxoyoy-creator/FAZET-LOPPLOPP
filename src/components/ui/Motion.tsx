import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../vendor/schoolhub-ui/lib/utils';

interface SmoothCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
}

// Profesional Smooth Card - Elevates elegantly on hover, soft press on tap
export function SmoothCard({ children, delay = 0, className, ...props }: SmoothCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
      whileTap={{ scale: 0.985, transition: { duration: 0.1 } }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 25, 
        delay,
      }}
      className={cn("cursor-pointer relative transition-shadow hover:shadow-lg", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Elegant Fade In for professional typography and headers
export function FadeIn({ children, delay = 0, className, ...props }: SmoothCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

// Professional staggered lists
export function StaggerContainer({ children, className, ...props }: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.08
          }
        }
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export const staggerItem = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 28 }
  }
};

// Subtle float for professional accents (like badges or subtle highlights)
export function FloatElement({ children, className, ...props }: SmoothCardProps) {
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ 
        duration: 5, 
        ease: "easeInOut", 
        repeat: Infinity,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
