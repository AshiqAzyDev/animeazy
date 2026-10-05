import type { Transition, Variants } from 'framer-motion';
import { prefersReducedMotion } from './reducedMotion';

export const springSoft: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 24,
};

export const pageVariants: Variants = {
  initial: () =>
    prefersReducedMotion()
      ? { opacity: 0 }
      : { opacity: 0, y: 18, filter: 'blur(6px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: () =>
    prefersReducedMotion()
      ? { opacity: 0 }
      : { opacity: 0, y: -10, filter: 'blur(4px)', transition: { duration: 0.2 } },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: prefersReducedMotion() ? 0 : 0.06,
      delayChildren: prefersReducedMotion() ? 0 : 0.05,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: prefersReducedMotion() ? 0 : 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};
