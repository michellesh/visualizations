import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { noop } from 'lodash';
import * as d3 from 'd3';
window.d3 = d3;

import { useCanvas, useWindowSize } from './hooks';
import {
  angleBetween,
  distance,
  getCanvasDimensions,
  isPointInsideEllipse,
  isPointInsideTriangle,
  pointOnEllipse,
  pointOnLine,
  radians
} from './utils';

import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

const Label = styled(Grid)`
  text-align: right;
`;
const Options = styled(Grid)`
  text-align: left;
`;
const Spacious = styled.span`
  padding-left: 1em;
`;

const SHOW_OUTLINES = false;
const DEFAULT_LED_DENSITY = 30;
const DEFAULT_NUM_STRANDS = 15; // inclusive of both edge strands. ellipse style only

// Don't change these
const MAX_WIDTH = 1000;
const RATIO = 0.85;
const RADIUS_X = 100;
const SAIL_COLOR = '#455B68';
const BACKGROUND_COLOR = 'white';
const LED_COLOR = SHOW_OUTLINES ? 'black' : 'white';
const MIN_NUM_STRANDS = 8;
const MAX_NUM_STRANDS = 50;
const HEIGHT_INCHES = 314; // the height of the actual sail
//const WIDTH_INCHES = 232; // the width of the actual sail

const leftHemisphere = [radians(180), radians(360)];
const rightHemisphere = [radians(0), radians(180)];
const ellipse = (
  p1,
  p2,
  rx = RADIUS_X,
  startAngle = radians(0),
  endAngle = radians(360)
) => {
  const _ellipse = {
    x: pointOnLine(p1, p2, 0.5).x,
    y: pointOnLine(p1, p2, 0.5).y,
    rx,
    ry: distance(p1, p2) / 2,
    rotation: angleBetween(p1, p2),
    startAngle,
    endAngle
  };
  return Object.freeze({
    ..._ellipse,
    draw: (context, strokeColor = 'black', fillColor) => {
      const { x, y, rx, ry, rotation, startAngle, endAngle } = _ellipse;
      context.beginPath();
      context.ellipse(x, y, rx, ry, rotation, startAngle, endAngle);
      context.strokeStyle = strokeColor;
      context.stroke();
      if (fillColor) {
        context.fillStyle = fillColor;
        context.fill();
      }
    }
  });
};

const dot = config => {
  const defaults = { radius: 2, startAngle: 0, endAngle: 2 * Math.PI };
  const _dot = { ...defaults, ...config };
  return Object.freeze({
    ..._dot,
    radius: radius => dot({ ..._dot, radius }),
    draw: (context, color = 'black') => {
      const { x, y, radius, startAngle, endAngle } = _dot;
      context.beginPath();
      context.arc(x, y, radius, startAngle, endAngle);
      context.fillStyle = color;
      context.fill();
    }
  });
};

const sail = config => {
  const { p1, p2, p3, rx, numStrands } = config;
  const ellipses = d3.range(0, numStrands).map(i => {
    const incAmount = rx / (numStrands - 1);
    const pInc = pointOnLine(p3, p1, i / (numStrands - 1));
    const newRx = rx - i * incAmount * 2;
    const [startAngle, endAngle] =
      newRx >= 0 ? rightHemisphere : leftHemisphere;
    return ellipse(pInc, p2, Math.abs(newRx), startAngle, endAngle);
  });
  const _sail = {
    ...config,
    e1: ellipse(p1, p2, rx),
    e2: ellipse(p2, p3, rx),
    e3: ellipse(p3, p1, rx),
    ellipses
  };
  return Object.freeze({
    ..._sail,
    setNumStrands: numStrands => sail({ ..._sail, numStrands }),
    getEllipseLEDs: (context, ledDensity = DEFAULT_LED_DENSITY) =>
      ellipses
        .map(e => {
          const angleStep = (e.endAngle - e.startAngle) / ledDensity;
          return d3
            .range(e.startAngle, e.endAngle, angleStep)
            .map(angle => pointOnEllipse(e, angle))
            .filter(
              led =>
                isPointInsideTriangle(led, p1, p2, p3) &&
                [_sail.e1, _sail.e2, _sail.e3].every(
                  e => !isPointInsideEllipse(e, led)
                )
            );
        })
        .filter(ledStrand => ledStrand.length > 0),
    getGridLEDs: (context, ledDensity = DEFAULT_LED_DENSITY) => {
      const step = (p1.x - p3.x) / ledDensity;
      return d3
        .range(p3.y, p2.y, step)
        .map(y =>
          d3
            .range(p3.x, p1.x, step)
            .map(x => ({ x, y }))
            .filter(
              led =>
                isPointInsideTriangle(led, p1, p2, p3) &&
                [_sail.e1, _sail.e2, _sail.e3].every(
                  e => !isPointInsideEllipse(e, led)
                )
            )
        )
        .filter(ledStrand => ledStrand.length > 0);
    },
    drawPretty: context => {
      context.beginPath();
      context.moveTo(p1.x, p1.y);
      context.lineTo(p2.x, p2.y);
      context.lineTo(p3.x, p3.y);
      context.fillStyle = SAIL_COLOR;
      context.fill();
      [_sail.e1, _sail.e2, _sail.e3].forEach(e => {
        e.draw(context, BACKGROUND_COLOR, BACKGROUND_COLOR);
      });
    },
    drawOutlines: context => {
      dot(p1).radius(4).draw(context, 'red');
      dot(p2).radius(4).draw(context, 'orange');
      dot(p3).radius(4).draw(context, 'yellow');
      _sail.e1.draw(context);
      _sail.e2.draw(context);
      _sail.e3.draw(context);
      return sail(_sail);
    },
    drawEllipseStrands: (context, color = 'black') => {
      ellipses.forEach(e => e.draw(context, color));
    }
  });
};

const getSails = (width, height) => ({
  mainLeft: {
    p1: { x: width * 0.9, y: 0 },
    p2: { x: width * 0.5, y: height },
    p3: { x: width * 0.1, y: 0 },
    rx: RADIUS_X
  }
});

const pixelsToInches = (ledStrands, pixels) => {
  const { minY, maxY } = ledStrands.reduce(
    (acc, leds) => {
      leds.forEach(led => {
        acc.minX = Math.min(acc.minX, led.x);
        acc.minY = Math.min(acc.minY, led.y);
        acc.maxX = Math.max(acc.maxX, led.x);
        acc.maxY = Math.max(acc.maxY, led.y);
      });
      return acc;
    },
    {
      minX: Infinity,
      minY: Infinity,
      maxX: 0,
      maxY: 0
    }
  );
  const pixelsPerInch = (maxY - minY) / HEIGHT_INCHES;
  return pixels / pixelsPerInch;
};

const middleStrand = ledStrands =>
  ledStrands[Math.floor(ledStrands.length / 2)];

const getInfo = ledStrands => ({
  numStrands: ledStrands.length,
  totalLEDs: ledStrands.reduce((acc, leds) => acc + leds.length, 0),
  spaceBetweenLEDs: pixelsToInches(
    ledStrands,
    distance(middleStrand(ledStrands)[0], middleStrand(ledStrands)[1])
  ),
  ledsPerStrand: ledStrands
    .map(leds => leds.length)
    .slice(1, ledStrands.length - 1)
});

const drawCurvedLEDs = (context, s, ledDensity, ledColor) => {
  const ledStrands = s.getEllipseLEDs(context, ledDensity);
  drawLEDs(context, ledStrands, ledColor);
  return ledStrands;
};

const drawGridLEDs = (context, s, ledDensity, ledColor) => {
  const ledStrands = s.getGridLEDs(context, ledDensity);
  drawLEDs(context, ledStrands, ledColor);
  return ledStrands;
};

const drawLEDs = (context, ledStrands, ledColor = LED_COLOR) =>
  ledStrands.forEach(leds =>
    leds.forEach(led => dot(led).draw(context, ledColor))
  );

const draw = (
  context,
  setInfo,
  { ledDensity, mathMode, numStrands, strandStyle }
) => {
  const { width } = getCanvasDimensions(context);
  const height = width * RATIO;
  context.clearRect(0, 0, width, height);

  const sails = getSails(width, height);
  const s = sail(sails.mainLeft).setNumStrands(numStrands);

  if (mathMode) {
    s.drawOutlines(context);
    if (strandStyle === 'ellipse') {
      s.drawEllipseStrands(context);
    }
  } else {
    s.drawPretty(context);
  }

  const ledColor = mathMode ? 'black' : 'white';
  if (strandStyle === 'ellipse') {
    setInfo(getInfo(drawCurvedLEDs(context, s, ledDensity, ledColor)));
  } else {
    setInfo(getInfo(drawGridLEDs(context, s, ledDensity, ledColor)));
  }
};

const Network = () => {
  const [info, setInfo] = useState({});
  const [canvasRef, context] = useCanvas();
  const [windowWidth] = useWindowSize();
  const [width, setWidth] = useState(MAX_WIDTH);

  const [ledDensity, setLedDensity] = useState(DEFAULT_LED_DENSITY);
  const [strandStyle, setStrandStyle] = useState('ellipse');
  const [numStrands, setNumStrands] = useState(DEFAULT_NUM_STRANDS);
  const [mathMode, setMathMode] = useState(false);

  useEffect(() => {
    if (context) {
      draw(context, setInfo, { ledDensity, mathMode, numStrands, strandStyle });
    }
  }, [width, ledDensity, mathMode, numStrands, strandStyle]);

  useEffect(() => {
    setWidth(Math.min(windowWidth, MAX_WIDTH));
  }, [windowWidth]);

  return (
    <div>
      <Grid container justify="center" alignItems="center">
        <Label item xs={5}>
          <Typography variant="overline">Strand Style</Typography>
        </Label>
        <Options item xs>
          {['ellipse', 'grid'].map(s => (
            <Spacious key={s}>
              <Button
                color={strandStyle === s ? 'primary' : undefined}
                variant="outlined"
                onClick={() => setStrandStyle(s)}
              >
                {s}
              </Button>
            </Spacious>
          ))}
        </Options>
      </Grid>
      <Grid container justify="center" alignItems="center">
        <Label item xs={5}>
          <Typography variant="overline">Number of LEDs</Typography>
        </Label>
        <Grid item xs={1}>
          {info.totalLEDs}
        </Grid>
        <Options item xs>
          <Button onClick={() => setLedDensity(ledDensity + 5)}>More</Button>
          <Button onClick={() => setLedDensity(ledDensity - 5)}>Less</Button>
          <Button onClick={() => setLedDensity(DEFAULT_LED_DENSITY)}>
            Reset
          </Button>
        </Options>
      </Grid>
      {info.ledsPerStrand && (
        <Grid container justify="center" alignItems="center">
          <Label item xs={5}>
            <Typography variant="overline">LEDs per strand</Typography>
          </Label>
          <Grid item xs={1}>
            {Math.min(...info.ledsPerStrand)} -{' '}
            {Math.max(...info.ledsPerStrand)}
          </Grid>
          <Grid item xs />
        </Grid>
      )}
      <Grid container justify="center" alignItems="center">
        <Label item xs={5}>
          <Typography variant="overline">Space between vertical LED</Typography>
        </Label>
        <Grid item xs={1}>
          {Number.parseFloat(info.spaceBetweenLEDs).toFixed(1)}
          {'"'}
        </Grid>
        <Grid item xs />
      </Grid>
      <Grid container justify="center" alignItems="center">
        <Label item xs={5}>
          <Typography variant="overline">Number of Strands</Typography>
        </Label>
        <Grid item xs={1}>
          {info.numStrands}
        </Grid>
        <Options item xs>
          <Button
            disabled={strandStyle === 'grid'}
            onClick={() =>
              numStrands < MAX_NUM_STRANDS
                ? setNumStrands(numStrands + 1)
                : noop
            }
          >
            More
          </Button>
          <Button
            disabled={strandStyle === 'grid'}
            onClick={() =>
              numStrands > MIN_NUM_STRANDS
                ? setNumStrands(numStrands - 1)
                : noop
            }
          >
            Less
          </Button>
          <Button
            disabled={strandStyle === 'grid'}
            onClick={() => setNumStrands(DEFAULT_NUM_STRANDS)}
          >
            Reset
          </Button>
        </Options>
      </Grid>
      <Grid container justify="center" alignItems="center">
        <Label item xs={5}>
          <Typography variant="overline">Math Mode</Typography>
        </Label>
        <Options item xs>
          <Checkbox color="primary" onClick={() => setMathMode(!mathMode)} />
        </Options>
      </Grid>

      <canvas ref={canvasRef} width={width} height={width * RATIO} />
    </div>
  );
};

export default Network;
