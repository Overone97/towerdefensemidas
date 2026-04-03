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

  /** Fire burst effect */
  spawnFireBurst(x: number, y: number, radius: number): void {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 40;
      this.addParticle({
        x: x + (Math.random() - 0.5) * radius * 0.5,
        y: y + (Math.random() - 0.5) * radius * 0.5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        life: 0.3 + Math.random() * 0.3,
        maxLife: 0.6,
        size: 2 + Math.random() * 3,
        color: ['#ff4400', '#ff8800', '#ffcc00'][Math.floor(Math.random() * 3)],
        type: 'circle',
        gravity: -30,
        friction: 0.92,
        shrink: true,
      });
    }
  }

  /** Ice/frost effect */
  spawnIceEffect(x: number, y: number, radius: number): void {
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      this.addParticle({
        x: x + Math.cos(angle) * radius * 0.3,
        y: y + Math.sin(angle) * radius * 0.3,
        vx: Math.cos(angle) * 15,
        vy: Math.sin(angle) * 15 - 10,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        size: 2 + Math.random() * 2,
        color: ['#88ddff', '#aaeeff', '#ffffff'][Math.floor(Math.random() * 3)],
        type: 'spark',
        friction: 0.95,
        shrink: true,
      });
    }
  }

  /** Poison cloud puff */
  spawnPoisonPuff(x: number, y: number): void {
    for (let i = 0; i < 4; i++) {
      this.addParticle({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 10,
        vy: -15 - Math.random() * 10,
        life: 0.5 + Math.random() * 0.3,
        maxLife: 0.8,
        size: 3 + Math.random() * 3,
        color: ['#44ff44', '#22cc22', '#88ff88'][Math.floor(Math.random() * 3)],
        type: 'circle',
        gravity: -10,
        friction: 0.96,
        shrink: true,
      });
    }
  }

  /** Critical hit flash */
  spawnCritFlash(x: number, y: number): void {
    this.addParticle({
      x, y,
      vx: 0, vy: 0,
      life: 0.2,
      maxLife: 0.2,
      size: 8,
      color: '#ffffff',
      type: 'ring',
      shrink: false,
    });
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      this.addParticle({
        x, y,
        vx: Math.cos(angle) * 50,
        vy: Math.sin(angle) * 50,
        life: 0.15,
        maxLife: 0.15,
        size: 1.5,
        color: '#ffdd00',
        type: 'spark',
        friction: 0.9,
        shrink: true,
      });
    }
  }

  /** Class feedback burst */
  spawnClassImpact(x: number, y: number, role: 'burst' | 'aoe' | 'poison' | 'support'): void {
    if (role === 'burst') {
      this.spawnCritFlash(x, y);
      this.spawnDeathExplosion(x, y, '#ff7a7a', 10);
      return;
    }
    if (role === 'aoe') {
      this.spawnFireBurst(x, y, 26);
      return;
    }
    if (role === 'poison') {
      this.spawnPoisonPuff(x, y);
      this.spawnPoisonPuff(x + 6, y - 4);
      return;
    }
    this.spawnIceEffect(x, y, 18);
  }

  /** Star evolution burst (for merge animation) */
  spawnStarEvolution(x: number, y: number, stars: number): void {
    const color = stars === 3 ? '#ffcc00' : '#44ccff';
    const count = stars === 3 ? 30 : 20;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 40 + Math.random() * 60;
      this.addParticle({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 1.0,
        size: 2 + Math.random() * 3,
        color,
        type: i % 3 === 0 ? 'spark' : 'circle',
        gravity: 30,
        friction: 0.93,
        shrink: true,
      });
    }
    // Big ring
    this.addParticle({
      x, y,
      vx: 0, vy: 0,
      life: 0.5,
      maxLife: 0.5,
      size: 10,
      color,
      type: 'ring',
      shrink: false,
    });
  }

  /** Synergy aura effect */
  spawnSynergyAura(x: number, y: number, color: string): void {
    const angle = Math.random() * Math.PI * 2;
    const dist = 12 + Math.random() * 6;
    this.addParticle({
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist,
      vx: Math.cos(angle + Math.PI / 2) * 5,
      vy: -8 - Math.random() * 10,
      life: 0.8 + Math.random() * 0.4,
      maxLife: 1.2,
      size: 1 + Math.random() * 1.5,
      color,
      type: 'circle',
      friction: 0.98,
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
    let i = this.particles.length;
    while (i-- > 0) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        // O(1) removal: swap with last element then pop
        this.particles[i] = this.particles[this.particles.length - 1];
        this.particles.pop();
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
      this.particles[0] = p; // Overwrite oldest instead of shift (O(1))
    } else {
      this.particles.push(p);
    }
  }
}
