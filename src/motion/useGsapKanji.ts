import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion } from './reducedMotion';

export function useGsapKanji(ref: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    if (!enabled || !ref.current || prefersReducedMotion()) return;
    const tween = gsap.to(ref.current, {
      scale: 1.06,
      rotate: 3,
      duration: 6,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });
    return () => {
      tween.kill();
    };
  }, [ref, enabled]);
}
