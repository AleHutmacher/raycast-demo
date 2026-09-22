import { Application } from 'pixi.js';
import { Menu } from './ui/Menu.js';
import './style.css';

async function start() {
  const app = new Application();
  await app.init({ background: 0x0d1726, antialias: true, resizeTo: undefined });
  const appEl = document.querySelector('#app');

  const menu = new Menu();
  menu.show(appEl);

  menu.onSelect(async (demo) => {
    if (demo === '2d') {
      const { Game } = await import('./game/Game2D.js');
      const { DebugPanel } = await import('./ui/DebugPanel2D.js');
      const stage = document.createElement('main');
      stage.className = 'stage';
      stage.id = 'stage';
      appEl.prepend(stage);
      stage.appendChild(app.canvas);
      const panel = new DebugPanel();
      const game = new Game(app);
      panel.setWeapon(1);
      window.addEventListener('keydown', event => {
        if (event.key === '1' || event.key === '2') panel.setWeapon(Number(event.key));
      });
      panel.onChange(() => undefined);
      app.ticker.add(ticker => game.update(ticker.deltaMS / 1000, panel.controls, state => panel.update(state)));
    } else if (demo === '3d') {
      const { Game3D } = await import('./game/Game3D.js');
      const { DebugPanel3D } = await import('./ui/DebugPanel3D.js');
      const stage = document.createElement('main');
      stage.className = 'stage stage-wide';
      stage.id = 'stage';
      appEl.prepend(stage);
      stage.appendChild(app.canvas);
      const panel = new DebugPanel3D();
      panel.show(appEl);
      const game = new Game3D(app);
      panel.onChange(() => game.setControls(panel.controls));
      game.setControls(panel.controls);
      app.ticker.add(ticker => {
        const state = game.update(ticker.deltaMS / 1000);
        if (state) panel.update(state);
      });
    }
  });
}

start();
