import { Application } from 'pixi.js';
import { Game } from './game/Game';
import { DebugPanel } from './ui/DebugPanel';
import './style.css';

async function start(): Promise<void> {
  const app = new Application();
  await app.init({ background: 0x0d1726, antialias: true, resizeTo: undefined });
  const stage = document.createElement('main'); stage.className = 'stage'; stage.id = 'stage';
  document.querySelector('#app')?.prepend(stage); stage.appendChild(app.canvas);
  const panel = new DebugPanel();
  const game = new Game(app);
  panel.setWeapon(1);
  window.addEventListener('keydown', event => {
    if (event.key === '1' || event.key === '2') panel.setWeapon(Number(event.key) as 1 | 2);
  });
  panel.onChange(() => undefined);
  app.ticker.add(ticker => game.update(ticker.deltaMS / 1000, panel.controls, state => panel.update(state)));
}

void start();
