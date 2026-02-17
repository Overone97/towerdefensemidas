export class ScreenShake {
  intensity = 0;
  duration = 0;
  timer = 0;
  offsetX = 0;
  offsetY = 0;

  trigger(intensity: number, duration: number): void {
    this.intensity = Math.max(this.intensity, intensity);
    this.duration = Math.max(this.duration, duration);
    this.timer = 0;
  }

  update(dt: number): void {
    if (this.duration <= 0) {
      this.offsetX = 0;
      this.offsetY = 0;
      return;
    }
    this.timer += dt;
    if (this.timer >= this.duration) {
      this.duration = 0;
      this.intensity = 0;
      this.offsetX = 0;
      this.offsetY = 0;
      return;
    }
    const fade = 1 - this.timer / this.duration;
    const mag = this.intensity * fade;
    this.offsetX = (Math.random() - 0.5) * 2 * mag;
    this.offsetY = (Math.random() - 0.5) * 2 * mag;
  }
}
