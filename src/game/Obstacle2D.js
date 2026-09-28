(function (Lab) {
  'use strict';

  class Obstacle {
    constructor(id, x, y, width, height) {
      this.id = id;
      this.position = { x, y };
      this.width = width;
      this.height = height;
    }
  }

  Lab.Obstacle = Obstacle;
})(window.RaycastLab = window.RaycastLab || {});
