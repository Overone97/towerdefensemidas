import { Point, Slot } from '../types';

// Canvas dimensions
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 500;

// Waypoints defining the enemy path (snake pattern)
export const WAYPOINTS: Point[] = [
  { x: 0, y: 80 },
  { x: 700, y: 80 },
  { x: 700, y: 200 },
  { x: 100, y: 200 },
  { x: 100, y: 320 },
  { x: 700, y: 320 },
  { x: 700, y: 440 },
  { x: 800, y: 440 },
];

// Placement slots near the path
export const INITIAL_SLOTS: Slot[] = [
  { x: 200, y: 130, unitId: null },
  { x: 400, y: 130, unitId: null },
  { x: 600, y: 130, unitId: null },
  { x: 500, y: 250, unitId: null },
  { x: 300, y: 250, unitId: null },
  { x: 150, y: 370, unitId: null },
  { x: 350, y: 370, unitId: null },
  { x: 550, y: 370, unitId: null },
];
