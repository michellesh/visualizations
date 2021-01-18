import { useLayoutEffect, useState } from 'react';
import { debounce } from 'lodash';

export const useWindowSize = (defaultSize = [0, 0]) => {
  const [size, setSize] = useState(defaultSize);

  useLayoutEffect(() => {
    const updateSize = () => setSize([window.innerWidth, window.innerHeight]);
    window.addEventListener('resize', debounce(updateSize, 300));
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
};
