export const distance = (p1, p2) =>
  Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));

export const getCanvasDimensions = context => {
  if (context) {
    const { width, height } = context.canvas.getBoundingClientRect();
    return { width, height };
  }
};
