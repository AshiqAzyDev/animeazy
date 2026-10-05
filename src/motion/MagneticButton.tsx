import { motion, useMotionValue, useSpring } from 'framer-motion';
import type { ReactNode } from 'react';
import { useRef } from 'react';
import { isTouchDevice, prefersReducedMotion } from './reducedMotion';

type Props = {
  children: ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  'aria-label'?: string;
};

export function MagneticButton({
  children,
  className = '',
  strength = 18,
  onClick,
  disabled,
  type = 'button',
  'aria-label': ariaLabel,
}: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 280, damping: 20 });
  const sy = useSpring(y, { stiffness: 280, damping: 20 });
  const noMagnet = prefersReducedMotion() || isTouchDevice();

  return (
    <motion.button
      ref={ref}
      type={type}
      className={className}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      style={noMagnet ? undefined : { x: sx, y: sy }}
      onPointerMove={(e) => {
        if (noMagnet || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set(((e.clientX - r.left) / r.width - 0.5) * strength);
        y.set(((e.clientY - r.top) / r.height - 0.5) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileTap={{ scale: 0.97 }}
    >
      <span className="speed-lines" aria-hidden />
      {children}
    </motion.button>
  );
}
