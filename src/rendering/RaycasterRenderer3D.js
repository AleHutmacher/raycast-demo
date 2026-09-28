(function (Lab) {
  'use strict';

  const { Draw, castRayDDA } = Lab;

  // Cada columna se dibuja un poco más ancha y la siguiente la tapa: evita
  // costuras finas entre columnas en pantallas con escala fraccionaria (125 %, 150 %).
  const COLUMN_OVERLAP = 0.5;

  class RaycasterRenderer3D {
    draw(ctx, player, map, cellSize, ox, oy, width, height, controls) {
      const fovDeg = controls?.fov ?? 60;
      const FOV = fovDeg * Math.PI / 180;
      const shadeWalls = controls?.shadeWalls !== false;
      const halfH = height / 2;

      const dirX = Math.cos(player.angle);
      const dirY = Math.sin(player.angle);
      const planeLen = Math.tan(FOV / 2);
      const planeX = -dirY * planeLen;
      const planeY = dirX * planeLen;

      Draw.fillRect(ctx, ox, oy, width, halfH, 0x1a1a2e);
      Draw.fillRect(ctx, ox, oy + halfH, width, halfH, 0x2d2d44);

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

        const columnWidth = col + 1 < width ? 1 + COLUMN_OVERLAP : 1;
        Draw.fillRect(ctx, ox + col, wallTop, columnWidth, wallHeight, color);
      }
    }

    getFov(controls) {
      return (controls?.fov ?? 60) * Math.PI / 180;
    }
  }

  Lab.RaycasterRenderer3D = RaycasterRenderer3D;
})(window.RaycastLab = window.RaycastLab || {});
