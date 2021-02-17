import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import * as d3 from 'd3';
import { get } from 'lodash';

import FullScreenContext from './FullScreenContext';
import { LIGHT_BLUE } from './const';
import { useCanvas, useWindowSize } from './hooks';
import { distance, getCanvasDimensions } from './utils';

const BACKGROUND_COLOR = '#000';
const NUM_NODES = 5;
const RADIUS = 5;

window.d3 = d3;

//const StyledCanvas = styled.canvas`
const StyledSvg = styled.svg`
  background-color: ${BACKGROUND_COLOR};
`;

const colorScale = d3
  .scaleLinear()
  .domain([0, NUM_NODES])
  .range([LIGHT_BLUE, 'white']);

const strokeScale = d3.scaleLinear().domain([0, 300]).range([1, 0]).clamp(true);

const randomChoice = arr => get(arr, Math.floor(Math.random() * arr.length));

let nodes = [];
const EDGES = [0, 1, 2, 3];

const draw = (svg, width, height) => {
  console.log('svg', width, height);

  const drawCircle = ({ x, y, r = 2, color = 'white' }) =>
    svg
      .append('circle')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', r)
      .attr('fill', color);

  const drawLine = (p1, p2) =>
    svg.append('line')
      .attr('x1', p1.x)
      .attr('y1', p1.y)
      .attr('x2', p2.x)
      .attr('y2', p2.y);

  const getEdgeCoords = edge =>
    get(
      [
        { x: Math.random() * width, y: 0 },
        { x: width, y: Math.random() * height },
        { x: Math.random() * width, y: height },
        { x: 0, y: Math.random() * height }
      ],
      edge
    );

  const getCoords = c = { x: c.attr('cx'), y: c.attr('cy') };

  const Node = () => {
    console.log('im a node');

    const edge1 = randomChoice(EDGES);
    const edge2 = randomChoice(EDGES.filter(e => e !== edge1));

    const id = Date.now();
    const dest = getEdgeCoords(edge2);
    const source = getEdgeCoords(edge1);
    const circle = drawCircle(source);

    // draw the circle and animate toward destination
    circle
      .transition()
      .duration(distance(source, dest) * 10) //30)
      .ease(d3.easeLinear)
      .attr('cx', dest.x)
      .attr('cy', dest.y)
      .on('end', () => {
        nodes = nodes.filter(n => n.id !== id).concat(Node());
      })
      .remove();

    // draw all the lines between this node and other nodes
    nodes.forEach(node => {
      // TODO copying createConnections
      const coords = getCoords(circle)
      const nodeCoords = getCoords(node.circle)
      const line = drawLine(nodeCoords, coords)
      line.transition()
        .duration(duration * 30)
        .ease(d3.easeLinear)
        .attr('x1', endx1)
        .attr('y1', endy1)
        .attr('x2', endx2)
        .attr('y2', endy2)
        .attrTween('stroke-width', () => {
          return () => strokeScale(distance(coords, nodeCoords))
        })
        .remove();
    })

    return { id, source, dest, circle };
  };

  d3.range(NUM_NODES).forEach(() => nodes.push(Node()));

  console.log('nodes', nodes);
};

const NetworkSvg = () => {
  const [width, height] = useWindowSize();

  useEffect(() => {
    if (width && height) {
      draw(d3.select('svg'), width, height);
    }
  }, [width, height]);

  return <StyledSvg width={width} height={height} />;
};

export default NetworkSvg;
