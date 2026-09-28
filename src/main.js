(function (Lab) {
  'use strict';

  const { CanvasApp, Menu, Game, DebugPanel, Game3D, DebugPanel3D } = Lab;

  function start() {
    const app = new CanvasApp({ background: 0x0d1726 });
    const appEl = document.querySelector('#app');

    const menu = new Menu();
    menu.show(appEl);

    menu.onSelect((demo) => {
      if (demo === '2d') {
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
        app.addTicker(deltaSeconds => game.update(deltaSeconds, panel.controls, state => panel.update(state)));
      } else if (demo === '3d') {
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
        app.addTicker(deltaSeconds => {
          const state = game.update(deltaSeconds);
          if (state) panel.update(state);
        });
      }
    });
  }

  start();
})(window.RaycastLab = window.RaycastLab || {});
