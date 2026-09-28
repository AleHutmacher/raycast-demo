(function (Lab) {
  'use strict';

  const { Draw } = Lab;

  // Reemplazo mínimo de PIXI.Application: un <canvas> con contexto 2D,
  // un bucle con requestAnimationFrame y resize nítido en pantallas retina.
  class CanvasApp {
    constructor({ background = 0x000000 } = {}) {
      this.background = background;
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.width = 800;
      this.height = 600;
      this.pixelRatio = 1;
      this.tickers = [];
      this.lastTime = null;
      this.resize(this.width, this.height);
    }

    // width/height en píxeles CSS; el buffer interno se escala por devicePixelRatio.
    resize(width, height) {
      this.width = width;
      this.height = height;
      this.pixelRatio = window.devicePixelRatio || 1;
      this.canvas.width = Math.max(1, Math.round(width * this.pixelRatio));
      this.canvas.height = Math.max(1, Math.round(height * this.pixelRatio));
    }

    // Posición de un evento de puntero en coordenadas del juego.
    toLocal(event) {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = rect.width ? this.width / rect.width : 1;
      const scaleY = rect.height ? this.height / rect.height : 1;
      return { x: (event.clientX - rect.left) * scaleX, y: (event.clientY - rect.top) * scaleY };
    }

    // Registra una función que se llama en cada frame con (deltaSeconds, ctx).
    addTicker(callback) {
      this.tickers.push(callback);
      if (this.tickers.length === 1) requestAnimationFrame(time => this.frame(time));
    }

    frame(time) {
      // Igual que el ticker de pixi: el delta se limita a 100 ms para evitar saltos.
      const deltaSeconds = this.lastTime === null ? 0 : Math.min(0.1, Math.max(0, (time - this.lastTime) / 1000));
      this.lastTime = time;

      const ctx = this.ctx;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      Draw.fillRect(ctx, 0, 0, this.canvas.width, this.canvas.height, this.background);
      ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);

      for (const tick of this.tickers) tick(deltaSeconds, ctx);
      requestAnimationFrame(next => this.frame(next));
    }
  }

  Lab.CanvasApp = CanvasApp;
})(window.RaycastLab = window.RaycastLab || {});
