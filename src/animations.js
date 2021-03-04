import { distance, getCanvasDimensions } from './utils';

const showLEDs = (context, leds) => {
  const { width, height } = getCanvasDimensions(context);
  context.clearRect(0, 0, width, height);
  leds.forEach(led => led.draw(context));
};

const showStrands = (context, strands) => {
  const { width, height } = getCanvasDimensions(context);
  context.clearRect(0, 0, width, height);
  showLEDs(
    context,
    strands.flatMap(strand => strand)
  );
};

export const fan = (context, strands) => {
  const { width, height } = getCanvasDimensions(context);
  context.clearRect(0, 0, width, height);

  const maxStrandLength = Math.max(...strands.map(strand => strand.length));
  let currentStrand = 0;

  const _fan = () => {
    strands.forEach(strand => {
      if (currentStrand < strand.length) {
        strand[currentStrand] = strand[currentStrand].radius(3);
      }
      if (currentStrand > 0 && currentStrand - 1 < strand.length) {
        strand[currentStrand - 1] = strand[currentStrand - 1].radius(1);
      }
    });
    showStrands(context, strands);
    currentStrand = currentStrand === maxStrandLength ? 0 : currentStrand + 1;
    window.requestAnimationFrame(_fan);
  };

  window.requestAnimationFrame(_fan);
};

export const ripple = (context, strands) => {
  const { width, height } = getCanvasDimensions(context);
  const X = width / 2;
  const Y = height / 2;
  const RIPPLE_WIDTH = 50;
  const LED_COLOR = 'white';
  const RIPPLE_COLOR = 'gold';

  const increaseRadius = d3
    .scaleLinear()
    .domain([0, RIPPLE_WIDTH])
    .range([1, 5]);
  const decreaseRadius = d3
    .scaleLinear()
    .domain([0, RIPPLE_WIDTH])
    .range([5, 1]);
  const increaseColor = d3
    .scaleLinear()
    .domain([0, RIPPLE_WIDTH])
    .range([LED_COLOR, RIPPLE_COLOR]);
  const decreaseColor = d3
    .scaleLinear()
    .domain([0, RIPPLE_WIDTH])
    .range([RIPPLE_COLOR, LED_COLOR]);

  const inRippleRange = (led, radius) => {
    const d = distance(led, { x: X, y: Y });
    return d < radius && d > radius - RIPPLE_WIDTH;
  };

  const prominence = (led, radius) => radius - distance(led, { x: X, y: Y });

  const getRadius = prominence =>
    prominence - RIPPLE_WIDTH / 2 < 0
      ? increaseRadius(prominence)
      : decreaseRadius(prominence);

  const getColor = prominence =>
    prominence - RIPPLE_WIDTH / 2 < 0
      ? increaseColor(prominence)
      : decreaseColor(prominence);

  let leds = strands.flatMap(strand => strand);
  let radius = 0;
  const _ripple = () => {
    leds = leds.map(led =>
      inRippleRange(led, radius)
        ? led
            .color(getColor(prominence(led, radius)))
            .radius(getRadius(prominence(led, radius)))
        : led.color(LED_COLOR).radius(1)
    );
    showLEDs(context, leds);
    radius = radius >= width * 0.75 ? 0 : radius + 5;
    window.requestAnimationFrame(_ripple);
  };

  window.requestAnimationFrame(_ripple);
};
