import { useCallback, useState } from 'react';

const useForceUpdate = () => {
  const [, setState] = useState(0);

  const forceUpdate = useCallback(() => {
    setState(n => n + 1);
  }, []);

  return forceUpdate;
};

export default useForceUpdate;
