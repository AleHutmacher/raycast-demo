import { Graphics } from 'pixi.js';
import type { Player } from '../game/Player';

export class PlayerRenderer {
  readonly graphics = new Graphics();

  draw(player: Player, weapon: 1 | 2): void {
    this.graphics.clear();
    this.graphics.circle(player.position.x, player.position.y, 16).fill(0x4de1bd).stroke({ color: 0xd9fff6, width: 2 });
    this.graphics.moveTo(player.position.x + player.direction.x * 11, player.position.y + player.direction.y * 11).lineTo(player.position.x + player.direction.x * 30, player.position.y + player.direction.y * 30).stroke({ color: weapon === 1 ? 0xffd166 : 0x9b7cff, width: 7, cap: 'round' });
    this.graphics.moveTo(player.position.x, player.position.y).lineTo(player.position.x + player.direction.x * 31, player.position.y + player.direction.y * 31).stroke({ color: 0xffffff, width: 4, cap: 'round' });
    this.graphics.circle(player.position.x, player.position.y, 4).fill(0x122033);
  }
}
