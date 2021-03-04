const OFFSET = Math.PI / 2;

export const angleBetween = (p1, p2) =>
  Math.atan2(p2.y - p1.y, p2.x - p1.x) - OFFSET;

export const degrees = radians => (180 * (radians + OFFSET)) / Math.PI;

export const distance = (p1, p2) =>
  Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));

// get a point along the line that forms between p1 and p2
// howFar value between 0 and 1, how far along that line
export const pointOnLine = (p1, p2, howFar) => ({
  x: p1.x + (p2.x - p1.x) * howFar,
  y: p1.y + (p2.y - p1.y) * howFar
});

export const pointOnEllipse = (ellipse, angleRadians) => ({
  x:
    ellipse.x +
    ellipse.rx * Math.cos(angleRadians) * Math.cos(ellipse.rotation) -
    ellipse.ry * Math.sin(angleRadians) * Math.sin(ellipse.rotation),
  y:
    ellipse.y +
    ellipse.rx * Math.cos(angleRadians) * Math.sin(ellipse.rotation) +
    ellipse.ry * Math.sin(angleRadians) * Math.cos(ellipse.rotation)
});

export const isPointInsideEllipse = (ellipse, point) => {
  const { rx: a, ry: b, x: x0, y: y0, rotation: alpha } = ellipse;
  const { x: xp, y: yp } = point;
  return (
    Math.pow(Math.cos(alpha) * (xp - x0) + Math.sin(alpha) * (yp - y0), 2) /
      (a * a) +
      Math.pow(Math.sin(alpha) * (xp - x0) - Math.cos(alpha) * (yp - y0), 2) /
        (b * b) <=
    1
  );
};

const sign = (p1, p2, p3) =>
  (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);

export const isPointInsideTriangle = (pt, v1, v2, v3) => {
  const d1 = sign(pt, v1, v2);
  const d2 = sign(pt, v2, v3);
  const d3 = sign(pt, v3, v1);

  const has_neg = d1 < 0 || d2 < 0 || d3 < 0;
  const has_pos = d1 > 0 || d2 > 0 || d3 > 0;

  return !(has_neg && has_pos);
};

export const radians = degrees => (degrees * Math.PI) / 180 - OFFSET;

export const getCanvasDimensions = context => {
  if (context) {
    const { width, height } = context.canvas.getBoundingClientRect();
    return { width, height };
  }
};
