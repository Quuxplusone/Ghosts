function Grid() {
    this.size = 6;
}

Grid.newGame = function () {
    var self = new Grid();
    self.cells = self.cellsFromState(null);
    self.capturedByHuman = [];
    self.capturedByAI = [];
    self.isAITurn = false;
    self.addInitialTiles();
    self.isAITurn = (Math.round(Math.random()) == 0);

    var pieces = ['blue', 'blue', 'blue', 'blue', 'red', 'red', 'red', 'red'];
    Util.shuffleArray(pieces);
    this.insertTile(new Tile({x: 1, y: 5}, pieces[0], 'human'));
    this.insertTile(new Tile({x: 2, y: 5}, pieces[1], 'human'));
    this.insertTile(new Tile({x: 3, y: 5}, pieces[2], 'human'));
    this.insertTile(new Tile({x: 4, y: 5}, pieces[3], 'human'));
    this.insertTile(new Tile({x: 1, y: 4}, pieces[4], 'human'));
    this.insertTile(new Tile({x: 2, y: 4}, pieces[5], 'human'));
    this.insertTile(new Tile({x: 3, y: 4}, pieces[6], 'human'));
    this.insertTile(new Tile({x: 4, y: 4}, pieces[7], 'human'));
    Util.shuffleArray(pieces);
    this.insertTile(new Tile({x: 1, y: 0}, pieces[0], 'ai'));
    this.insertTile(new Tile({x: 2, y: 0}, pieces[1], 'ai'));
    this.insertTile(new Tile({x: 3, y: 0}, pieces[2], 'ai'));
    this.insertTile(new Tile({x: 4, y: 0}, pieces[3], 'ai'));
    this.insertTile(new Tile({x: 1, y: 1}, pieces[4], 'ai'));
    this.insertTile(new Tile({x: 2, y: 1}, pieces[5], 'ai'));
    this.insertTile(new Tile({x: 3, y: 1}, pieces[6], 'ai'));
    this.insertTile(new Tile({x: 4, y: 1}, pieces[7], 'ai'));
    for (var x = 0; x < 6; ++x) {
        for (var y = 0; y < 6; ++y) {
            if ((1 <= x && x <= 4) && (y <= 1 || y >= 4)) {
                continue;
            }
            this.insertTile(new Tile({x: x, y: y}, null, null));
        }
    }
    return self;
};

Grid.fromPreviousState = function (previousState) {
    var self = new Grid();
    self.cells = self.cellsFromState(previousState.cells);
    self.capturedByHuman = previousState.capturedByHuman;
    self.capturedByAI = previousState.capturedByAI;
    self.isAITurn = previousState.isAITurn;
    return self;
};

Grid.prototype.cellsFromState = function (state) {
    var cells = [];
    for (var x = 0; x < this.size; x++) {
        var row = cells[x] = [];
        for (var y = 0; y < this.size; y++) {
            if (state) {
                var tile = state[x][y];
                row.push(new Tile(tile.position, tile.color, tile.owner));
            } else {
                row.push(null);
            }
        }
    }
    return cells;
};

Grid.prototype.serialize = function () {
    var cellState = [];
    for (var x = 0; x < this.size; x++) {
        var row = cellState[x] = [];
        for (var y = 0; y < this.size; y++) {
            row.push(this.cells[x][y].serialize());
        }
    }
    return {
        size: this.size,
        cells: cellState,
        capturedByHuman: this.capturedByHuman,
        capturedByAI: this.capturedByAI,
        isAITurn: this.isAITurn,
    };
};

Grid.prototype.at = function (cell) {
    console.assert(this.withinBounds(cell));
    return this.cells[cell.x][cell.y];
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
};

Grid.prototype.insertTile = function (tile) {
    this.cells[tile.x][tile.y] = tile;
};

Grid.prototype.withinBounds = function (position) {
    return position.x >= 0 && position.x < this.size &&
           position.y >= 0 && position.y < this.size;
};

Grid.prototype.humanJustWon = function () {
    if (this.at({x: 0, y: 0}).color == 'blue' || this.at({x: 5, y: 0}).color == 'blue') {
        return true;
    }
    if (this.capturedByHuman.filter(function(c){ return c === 'blue'; }).length === 4) {
        return true;
    }
    return false;
};

Grid.prototype.humanJustLost = function () {
    if (this.capturedByHuman.filter(function(c){ return c === 'red'; }).length === 4) {
        return true;
    }
    return false;
};

Grid.prototype.aiJustWon = function () {
    if (this.at({x: 0, y: 5}).color == 'blue' || this.at({x: 5, y: 5}).color == 'blue') {
        return true;
    }
    if (this.capturedByAI.filter(function(c){ return c === 'blue'; }).length === 4) {
        return true;
    }
    return false;
};

Grid.prototype.aiJustLost = function () {
    if (this.capturedByAI.filter(function(c){ return c === 'red'; }).length === 4) {
        return true;
    }
    return false;
};

