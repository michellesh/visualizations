import React, { useCallback, useEffect, useState } from 'react';
import { func, node } from 'prop-types';
import { noop } from 'lodash';

import { useWindowSize } from './hooks';

const FullScreenContext = ({ CanvasComponent, draw, onWindowResize }) => {
  const [context, setContext] = useState();
  const [width, height] = useWindowSize();

  const canvasRef = useCallback(node => {
    if (node !== null) {
      setContext(node.getContext('2d'));
    }
  }, []);

  useEffect(() => {
    if (onWindowResize) {
      onWindowResize(width, height);
    }
  }, [width, height]);

  useEffect(() => {
    if (context) {
      draw(context);
    }
  }, [context]);

  return <CanvasComponent width={width} height={height} ref={canvasRef} />;
};

FullScreenContext.propTypes = {
  CanvasComponent: node,
  draw: func.isRequired,
  onWindowResize: func
};

FullScreenContext.defaultProps = {
  CanvasComponent: 'canvas',
  draw: noop
};

export default FullScreenContext;
