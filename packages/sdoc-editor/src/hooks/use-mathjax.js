import { useEffect, useState } from 'react';

const useMathJax = (mathJaxSource) => {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!mathJaxSource) {
      setIsLoading(false);
      return;
    }
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
    if (!document.querySelector('#mathjax')) {
      const script = document.createElement('script');
      script.src = mathJaxSource;
      script.id = 'mathjax';
      document.body.appendChild(script);
      script.onload = () => {
        setIsLoading(false);
      };
    }

    return () => {
      const script = document.getElementById('mathjax');
      script && script.parentNode.removeChild(script);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isLoadingMathJax: isLoading,
  };
};

export default useMathJax;
