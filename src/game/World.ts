import type { Obstacle } from './Obstacle';

export class World {
  readonly obstacles: Obstacle[] = [
    { id: 1, position: { x: 110, y: 100 }, width: 180, height: 34 },
    { id: 2, position: { x: 520, y: 90 }, width: 46, height: 190 },
    { id: 3, position: { x: 235, y: 420 }, width: 230, height: 42 },
    { id: 4, position: { x: 650, y: 360 }, width: 130, height: 120 },
    { id: 5, position: { x: 80, y: 570 }, width: 170, height: 32 },
  ];
}
