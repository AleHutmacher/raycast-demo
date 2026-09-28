(function (Lab) {
  'use strict';

  class Player3D {
    position = { x: 480, y: 96 };
    angle = 0;
    speed = 200;
    rotationSpeed = 3;
    radius = 12;
  }

  Lab.Player3D = Player3D;
})(window.RaycastLab = window.RaycastLab || {});
