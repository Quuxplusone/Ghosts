function Tile(position, color, owner) {
  this.x                = position.x;
  this.y                = position.y;
  this.previousPosition = null;
  this.color            = color;  // 'blue' or 'red' or null
  this.owner            = owner;  // 'human' or 'ai' or null
  this.isHighlighted = false;
  this.selectedDirection = null;
}

Tile.prototype.isExitForHuman = function () {
    return (this.x == 0 && this.y == 0) || (this.x == 5 && this.y == 0);
};

Tile.prototype.isExitForAI = function () {
    return (this.x == 0 && this.y == 5) || (this.x == 5 && this.y == 5);
};

Tile.prototype.updatePosition = function (position) {
  this.x = position.x;
  this.y = position.y;
};

Tile.prototype.serialize = function () {
  return {
    position: {
      x: this.x,
      y: this.y
    },
    color: this.color,
    owner: this.owner,
  };
};
