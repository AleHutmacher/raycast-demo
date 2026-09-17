import type { Vector2 } from '../math/Vector2';
import type { Obstacle } from '../game/Obstacle';

export interface RaycastHit { obstacle: Obstacle; point: Vector2; distance: number; normal: Vector2; }
