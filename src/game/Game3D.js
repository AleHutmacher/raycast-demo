import { Application, Container, Graphics, Text } from 'pixi.js';
import { add, scale } from '../math/Vector2.js';
import { Player3D } from './Player3D.js';
import { World3D } from './World3D.js';
import { RaycasterRenderer3D } from '../rendering/RaycasterRenderer3D.js';
import { MinimapRenderer3D } from '../rendering/MinimapRenderer3D.js';
import { castRayDDA } from '../raycast/DDA.js';

export class Game3D {
  world = new World3D();
  player = new Player3D();
  root = new Container();
  raycaster = new RaycasterRenderer3D();
  minimap = new MinimapRenderer3D();
  separator = new Graphics();
  keys = new Set();
  width = 900;
  height = 400;
  controls = { speed: 200, rotationSpeed: 3, fov: 60, showMinimap: true, showGrid: true, showRays: true, shadeWalls: true };

  constructor(app) {
    this.app = app;
    app.stage.addChild(this.root);
    this.root.addChild(this.minimap.graphics);
    this.root.addChild(this.separator);
    this.root.addChild(this.raycaster.graphics);
    const labelStyle = { fill: 0x5d7694, fontFamily: 'Arial', fontSize: 11, fontWeight: '700', letterSpacing: 2 };
    this.label2d = new Text({ text: 'MAPA 2D', style: labelStyle });
    this.label2d.anchor.set(0, 0);
    this.root.addChild(this.label2d);
    this.label3d = new Text({ text: 'VISTA 3D', style: labelStyle });
    this.label3d.anchor.set(0, 0);
    this.root.addChild(this.label3d);
    window.addEventListener('keydown', event => this.keys.add(event.key.toLowerCase()));
    window.addEventListener('keyup', event => this.keys.delete(event.key.toLowerCase()));
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  setControls(controls) { this.controls = controls; }

  update(deltaSeconds) {
    this.player.speed = this.controls.speed;
    this.player.rotationSpeed = this.controls.rotationSpeed;

    let moveDir = 0;
    if (this.keys.has('w') || this.keys.has('arrowup')) moveDir += 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) moveDir -= 1;
    if (this.keys.has('a') || this.keys.has('arrowleft')) this.player.angle -= this.player.rotationSpeed * deltaSeconds;
    if (this.keys.has('d') || this.keys.has('arrowright')) this.player.angle += this.player.rotationSpeed * deltaSeconds;

    const forward = { x: Math.cos(this.player.angle), y: Math.sin(this.player.angle) };
    const move = scale(forward, moveDir * this.player.speed * deltaSeconds);
    const newPos = add(this.player.position, move);

    if (!this.collides(newPos)) {
      this.player.position = newPos;
    } else if (!this.collides({ x: newPos.x, y: this.player.position.y })) {
      this.player.position.x = newPos.x;
    } else if (!this.collides({ x: this.player.position.x, y: newPos.y })) {
      this.player.position.y = newPos.y;
    }

    const gap = 2;
    const minimapW = this.controls.showMinimap ? Math.floor(this.width * 0.35) : 0;
    const rayX = minimapW + gap;
    const rayW = this.width - rayX;

    if (this.controls.showMinimap) {
      this.minimap.graphics.visible = true;
      this.minimap.draw(this.player, this.world.getMap(), this.world.cellSize, 0, 0, minimapW, this.height);
      this.label2d.visible = true;
      this.label2d.position.set(10, 8);
    } else {
      this.minimap.graphics.visible = false;
      this.label2d.visible = false;
    }

    this.separator.clear();
    if (this.controls.showMinimap) {
      this.separator.moveTo(minimapW, 0).lineTo(minimapW, this.height).stroke({ color: 0x223754, width: gap });
    }
    this.raycaster.draw(this.player, this.world.getMap(), this.world.cellSize, rayX, 0, rayW, this.height, this.controls);
    this.label3d.position.set(rayX + 10, 8);

    const FOV = (this.controls.fov ?? 60) * Math.PI / 180;
    const dirX = Math.cos(this.player.angle);
    const dirY = Math.sin(this.player.angle);
    const planeLen = Math.tan(FOV / 2);
    const planeX = -dirY * planeLen;
    const planeY = dirX * planeLen;
    const centerRayX = dirX + planeX * 0;
    const centerRayY = dirY + planeY * 0;
    const centerHit = castRayDDA(this.player.position, centerRayX, centerRayY, this.world.getMap(), this.world.cellSize);

    return {
      playerX: this.player.position.x,
      playerY: this.player.position.y,
      playerAngle: this.player.angle,
      cellsCrossed: centerHit ? Math.round(centerHit.perpDist / this.world.cellSize) : '—',
      rayDist: centerHit ? centerHit.distance : null,
      hitSide: centerHit ? (centerHit.side === 0 ? 'Vertical (X)' : 'Horizontal (Y)') : '—'
    };
  }

  collides(pos) {
    for (const obs of this.world.obstacles) {
      const minX = obs.position.x;
      const minY = obs.position.y;
      const maxX = minX + obs.width;
      const maxY = minY + obs.height;
      const closestX = Math.max(minX, Math.min(pos.x, maxX));
      const closestY = Math.max(minY, Math.min(pos.y, maxY));
      const dx = pos.x - closestX;
      const dy = pos.y - closestY;
      if (Math.hypot(dx, dy) < this.player.radius) return true;
    }
    if (pos.x < this.player.radius || pos.x > this.world.mapWidth * this.world.cellSize - this.player.radius) return true;
    if (pos.y < this.player.radius || pos.y > this.world.mapHeight * this.world.cellSize - this.player.radius) return true;
    return false;
  }

  resize() {
    const canvas = this.app.canvas;
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (!rect) return;
    this.width = rect.width;
    this.height = rect.height;
    this.app.renderer.resize(this.width, this.height);
    this.app.stage.hitArea = this.app.screen;
  }
}
