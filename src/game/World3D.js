(function (Lab) {
  'use strict';

  const { Obstacle } = Lab;

  const CELL = 64;

  const MAP = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,0,1,0,0,1,1,1,0,1,1,1,0,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,1,0,1,1],
    [1,0,1,1,1,0,1,1,1,0,0,1,0,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,1,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,0,0,0,1,1],
    [1,0,0,0,1,0,0,0,1,0,1,1,0,0,1],
    [1,0,1,0,1,1,1,0,1,0,1,0,0,0,1],
    [1,0,1,0,0,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,1,1,0,1,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ];

  class World3D {
    obstacles = [];
    mapWidth = MAP[0].length;
    mapHeight = MAP.length;
    cellSize = CELL;

    constructor() {
      let id = 0;
      for (let row = 0; row < MAP.length; row++) {
        for (let col = 0; col < MAP[row].length; col++) {
          if (MAP[row][col] === 1) {
            id += 1;
            this.obstacles.push(new Obstacle(id, col * CELL, row * CELL, CELL, CELL));
          }
        }
      }
    }

    getMap() { return MAP; }
  }

  Lab.World3D = World3D;
})(window.RaycastLab = window.RaycastLab || {});
