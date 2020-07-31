function Grid() {
    this.size = 6;
}

Grid.newGame = function () {
    var self = new Grid();
    self.capturedByHuman = [];
    self.capturedByAI = [];
    self.isAITurn = (Math.round(Math.random()) == 0);
    self.cells = self.cellsFromState(null);

    var humanPieces = ['blue', 'blue', 'blue', 'blue', 'red', 'red', 'red', 'red'];
    var aiPieces = ['blue', 'blue', 'blue', 'blue', 'red', 'red', 'red', 'red'];
    Util.shuffleArray(humanPieces);
    Util.shuffleArray(aiPieces);
    for (var x = 0; x < 6; ++x) {
        for (var y = 0; y < 6; ++y) {
            var position = {x: x, y: y};
            if (Util.isHumanStartPosition(position)) {
                self.cells[x][y] = new Tile(position, humanPieces.pop(), 'human');
            } else if (Util.isAIStartPosition(position)) {
                self.cells[x][y] = new Tile(position, aiPieces.pop(), 'ai');
            } else {
                self.cells[x][y] = new Tile(position, null, null);
            }
        }
    }
    return self;
};

Grid.fromPreviousState = function (previousState) {
    var self = new Grid();
    self.capturedByHuman = previousState.capturedByHuman;
    self.capturedByAI = previousState.capturedByAI;
    self.isAITurn = previousState.isAITurn;
    self.cells = self.cellsFromState(previousState.cells);
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
    console.assert(Util.isWithinBounds(cell));
    return this.cells[cell.x][cell.y];
};

Grid.prototype.highlightTile = function (highlightType, position, direction) {
    console.assert(Util.isWithinBounds(position));
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

