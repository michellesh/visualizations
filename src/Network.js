import React, { useEffect } from 'react';
import styled from 'styled-components';
import * as d3 from 'd3';
import { get } from 'lodash';

import { useWindowSize } from './hooks';
import { distance } from './utils';

const BACKGROUND_COLOR = '#000';
const NUM_NODES = 30;
const OFFSET = 400;
const SPEED = 30; // 10=fast, 20=mid, 30=slow

const StyledSvg = styled.svg`
  background-color: ${BACKGROUND_COLOR};
`;

const COLORS = [
  '#0368C4',
  '#70ADDC',
  '#A27376',
  '#AAC1D2',
  '#AE3E27',
  '#CB661C',
  '#CF060D',
  '#D6B4BC'
];

const strokeScale = d3.scaleLinear().domain([0, 500]).range([5, 0]).clamp(true);

const randomChoice = arr => get(arr, Math.floor(Math.random() * arr.length));

const EDGES = [0, 1, 2, 3];

let nodes = [];

const getLineDestination = (node1, node2) => {
  const remainingDist = node2.remainingDistance();
  const progress = node2.dist - remainingDist;
  return node1.dist < remainingDist
    ? {
        duration: node1.dist,
        x1: node1.dest.x,
        y1: node1.dest.y,
        x2: node2.scaleX(node1.dist + progress),
        y2: node2.scaleY(node1.dist + progress)
      }
    : {
        duration: remainingDist,
        x1: node1.scaleX(remainingDist),
        y1: node1.scaleY(remainingDist),
        x2: node2.dest.x,
        y2: node2.dest.y
      };
};

const isLineBackwards = (...nodes) => {
  const [x1, y1, x2, y2] = nodes.flatMap(n => [
    Number(n.coords().x),
    Number(n.coords().y)
  ]);
  return (x1 < x2 && y1 < y2) || (x1 < x2 && y1 > y2);
};

const getGradient = (node1, node2) =>
  isLineBackwards(node1, node2)
    ? `url(#lg_${node1.color}_${node2.color})`
    : `url(#lg_${node2.color}_${node1.color})`;

const getSvgUtils = (svg, width, height) =>
  Object.freeze({
    drawCircle: ({ color, r = 0, x, y }) =>
      svg
        .append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', r)
        .attr('fill', color),
    drawLine: (p1, p2, color) =>
      svg
        .append('line')
        .attr('x1', p1.x)
        .attr('y1', p1.y)
        .attr('x2', p2.x)
        .attr('y2', p2.y)
        .attr('stroke', color),
    getEdgeCoords: edge =>
      get(
        [
          { x: Math.random() * (width + OFFSET), y: -OFFSET },
          { x: width + OFFSET, y: Math.random() * (height + OFFSET) },
          { x: Math.random() * (width + OFFSET), y: height + OFFSET },
          { x: -OFFSET, y: Math.random() * (height + OFFSET) }
        ],
        edge
      ),
    randomCoords: () => ({
      x: -OFFSET + (width + OFFSET * 2) * Math.random(),
      y: -OFFSET + (height + OFFSET * 2) * Math.random()
    })
  });

const draw = (svg, width, height) => {
  const { drawCircle, drawLine, randomCoords, getEdgeCoords } = getSvgUtils(
    svg,
    width,
    height
  );

  const animateNode = node =>
    node.circle
      .transition()
      .duration(node.dist * SPEED)
      .ease(d3.easeLinear)
      .attr('cx', node.dest.x)
      .attr('cy', node.dest.y)
      .on(
        'end',
        () => (nodes = nodes.filter(n => n.id !== node.id).concat(Node()))
      )
      .remove();

  const animateLines = node =>
    nodes.forEach(n => {
      const { duration, x1, y1, x2, y2 } = getLineDestination(node, n);
      drawLine(node.coords(), n.coords(), getGradient(node, n))
        .transition()
        .duration(duration * SPEED)
        .ease(d3.easeLinear)
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attrTween('stroke', () => () => getGradient(node, n))
        .attrTween('stroke-width', () => () =>
          strokeScale(distance(node.coords(), n.coords()))
        )
        .remove();
    });

  const Node = startCoords => {
    const edge1 = randomChoice(EDGES);
    const edge2 = randomChoice(EDGES.filter(e => e !== edge1));
    const dest = getEdgeCoords(edge2);
    const source = startCoords || getEdgeCoords(edge1);
    const color = randomChoice(COLORS);
    const circle = drawCircle({ ...source, color: color });
    const dist = distance(source, dest);
    const _node = Object.freeze({
      circle,
      color,
      coords: () => ({ x: circle.attr('cx'), y: circle.attr('cy') }),
      dest,
      dist,
      id: Date.now(),
      remainingDistance: () => distance(_node.coords(), dest),
      scaleX: d3.scaleLinear().domain([0, dist]).range([source.x, dest.x]),
      scaleY: d3.scaleLinear().domain([0, dist]).range([source.y, dest.y])
    });

    animateNode(_node);
    animateLines(_node);

    return _node;
  };

  d3.range(NUM_NODES).forEach(() => nodes.push(Node(randomCoords())));
};

const NetworkSvg = () => {
  const [width, height] = useWindowSize();

  useEffect(() => {
    if (width && height) {
      draw(d3.select('svg'), width, height);
    }
  }, [width, height]);

  return (
    <StyledSvg width={width} height={height}>
      <defs>
        {COLORS.flatMap(color1 =>
          COLORS.map(color2 => (
            <linearGradient
              id={`lg_${color1}_${color2}`}
              key={`${color1}_${color2}`}
            >
              <stop offset="0%" stopColor={color1} />
              <stop offset="50%" stopColor={BACKGROUND_COLOR} />
              <stop offset="100%" stopColor={color2} />
            </linearGradient>
          ))
        )}
      </defs>
    </StyledSvg>
  );
};

export default NetworkSvg;
