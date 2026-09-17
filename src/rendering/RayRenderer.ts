import { Graphics } from 'pixi.js';
import type { Vector2 } from '../math/Vector2';
import type { RaycastHit } from '../raycast/RaycastHit';

export class RayRenderer {
  readonly graphics = new Graphics();

  draw(origin: Vector2, rays: Array<{ direction: Vector2; distance: number; hit: RaycastHit | null }>, maxDistance: number, options: { showHit: boolean; showNormal: boolean }, shot: RaycastHit | null, anchor: RaycastHit | null, connection: { from: Vector2; to: Vector2 } | null): void {
    this.graphics.clear();
    for (const ray of rays) {
      const endDistance = ray.hit?.distance ?? maxDistance;
      const end = { x: origin.x + ray.direction.x * endDistance, y: origin.y + ray.direction.y * endDistance };
      this.graphics.moveTo(origin.x, origin.y).lineTo(end.x, end.y).stroke({ color: ray.hit ? 0xff5578 : 0xffc857, width: ray.hit ? 2.5 : 1.5, alpha: 0.9 });
      if (ray.hit && options.showHit) {
        this.graphics.circle(ray.hit.point.x, ray.hit.point.y, 6).fill(0xff5578).stroke({ color: 0xffffff, width: 2 });
      }
      if (ray.hit && options.showNormal) {
        this.graphics.moveTo(ray.hit.point.x, ray.hit.point.y).lineTo(ray.hit.point.x + ray.hit.normal.x * 28, ray.hit.point.y + ray.hit.normal.y * 28).stroke({ color: 0x8ef6ff, width: 3 });
      }
    }
    if (shot) {
      this.graphics.circle(shot.point.x, shot.point.y, 12).stroke({ color: 0xffffff, width: 2, alpha: 0.95 });
      this.graphics.moveTo(shot.point.x - 7, shot.point.y).lineTo(shot.point.x + 7, shot.point.y).stroke({ color: 0xffd166, width: 3 });
      this.graphics.moveTo(shot.point.x, shot.point.y - 7).lineTo(shot.point.x, shot.point.y + 7).stroke({ color: 0xffd166, width: 3 });
    }
    if (anchor) {
      this.graphics.moveTo(origin.x, origin.y).lineTo(anchor.point.x, anchor.point.y).stroke({ color: 0x9b7cff, width: 3, alpha: 0.9 });
      this.graphics.circle(anchor.point.x, anchor.point.y, 10).fill(0x9b7cff).stroke({ color: 0xf2edff, width: 2 });
      this.graphics.circle(anchor.point.x, anchor.point.y, 3).fill(0x0d1726);
    }
    if (connection) {
      this.graphics.moveTo(connection.from.x, connection.from.y).lineTo(connection.to.x, connection.to.y).stroke({ color: 0xf2a7ff, width: 4, alpha: 0.95 });
      this.graphics.circle(connection.to.x, connection.to.y, 8).fill(0xf2a7ff).stroke({ color: 0xffffff, width: 2 });
    }
  }
}
