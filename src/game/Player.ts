import type { Vector2 } from '../math/Vector2';

export class Player {
  position: Vector2 = { x: 360, y: 300 };
  direction: Vector2 = { x: 1, y: 0 };
  velocity: Vector2 = { x: 0, y: 0 };
  readonly radius = 16;
  readonly speed = 260;
  readonly jumpSpeed = 440;
}
