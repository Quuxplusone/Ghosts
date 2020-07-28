function Grid(size, previousState) {
    this.size = size;
    this.cells = previousState ? this.fromState(previousState) : this.makeEmpty();
}

// Build a grid of the specified size
Grid.prototype.makeEmpty = function () {
    var cells = [];
    for (var x = 0; x < this.size; x++) {
        var row = cells[x] = [];
        for (var y = 0; y < this.size; y++) {
            row.push(null);
        }
    }
    return cells;
};

Grid.prototype.fromState = function (state) {
  var cells = [];

  for (var x = 0; x < this.size; x++) {
    var row = cells[x] = [];

    for (var y = 0; y < this.size; y++) {
      var tile = state[x][y];
      row.push(tile ? new Tile(tile.position, tile.color, tile.owner) : null);
    }
  }

  return cells;
};

// Call callback for every cell
Grid.prototype.eachCell = function (callback) {
    for (var x = 0; x < this.size; x++) {
        for (var y = 0; y < this.size; y++) {
            callback(x, y, this.cells[x][y]);
        }
    }
};

Grid.prototype.cellContent = function (cell) {
    if (this.withinBounds(cell)) {
        return this.cells[cell.x][cell.y];
    } else {
        return null;
    }
};

Grid.prototype.highlightTile = function (highlightType, position, direction) {
    console.assert(this.withinBounds(position));
    for (var x = 0; x < this.size; ++x) {
        for (var y = 0; y < this.size; ++y) {
            this.cells[x][y].highlightType = null;
            this.cells[x][y].selectedDirection = null;
        }
    }
    if (position !== null) {
        var selectedTile = this.cells[position.x][position.y];
        selectedTile.highlightType = highlightType;
        selectedTile.selectedDirection = direction;
    }
}

Grid.prototype.insertTile = function (tile) {
    this.cells[tile.x][tile.y] = tile;
};

Grid.prototype.withinBounds = function (position) {
    return position.x >= 0 && position.x < this.size &&
           position.y >= 0 && position.y < this.size;
};

Grid.prototype.serialize = function () {
    var cellState = [];

    for (var x = 0; x < this.size; x++) {
        var row = cellState[x] = [];
        for (var y = 0; y < this.size; y++) {
            row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
        }
    }

    return {
        size: this.size,
        cells: cellState
    };
};
