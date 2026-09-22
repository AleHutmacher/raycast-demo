import { Graphics } from 'pixi.js';
import { castRayDDA } from '../raycast/DDA.js';

export class RaycasterRenderer3D {
  graphics = new Graphics();

  draw(player, map, cellSize, ox, oy, width, height, controls) {
    this.graphics.clear();
    const fovDeg = controls?.fov ?? 60;
    const FOV = fovDeg * Math.PI / 180;
    const shadeWalls = controls?.shadeWalls !== false;
    const halfH = height / 2;
    const projectionPlane = (width / 2) / Math.tan(FOV / 2);

    const dirX = Math.cos(player.angle);
    const dirY = Math.sin(player.angle);
    const planeLen = Math.tan(FOV / 2);
    const planeX = -dirY * planeLen;
    const planeY = dirX * planeLen;

    this.graphics.rect(ox, oy, width, halfH).fill({ color: 0x1a1a2e });
    this.graphics.rect(ox, oy + halfH, width, halfH).fill({ color: 0x2d2d44 });

    for (let col = 0; col < width; col++) {
      const cameraX = 2 * col / width - 1;
      const rayDirX = dirX + planeX * cameraX;
      const rayDirY = dirY + planeY * cameraX;

      const hit = castRayDDA(player.position, rayDirX, rayDirY, map, cellSize);

      const perpDist = hit ? hit.perpDist / cellSize : 100;
      const wallHeight = perpDist > 0 ? height / perpDist : height;
      const wallTop = oy + halfH - wallHeight / 2;

      let color = 0x5a6e8a;
      if (hit) {
        if (hit.side === 0) {
          color = rayDirX > 0 ? 0x3b5998 : 0x2c4a7c;
        } else {
          color = rayDirY > 0 ? 0x4a6fa5 : 0x3a5f95;
        }
        if (shadeWalls) {
          const shade = Math.max(0.3, 1 - (hit.distance / (100 * cellSize)));
          const r = ((color >> 16) & 0xff) * shade;
          const g = ((color >> 8) & 0xff) * shade;
          const b = (color & 0xff) * shade;
          color = (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b);
        }
      }

      this.graphics.rect(ox + col, wallTop, 1, wallHeight).fill({ color });
    }
  }

  getFov(controls) {
    return (controls?.fov ?? 60) * Math.PI / 180;
  }
}
