import { useEffect, useState } from 'react';

let mathJaxUsers = 0;

const useMathJax = (mathJaxSource) => {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!mathJaxSource) {
      setIsLoading(false);
      return;
    }

    mathJaxUsers += 1;
    let script = document.getElementById('mathjax');
    if (!script) {
      window.MathJax = {
        options: {
          enableMenu: false
        },
        tex: {
          inlineMath: [['$', '$']],
          displayMath: [['$$', '$$']]
        },
        svg: {
          fontCache: 'global'
        }
      };
      script = document.createElement('script');
      script.src = mathJaxSource;
      script.id = 'mathjax';
    }

    const onLoad = () => setIsLoading(false);
    if (typeof window.MathJax?.tex2svg === 'function') {
      setIsLoading(false);
    } else {
      script.addEventListener('load', onLoad);
    }
    if (!script.isConnected) document.body.appendChild(script);

    return () => {
      script.removeEventListener('load', onLoad);
      mathJaxUsers -= 1;
      // Other editors and viewers may still reference the shared glyph cache.
      if (mathJaxUsers > 0) return;
      script.remove();
      document.getElementById('MJX-SVG-global-cache')?.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isLoadingMathJax: isLoading,
  };
};

export default useMathJax;
