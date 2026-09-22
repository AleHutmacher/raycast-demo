import { Graphics } from 'pixi.js';
import { castRayDDA } from '../raycast/DDA.js';

export class MinimapRenderer3D {
  graphics = new Graphics();

  draw(player, map, cellSize, ox, oy, width, height, controls) {
    this.graphics.clear();
    const showGrid = controls?.showGrid !== false;
    const showRays = controls?.showRays !== false;
    const mapW = map[0].length;
    const mapH = map.length;
    const cellW = width / mapW;
    const cellH = height / mapH;

    this.graphics.rect(ox, oy, width, height).fill({ color: 0x0d1117 });

    for (let row = 0; row < mapH; row++) {
      for (let col = 0; col < mapW; col++) {
        if (map[row][col] === 1) {
          this.graphics.rect(ox + col * cellW, oy + row * cellH, cellW, cellH).fill({ color: 0x2c4a7c });
        }
      }
    }

    if (showGrid) {
      for (let col = 0; col <= mapW; col++) {
        this.graphics.moveTo(ox + col * cellW, oy).lineTo(ox + col * cellW, oy + height).stroke({ color: 0x1a2d44, width: 0.5 });
      }
      for (let row = 0; row <= mapH; row++) {
        this.graphics.moveTo(ox, oy + row * cellH).lineTo(ox + width, oy + row * cellH).stroke({ color: 0x1a2d44, width: 0.5 });
      }
    }

    const dirX = Math.cos(player.angle);
    const dirY = Math.sin(player.angle);

    if (showRays) {
      const fov = (controls?.fov ?? 60) * Math.PI / 180;
      const planeLen = Math.tan(fov / 2);
      const planeX = -dirY * planeLen;
      const planeY = dirX * planeLen;

      for (let col = 0; col < width; col += 3) {
        const cameraX = 2 * col / width - 1;
        const rayDirX = dirX + planeX * cameraX;
        const rayDirY = dirY + planeY * cameraX;
        const hit = castRayDDA(player.position, rayDirX, rayDirY, map, cellSize);

        const px = ox + (player.position.x / cellSize) * cellW;
        const py = oy + (player.position.y / cellSize) * cellH;

        if (hit) {
          const hx = ox + (hit.hitX / cellSize) * cellW;
          const hy = oy + (hit.hitY / cellSize) * cellH;
          this.graphics.moveTo(px, py).lineTo(hx, hy).stroke({ color: 0xffc857, width: 0.5, alpha: 0.25 });
        } else {
          const rayLen = 40;
          const endX = px + rayDirX * rayLen;
          const endY = py + rayDirY * rayLen;
          this.graphics.moveTo(px, py).lineTo(endX, endY).stroke({ color: 0xffc857, width: 0.5, alpha: 0.15 });
        }
      }
    }

    const px = ox + (player.position.x / cellSize) * cellW;
    const py = oy + (player.position.y / cellSize) * cellH;
    const fov = (controls?.fov ?? 60) * Math.PI / 180;
    const coneLen = 60;
    this.graphics.moveTo(px, py).lineTo(px + Math.cos(player.angle - fov / 2) * coneLen, py + Math.sin(player.angle - fov / 2) * coneLen).stroke({ color: 0x4de1bd, width: 1, alpha: 0.5 });
    this.graphics.moveTo(px, py).lineTo(px + Math.cos(player.angle) * coneLen, py + Math.sin(player.angle) * coneLen).stroke({ color: 0x4de1bd, width: 1, alpha: 0.7 });
    this.graphics.moveTo(px, py).lineTo(px + Math.cos(player.angle + fov / 2) * coneLen, py + Math.sin(player.angle + fov / 2) * coneLen).stroke({ color: 0x4de1bd, width: 1, alpha: 0.5 });

    this.graphics.circle(px, py, 4).fill({ color: 0x4de1bd });
    this.graphics.circle(px, py, 4).stroke({ color: 0xffffff, width: 1 });
  }
}
