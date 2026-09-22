import { Application, Container, Graphics, Text } from 'pixi.js';
import { add, normalize, rotate, scale, subtract } from '../math/Vector2.js';
import { raycast } from '../raycast/Raycast.js';
import { ObstacleRenderer } from '../rendering/ObstacleRenderer2D.js';
import { PlayerRenderer } from '../rendering/PlayerRenderer2D.js';
import { RayRenderer } from '../rendering/RayRenderer2D.js';
import { Player } from './Player2D.js';
import { World } from './World2D.js';

export class Game {
  world = new World();
  player = new Player();
  root = new Container();
  rays = new RayRenderer();
  obstacles = new ObstacleRenderer();
  playerRenderer = new PlayerRenderer();
  keys = new Set();
  pointer = { x: 600, y: 300 };
  shotHit = null;
  anchor = null;
  connection = null;
  currentControls = null;
  activeWeapon = 1;
  ropeLength = 0;
  jumpWasDown = false;
  jumpReady = true;
  mouseFireDown = false;
  width = 900;
  height = 700;

  constructor(app) {
    this.app = app;
    app.stage.addChild(this.root);
    const background = new Graphics().rect(0, 0, 2000, 1400).fill(0x0d1726);
    this.root.addChild(background);
    this.root.addChild(this.createGrid());
    this.root.addChild(this.rays.graphics);
    this.root.addChild(this.obstacles.container);
    this.root.addChild(this.playerRenderer.graphics);
    const hint = new Text({ text: 'MOVE  /  AIM', style: { fill: 0x5d7694, fontFamily: 'Arial', fontSize: 11, letterSpacing: 2 } });
    hint.position.set(24, 22); this.root.addChild(hint);
    window.addEventListener('keydown', event => {
      const key = event.key.toLowerCase();
      this.keys.add(key);
      if (key === '1' || key === '2') {
        this.activeWeapon = Number(key);
        if (this.activeWeapon === 1) { this.anchor = null; this.connection = null; }
      }
    });
    window.addEventListener('keyup', event => this.keys.delete(event.key.toLowerCase()));
    app.stage.eventMode = 'static';
    app.stage.hitArea = app.screen;
    app.stage.on('pointermove', event => { const point = event.global; this.pointer = { x: point.x, y: point.y }; });
    app.stage.on('pointerdown', event => { if (event.button === 0) { this.mouseFireDown = true; this.fire(); } });
    window.addEventListener('pointerup', event => { if (event.button === 0) this.mouseFireDown = false; });
    app.canvas.addEventListener('contextmenu', event => { event.preventDefault(); this.anchor = null; this.connection = null; });
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  update(deltaSeconds, controls, onDebug) {
    this.currentControls = controls;
    let movement = { x: 0, y: 0 };
    if (this.keys.has('w') || this.keys.has('arrowup')) movement.y -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) movement.y += 1;
    if (this.keys.has('a') || this.keys.has('arrowleft')) movement.x -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) movement.x += 1;
    const jumpDown = this.keys.has(' ');
    if (this.anchor && this.mouseFireDown) {
      this.ropeLength = Math.max(34, this.ropeLength - 170 * deltaSeconds);
    } else if (this.anchor && jumpDown) {
      this.ropeLength = Math.min(controls.distance, this.ropeLength + 220 * deltaSeconds);
    } else if (!this.anchor && jumpDown && !this.jumpWasDown && this.jumpReady) {
      this.player.velocity.y = -this.player.jumpSpeed;
      this.jumpReady = false;
    }
    this.jumpWasDown = jumpDown;
    const physicsResponse = controls.physics / 100;
    const targetVelocityX = movement.x * this.player.speed;
    if (!this.anchor) this.player.velocity.x += (targetVelocityX - this.player.velocity.x) * Math.min(1, (4 + physicsResponse * 20) * deltaSeconds);
    this.player.velocity.y += controls.gravity * deltaSeconds;
    if (this.anchor) {
      const ropeOffset = subtract(this.player.position, this.anchor.point);
      const ropeDistance = Math.hypot(ropeOffset.x, ropeOffset.y);
      if (ropeDistance > 0) {
        const tangentialInput = movement.x;
        this.player.velocity = add(this.player.velocity, scale({ x: tangentialInput, y: 0 }, 1100 * physicsResponse * deltaSeconds));
        const damping = Math.pow(0.9985, deltaSeconds * 60);
        this.player.velocity = scale(this.player.velocity, damping);
      }
    }
    this.player.position = add(this.player.position, scale(this.player.velocity, deltaSeconds));
    if (this.anchor) this.applyRopeConstraint();
    this.resolveWorldCollisions();
    this.player.direction = normalize(subtract(this.pointer, this.player.position));
    const centerDirection = rotate(this.player.direction, controls.angle * Math.PI / 180);
    const count = controls.multiple ? Math.max(1, Math.round(controls.rays)) : 1;
    const fov = controls.multiple ? controls.fov * Math.PI / 180 : 0;
    const rayResults = [];
    for (let index = 0; index < count; index += 1) {
      const ratio = count === 1 ? 0 : index / (count - 1) - 0.5;
      const direction = normalize(rotate(centerDirection, ratio * fov));
      const hit = raycast(this.player.position, direction, controls.distance, this.world.obstacles);
      rayResults.push({ direction, distance: hit?.distance ?? controls.distance, hit });
    }
    if (controls.enabled) this.rays.draw(this.player.position, rayResults, controls.distance, { showHit: controls.showHit, showNormal: controls.showNormal }, this.shotHit, this.anchor, this.connection); else this.rays.draw(this.player.position, [], controls.distance, { showHit: false, showNormal: false }, this.shotHit, this.anchor, this.connection);
    this.obstacles.draw(this.world.obstacles, controls.showBounds);
    this.playerRenderer.draw(this.player, this.activeWeapon);
    const primary = rayResults[0]?.hit ?? null;
    onDebug({ playerX: this.player.position.x, playerY: this.player.position.y, directionX: this.player.direction.x, directionY: this.player.direction.y, hit: primary ? { id: primary.obstacle.id, distance: primary.distance, x: primary.point.x, y: primary.point.y } : null });
  }

  fire() {
    const controls = this.currentControls;
    const angle = (controls?.angle ?? 0) * Math.PI / 180;
    const distance = controls?.distance ?? 500;
    const direction = normalize(rotate(this.player.direction, angle));
    const hit = raycast(this.player.position, direction, distance, this.world.obstacles);
    if (this.activeWeapon === 1) {
      this.shotHit = hit;
      this.anchor = null;
      this.connection = null;
      return;
    }
    this.shotHit = null;
    if (this.anchor) {
      return;
    }
    if (!hit) return;
    this.anchor = hit;
    this.ropeLength = Math.hypot(hit.point.x - this.player.position.x, hit.point.y - this.player.position.y);
    const rope = normalize(subtract(this.player.position, hit.point));
    this.player.velocity = add(this.player.velocity, scale({ x: -rope.y, y: rope.x }, 150));
  }

  applyRopeConstraint() {
    if (!this.anchor) return;
    const offset = subtract(this.player.position, this.anchor.point);
    const distance = Math.hypot(offset.x, offset.y);
    if (distance <= this.ropeLength || distance === 0) return;
    const normal = scale(offset, 1 / distance);
    this.player.position = add(this.anchor.point, scale(normal, this.ropeLength));
    const radialSpeed = this.player.velocity.x * normal.x + this.player.velocity.y * normal.y;
    if (radialSpeed > 0) this.player.velocity = subtract(this.player.velocity, scale(normal, radialSpeed));
  }

  resolveWorldCollisions() {
    for (const obstacle of this.world.obstacles) {
      const minX = obstacle.position.x;
      const minY = obstacle.position.y;
      const maxX = minX + obstacle.width;
      const maxY = minY + obstacle.height;
      const closest = { x: Math.max(minX, Math.min(this.player.position.x, maxX)), y: Math.max(minY, Math.min(this.player.position.y, maxY)) };
      let normal;
      let penetration;
      const dx = this.player.position.x - closest.x;
      const dy = this.player.position.y - closest.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 0 && distance < this.player.radius) {
        normal = { x: dx / distance, y: dy / distance };
        penetration = this.player.radius - distance;
      } else if (distance === 0 && this.player.position.x > minX && this.player.position.x < maxX && this.player.position.y > minY && this.player.position.y < maxY) {
        const distances = [{ value: this.player.position.x - minX, normal: { x: -1, y: 0 } }, { value: maxX - this.player.position.x, normal: { x: 1, y: 0 } }, { value: this.player.position.y - minY, normal: { x: 0, y: -1 } }, { value: maxY - this.player.position.y, normal: { x: 0, y: 1 } }];
        const nearest = distances.reduce((a, b) => a.value < b.value ? a : b);
        normal = nearest.normal;
        penetration = this.player.radius + nearest.value;
      } else continue;
      this.player.position = add(this.player.position, scale(normal, penetration));
      const inwardVelocity = this.player.velocity.x * normal.x + this.player.velocity.y * normal.y;
      if (inwardVelocity < 0) this.player.velocity = subtract(this.player.velocity, scale(normal, inwardVelocity));
      this.jumpReady = true;
    }
    if (this.player.position.x < this.player.radius) { this.player.position.x = this.player.radius; this.player.velocity.x = Math.max(0, this.player.velocity.x); this.jumpReady = true; }
    if (this.player.position.x > this.width - this.player.radius) { this.player.position.x = this.width - this.player.radius; this.player.velocity.x = Math.min(0, this.player.velocity.x); this.jumpReady = true; }
    if (this.player.position.y < this.player.radius) { this.player.position.y = this.player.radius; this.player.velocity.y = Math.max(0, this.player.velocity.y); this.jumpReady = true; }
    if (this.player.position.y > this.height - this.player.radius) { this.player.position.y = this.height - this.player.radius; this.player.velocity.y = 0; this.jumpReady = true; }
  }

  createGrid() {
    const grid = new Graphics();
    for (let x = 0; x <= 1400; x += 40) grid.moveTo(x, 0).lineTo(x, 1000);
    for (let y = 0; y <= 1000; y += 40) grid.moveTo(0, y).lineTo(1400, y);
    grid.stroke({ color: 0x17263b, width: 1, alpha: 0.8 });
    return grid;
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
