import React, { useCallback, useEffect, useState } from 'react';
import png from './images/hello_handwritten.png';

const WIDTH = 800;
const HEIGHT = 500;
const RADIUS = 3;

const Trace = () => {
  const [context, setContext] = useState();
  const [height, setHeight] = useState(HEIGHT);
  const [nodes, setNodes] = useState([]);

  const setImage = context => {
    if (context) {
      const img = new Image();
      img.src = png;
      img.onload = function () {
        const height = (WIDTH / this.width) * this.height;
        setHeight(height);
        context.drawImage(img, 0, 0, WIDTH, height);
      };
    }
  };

  const drawNode = node => {
    if (context) {
      const rect = context.canvas.getBoundingClientRect();
      const x = node.x - rect.x;
      context.beginPath();
      context.arc(x, node.y, RADIUS, 0, Math.PI);
      context.arc(x, node.y, RADIUS, Math.PI, 0);
      context.fillStyle = 'yellow';
      context.fill();
    }
  };

  useEffect(() => setImage(context), [context]);

  const canvasRef = useCallback(node => {
    if (node !== null) {
      setContext(node.getContext('2d'));
    }
  }, []);

  return (
    <>
      <div>
        <canvas
          width={WIDTH}
          height={height}
          ref={canvasRef}
          onClick={event => {
            const node = { x: event.clientX, y: event.clientY };
            drawNode(node);
            setNodes([...nodes, node]);
          }}
        ></canvas>
      </div>
      <div>
        <button onClick={() => console.log(nodes)}>Done</button>
      </div>
    </>
  );
};

export default Trace;
