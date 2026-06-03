import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

/**
 * Shared Framer Motion primitives. Keeps animations consistent and respects the
 * user's "reduce motion" OS setting (animations collapse to simple fades).
 */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

/** Container that staggers its children's entrance. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
  /** Trigger once when scrolled into view (default true). */
  once?: boolean;
  delay?: number;
  as?: 'div' | 'section' | 'article' | 'li' | 'span';
}

/**
 * Reveals its children when scrolled into view. Falls back to a plain element
 * (no animation) when the user prefers reduced motion.
 */
export const Reveal: React.FC<RevealProps> = ({
  children,
  className,
  variants = fadeUp,
  once = true,
  delay = 0,
  as = 'div',
}) => {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.2 }}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
};

export { motion };
