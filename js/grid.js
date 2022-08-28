function Grid() {}

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
    for (var x = 0; x < 6; ++x) {
        var row = cells[x] = [];
        for (var y = 0; y < 6; ++y) {
            row.push(state ? Tile.fromPreviousState(state[x][y]) : null);
        }
    }
    return cells;
};

Grid.prototype.serialize = function () {
    var cellState = [];
    for (var x = 0; x < 6; ++x) {
        var row = cellState[x] = [];
        for (var y = 0; y < 6; ++y) {
            row.push(this.cells[x][y].serialize());
        }
    }
    return {
        cells: cellState,
        capturedByHuman: this.capturedByHuman,
        capturedByAI: this.capturedByAI,
        isAITurn: this.isAITurn,
    };
};

Grid.prototype.clone = function () {
    var self = new Grid();
    self.capturedByHuman = this.capturedByHuman.slice(0);
    self.capturedByAI = this.capturedByAI.slice(0);
    self.isAITurn = this.isAITurn;
    self.cells = self.cellsFromState(this.cells);
    return self;
};

Grid.prototype.at = function (position) {
    console.assert(Util.isWithinBounds(position));
    return this.cells[position.x][position.y];
};

Grid.prototype.adjacentPieces = function (position, owner) {
    console.assert(Util.isWithinBounds(position));
    var count = 0;
    for (var n of Util.neighborsOf(position)) {
        count += (this.at(n).owner === owner);
    }
    return count;
};

Grid.prototype.highlightTile = function (highlightType, position, direction) {
    console.assert(Util.isWithinBounds(position));
    for (var x = 0; x < 6; ++x) {
        for (var y = 0; y < 6; ++y) {
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

Grid.prototype.isLegalMove = function (source, direction) {
    var who = (this.isAITurn ? 'ai' : 'human');
    if (source === null || direction === null) {
        return false;
    }
    if (!Util.isWithinBounds(source)) {
        return false;
    }
    var target = Util.addDirection(source, direction);
    if (!Util.isWithinBounds(target)) {
        return false;
    }
    var sourceTile = this.at(source);
    var targetTile = this.at(target);
    if (sourceTile.owner !== who || targetTile.owner === who) {
        return false;
    }
    if (sourceTile.color === 'red' && Util.isGoalFor(who, target)) {
        return false;
    }
    if (Util.isGoalFor(Util.notme(who), target)) {
        return false;
    }
    return true;
};

Grid.prototype.commitMove = function (source, target) {
    var sourceTile = this.at(source);
    var targetTile = this.at(target);
    console.assert(sourceTile.owner === (this.isAITurn ? 'ai' : 'human'));
    console.assert(targetTile.owner !== sourceTile.owner);
    if (targetTile.owner === 'human') {
        this.capturedByAI.push(targetTile.color);
    } else if (targetTile.owner === 'ai') {
        this.capturedByHuman.push(targetTile.color);
    }
    targetTile.color = sourceTile.color;
    targetTile.owner = sourceTile.owner;
    sourceTile.owner = null;
    sourceTile.color = null;
    this.isAITurn = !this.isAITurn;
};

Grid.prototype.humanPiecesRemaining = function (color) {
    return 4 - this.capturedByAI.filter(function(c){ return c === color; }).length;
};

Grid.prototype.aiPiecesRemaining = function (color) {
    return 4 - this.capturedByHuman.filter(function(c){ return c === color; }).length;
};

Grid.prototype.humanJustWon = function () {
    return (
        this.at({x: 0, y: 0}).color == 'blue' ||
        this.at({x: 5, y: 0}).color == 'blue' ||
        this.aiPiecesRemaining('blue') == 0
    );
};

Grid.prototype.humanJustLost = function () {
    return (this.aiPiecesRemaining('red') == 0);
};

Grid.prototype.aiJustWon = function () {
    return (
        this.at({x: 0, y: 5}).color == 'blue' ||
        this.at({x: 5, y: 5}).color == 'blue' ||
        this.humanPiecesRemaining('blue') == 0
    );
};

Grid.prototype.aiJustLost = function () {
    return (this.humanPiecesRemaining('red') == 0);
};
