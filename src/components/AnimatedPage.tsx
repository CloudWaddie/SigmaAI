import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface AnimatedPageProps {
  children: ReactNode;
}

const AnimatedPage = ({ children }: AnimatedPageProps) => {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pageRef.current) {
      gsap.from(pageRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power3.out',
      });
    }
  }, []);

  return <div ref={pageRef}>{children}</div>;
};

export default AnimatedPage;
