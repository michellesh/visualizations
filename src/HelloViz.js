import React, { useCallback, useEffect, useState } from 'react';
import * as d3 from 'd3';

import { staticNodesHello as staticNodes } from './const';

const WIDTH = 1000;
const HEIGHT = 150;
const SCALE = 0.5;
const TOP = 150;
const MIN_RADIUS = 3;
const MAX_RADIUS = 5;
const NUM_NODES = staticNodes.length * 6;
const unscaled = x => x * (1 / SCALE);

const colorScale = d3
  .scaleLinear()
  .domain([0, NUM_NODES])
  .range(['blue', 'pink']);

const getStaticNode = i => staticNodes[Math.floor(i % staticNodes.length)];
const nodes = d3.range(NUM_NODES).map(n => ({
  c: colorScale(Math.random() * NUM_NODES),
  r: MIN_RADIUS + Math.random() * MAX_RADIUS,
  staticNode: getStaticNode(n),
  x: 0,
  y: 0
}));

const pointerNode = { isPointer: true };
const onPointerMove = event => {
  const [x, y] = d3.pointer(event);
  pointerNode.fx = unscaled(x);
  pointerNode.fy = unscaled(y);
};

const forces = {
  center: d3.forceCenter(WIDTH, TOP),
  charge: d3.forceManyBody().strength(d => (d.isPointer ? -15 : 0)),
  collide: d3.forceCollide().radius(d => d.r / 2),
  x: d3
    .forceX()
    .strength(0.05)
    .x(d => (d.isPointer ? 0 : d.staticNode.x)),
  y: d3
    .forceY()
    .strength(0.05)
    .y(d => (d.isPointer ? 0 : d.staticNode.y))
};

const onTick = context => () => {
  context.clearRect(0, 0, unscaled(WIDTH), unscaled(HEIGHT));
  nodes.forEach((node, i) => {
    context.beginPath();
    context.moveTo(node.x + node.r, node.y);
    context.arc(node.x, node.y, node.r, 0, Math.PI);
    context.arc(node.x, node.y, node.r, Math.PI, 0);
    context.fillStyle = node.c;
    context.fill();
  });
};

const forceSimulation = Object.keys(forces).reduce(
  (simulation, f) => simulation.force(f, forces[f]),
  d3
    .forceSimulation([pointerNode, ...nodes])
    .alphaTarget(0.3)
    .velocityDecay(0.1)
);

const startForceSimulation = context => {
  context.scale(SCALE, SCALE);
  forceSimulation.on('tick', onTick(context));
  d3.select(context.canvas).on('pointermove', onPointerMove);
};

const Viz = () => {
  const [context, setContext] = useState();

  const canvasRef = useCallback(node => {
    if (node !== null) {
      setContext(node.getContext('2d'));
    }
  }, []);

  useEffect(() => {
    if (context) {
      startForceSimulation(context);
    }
  }, [context]);

  return <canvas width={WIDTH} height={HEIGHT} ref={canvasRef}></canvas>;
};

export default Viz;
