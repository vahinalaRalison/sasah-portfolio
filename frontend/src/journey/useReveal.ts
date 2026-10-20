import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * Révèle un bloc quand il entre dans la fenêtre (une seule fois) :
 * les informations d'une terre « apparaissent » à l'arrivée du cheval.
 */
export function useReveal<T extends HTMLElement>(threshold = 0.15): { ref: RefObject<T>; visible: boolean } {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -10% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}
