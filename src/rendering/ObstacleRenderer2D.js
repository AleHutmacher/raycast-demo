import { Graphics, Text } from 'pixi.js';

export class ObstacleRenderer {
  container = new Graphics();
  labels = [];

  draw(obstacles, showBounds) {
    this.container.clear();
    for (const label of this.labels) label.destroy();
    this.labels.length = 0;
    for (const obstacle of obstacles) {
      const { x, y } = obstacle.position;
      this.container.roundRect(x, y, obstacle.width, obstacle.height, 8).fill({ color: 0x273b59 }).stroke({ color: 0x4d709d, width: 2 });
      if (showBounds) this.container.rect(x, y, obstacle.width, obstacle.height).stroke({ color: 0x73a8d8, width: 1, alpha: 0.65 });
      const label = new Text({ text: `#${obstacle.id}`, style: { fill: 0x9bb9d7, fontFamily: 'Arial', fontSize: 12, fontWeight: 'bold' } });
      label.position.set(x + 9, y + 8);
      this.container.addChild(label);
      this.labels.push(label);
    }
  }
}
