import React, { useState } from 'react';

import { useCanvas } from './hooks';

const Test = () => {
  const [canvasRef, context] = useCanvas();
  const [color, setColor] = useState('black');

  if (context) {
    context.beginPath();
    context.arc(100, 75, 50, 0, 2 * Math.PI);
    context.fillStyle = color;
    context.fill();
  }

  return (
    <>
      {['blue', 'green'].map(color => (
        <button
          key={color}
          value={color}
          onClick={e => setColor(e.target.value)}
        >
          {color}
        </button>
      ))}
      <canvas ref={canvasRef} width={500} height={400} />
    </>
  );
};

export default Test;
