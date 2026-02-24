import { Point, Slot } from '../types';

export interface MapDef {
  id: string;
  name: string;
  description: string;
  waypoints: Point[];
  slots: Slot[];
  requiredStars: number;
  bgColor: string;
  pathColor: string;
  bgImage?: string;
}

export const ALL_MAPS: MapDef[] = [
  {
    id: 'plains',
    name: 'Plains',
    description: 'A winding path through open fields.',
    requiredStars: 0,
    bgColor: '#0f1923',
    pathColor: '#2a3a4a',
    waypoints: [
      { x: 0, y: 80 },
      { x: 700, y: 80 },
      { x: 700, y: 200 },
      { x: 100, y: 200 },
      { x: 100, y: 320 },
      { x: 700, y: 320 },
      { x: 700, y: 440 },
      { x: 800, y: 440 },
    ],
    slots: [
      { x: 200, y: 130, unitId: null },
      { x: 400, y: 130, unitId: null },
      { x: 600, y: 130, unitId: null },
      { x: 500, y: 250, unitId: null },
      { x: 300, y: 250, unitId: null },
      { x: 150, y: 370, unitId: null },
      { x: 350, y: 370, unitId: null },
      { x: 550, y: 370, unitId: null },
    ],
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Dense woodland with tight turns.',
    requiredStars: 5,
    bgColor: '#0a1a10',
    pathColor: '#1a3020',
    waypoints: [
      { x: 0, y: 250 },
      { x: 150, y: 250 },
      { x: 150, y: 100 },
      { x: 400, y: 100 },
      { x: 400, y: 300 },
      { x: 250, y: 300 },
      { x: 250, y: 430 },
      { x: 550, y: 430 },
      { x: 550, y: 200 },
      { x: 700, y: 200 },
      { x: 700, y: 350 },
      { x: 800, y: 350 },
    ],
    slots: [
      { x: 80, y: 170, unitId: null },
      { x: 270, y: 150, unitId: null },
      { x: 320, y: 200, unitId: null },
      { x: 480, y: 150, unitId: null },
      { x: 330, y: 370, unitId: null },
      { x: 150, y: 370, unitId: null },
      { x: 450, y: 350, unitId: null },
      { x: 630, y: 300, unitId: null },
      { x: 630, y: 130, unitId: null },
    ],
  },
  {
    id: 'volcano',
    name: 'Volcano',
    description: 'Short & brutal. Fewer slots, harder enemies.',
    requiredStars: 15,
    bgColor: '#1a0a05',
    pathColor: '#3a1a10',
    waypoints: [
      { x: 0, y: 420 },
      { x: 200, y: 420 },
      { x: 200, y: 250 },
      { x: 350, y: 250 },
      { x: 350, y: 100 },
      { x: 500, y: 100 },
      { x: 500, y: 250 },
      { x: 650, y: 250 },
      { x: 650, y: 420 },
      { x: 800, y: 420 },
    ],
    slots: [
      { x: 100, y: 340, unitId: null },
      { x: 280, y: 330, unitId: null },
      { x: 270, y: 160, unitId: null },
      { x: 420, y: 180, unitId: null },
      { x: 580, y: 170, unitId: null },
      { x: 570, y: 340, unitId: null },
      { x: 730, y: 340, unitId: null },
    ],
  },
];
