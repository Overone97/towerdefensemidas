export function safeRadialGradient(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  r0: number,
  x1: number,
  y1: number,
  r1: number,
): CanvasGradient {
  const inner = Number.isFinite(r0) ? Math.max(0, r0) : 0;
  const outerBase = Number.isFinite(r1) ? Math.max(0, r1) : 0;
  const outer = Math.max(inner + 0.001, outerBase);
  return ctx.createRadialGradient(x0, y0, inner, x1, y1, outer);
}
