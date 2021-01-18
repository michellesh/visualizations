import React, { useCallback, useEffect, useState } from 'react';
import { func } from 'prop-types';
import { noop } from 'lodash';

import { useWindowSize } from './hooks';

const Context = ({ draw, onWindowResize }) => {
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

  return <canvas width={width} height={height} ref={canvasRef}></canvas>;
};

Context.propTypes = {
  draw: func.isRequired,
  onWindowResize: func
};

Context.defaultProps = {
  draw: noop
};

export default Context;
