import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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

export const useCanvas = () => {
  const canvasRef = useRef(null);
  const [context, setContext] = useState();

  useEffect(() => {
    const node = canvasRef.current;
    if (node) {
      setContext(node.getContext('2d'));
    }
  });

  return [canvasRef, context];
};
