export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'circle' | 'spark' | 'ring';
  gravity?: number;
  friction?: number;
  shrink?: boolean;
}

const MAX_PARTICLES = 500;

export class ParticleManager {
  particles: Particle[] = [];

  /** Spawn an explosion burst at (x, y) */
  spawnDeathExplosion(x: number, y: number, color: string, count = 12): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 30 + Math.random() * 60;
      this.addParticle({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.3 + Math.random() * 0.4,
        maxLife: 0.7,
        size: 2 + Math.random() * 3,
        color,
        type: 'circle',
        gravity: 40,
        friction: 0.95,
        shrink: true,
      });
    }
    // Ring effect
    this.addParticle({
      x, y,
      vx: 0, vy: 0,
      life: 0.35,
      maxLife: 0.35,
      size: 5,
      color,
      type: 'ring',
      shrink: false,
    });
  }

  /** Spawn a boss death with extra fanfare */
  spawnBossExplosion(x: number, y: number): void {
    this.spawnDeathExplosion(x, y, '#ff44ff', 24);
    this.spawnDeathExplosion(x, y, '#ffaa00', 16);
    // Extra sparks
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100;
      this.addParticle({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 1.0,
        size: 1.5 + Math.random() * 2,
        color: '#ffffff',
        type: 'spark',
        gravity: 60,
        friction: 0.92,
        shrink: true,
      });
    }
  }

  /** Trail behind a projectile */
  spawnProjectileTrail(x: number, y: number, color: string): void {
    this.addParticle({
      x: x + (Math.random() - 0.5) * 3,
      y: y + (Math.random() - 0.5) * 3,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      life: 0.15 + Math.random() * 0.1,
      maxLife: 0.25,
      size: 1.5 + Math.random() * 1.5,
      color,
      type: 'circle',
      friction: 0.9,
      shrink: true,
    });
  }

  /** Aura particles floating around a legendary unit */
  spawnLegendaryAura(x: number, y: number, color: string): void {
    const angle = Math.random() * Math.PI * 2;
    const dist = 10 + Math.random() * 8;
    this.addParticle({
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist,
      vx: Math.cos(angle + Math.PI / 2) * 8,
      vy: -10 - Math.random() * 15,
      life: 0.6 + Math.random() * 0.4,
      maxLife: 1.0,
      size: 1.5 + Math.random() * 1.5,
      color,
      type: 'circle',
      friction: 0.97,
      shrink: true,
    });
  }

  update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.vx *= (p.friction ?? 1);
      p.vy *= (p.friction ?? 1);
      if (p.gravity) p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      const lifeRatio = p.life / p.maxLife;
      const alpha = Math.min(1, lifeRatio * 2); // fade out
      const size = p.shrink ? p.size * lifeRatio : p.size;

      ctx.globalAlpha = alpha;

      if (p.type === 'ring') {
        const ringSize = p.size + (1 - lifeRatio) * 20;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2 * lifeRatio;
        ctx.beginPath();
        ctx.arc(p.x, p.y, ringSize, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'spark') {
        // Draw as a small line in the direction of velocity
        const len = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (len > 0) {
          const nx = p.vx / len;
          const ny = p.vy / len;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = size * 0.6;
          ctx.beginPath();
          ctx.moveTo(p.x - nx * size, p.y - ny * size);
          ctx.lineTo(p.x + nx * size, p.y + ny * size);
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, size), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  clear(): void {
    this.particles = [];
  }

  private addParticle(p: Particle): void {
    if (this.particles.length >= MAX_PARTICLES) {
      this.particles.shift(); // drop oldest
    }
    this.particles.push(p);
  }
}
