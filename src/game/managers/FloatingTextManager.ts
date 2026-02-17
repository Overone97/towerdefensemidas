export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
  size: number;
}

export class FloatingTextManager {
  texts: FloatingText[] = [];

  spawn(x: number, y: number, text: string, color: string, size = 10): void {
    if (this.texts.length > 60) this.texts.shift();
    this.texts.push({
      x: x + (Math.random() - 0.5) * 10,
      y,
      text,
      color,
      life: 0.8,
      maxLife: 0.8,
      vy: -40 - Math.random() * 20,
      size,
    });
  }

  update(dt: number): void {
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.life -= dt;
      t.y += t.vy * dt;
      t.vy *= 0.96;
      if (t.life <= 0) this.texts.splice(i, 1);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (const t of this.texts) {
      const alpha = Math.min(1, (t.life / t.maxLife) * 2);
      const scale = 1 + (1 - t.life / t.maxLife) * 0.3;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = t.color;
      ctx.font = `bold ${Math.round(t.size * scale)}px monospace`;
      ctx.textAlign = 'center';
      // Shadow
      ctx.fillStyle = '#000000';
      ctx.fillText(t.text, t.x + 1, t.y + 1);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;
  }

  clear(): void {
    this.texts = [];
  }
}
