function Tile(position, color, owner) {
    this.x = position.x;
    this.y = position.y;
    this.color = color;  // 'blue' or 'red' or null
    this.owner = owner;  // 'human' or 'ai' or null
}

Tile.fromPreviousState = function (previousState) {
    return new Tile(previousState, previousState.color, previousState.owner);
};

Tile.prototype.serialize = function () {
    return {
        x: this.x,
        y: this.y,
        color: this.color,
        owner: this.owner,
    };
};
