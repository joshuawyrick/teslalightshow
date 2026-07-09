import { useEffect, useRef } from 'react';

interface JsonLdProps {
  data: Record<string, unknown>;
}

export default function JsonLd({ data }: JsonLdProps) {
  const ref = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!ref.current) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      document.head.appendChild(script);
      ref.current = script;
    }
    ref.current.textContent = JSON.stringify(data);
    return () => {
      if (ref.current && ref.current.parentNode) {
        ref.current.parentNode.removeChild(ref.current);
        ref.current = null;
      }
    };
  }, [data]);

  return null;
}
