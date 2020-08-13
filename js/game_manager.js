function GameManager(InputManager, Actuator, StorageManager, AIPlayer) {
    this.size           = 6; // Size of the grid
    this.inputManager   = new InputManager;
    this.storageManager = new StorageManager("ghosts");
    this.actuator       = new Actuator;
    this.aiPlayer       = new AIPlayer;

    this.inputManager.on("arrow", this.arrow.bind(this));
    this.inputManager.on("enter", this.enter.bind(this));
    this.inputManager.on("click", this.click.bind(this));
    this.inputManager.on("swipe", this.swipe.bind(this));
    this.inputManager.on("restart", this.restart.bind(this));

    this.setup();
}

// Restart the game
GameManager.prototype.restart = function () {
    this.storageManager.clearGameState();
    this.actuator.clearMessage(); // Clear the game won/lost message
    this.setup();
};

// Return true if the game is over
GameManager.prototype.isGameTerminated = function () {
    return this.lost || this.won;
};

GameManager.prototype.serialize = function () {
  return {
    grid: this.grid.serialize(),
    aiPlayer: this.aiPlayer.serialize(),
    lost: this.lost,
    won: this.won,
  };
};

GameManager.prototype.setup = function () {
    var previousState = this.storageManager.getGameState();

    // Reload the game from a previous game if present
    if (previousState) {
        this.grid = Grid.fromPreviousState(previousState.grid);
        this.aiPlayer = AIPlayer.fromPreviousState(previousState.aiPlayer);
        this.lost = previousState.lost;
        this.won = previousState.won;
    } else {
        this.grid = Grid.newGame();
        this.aiPlayer = AIPlayer.newGame();
        this.lost = false;
        this.won = false;
    }

    // Input UI states:
    // 0: Still stepping the "selected tile" highlight region around the screen.
    // 1: Have actually selected a tile (with one of my ghosts on it).
    // 2: Have indicated the (valid) direction in which to move that ghost.
    // The next step is to confirm the move, which puts us back into state 0.
    this.inputState = 0;
    this.highlightedTile = {x: 2, y: 2};
    this.selectedDirection = null;

    if (this.grid.isAITurn) {
        var self = this;
        window.setTimeout(function () {
            var result = self.aiPlayer.chooseMove(self);
            self.commitMoveForAI(result.source, result.direction);
            self.actuate();
        }, 500);
    } else {
        this.actuate();
    }
};

GameManager.prototype.actuate = function () {
    if (this.won || this.lost) {
        this.storageManager.clearGameState();
    } else {
        this.storageManager.setGameState(this.serialize());
    }

    if (this.inputState === 0) {
        this.grid.highlightTile('light', this.highlightedTile, this.selectedDirection);
    } else {
        this.grid.highlightTile('dark', this.highlightedTile, this.selectedDirection);
    }

    this.actuator.actuate(this.grid, {
        lost:       this.lost,
        won:        this.won,
    });
};

GameManager.prototype.arrow = function (direction) {
    if (this.isGameTerminated()) return; // Don't do anything if the game's over

    // Input UI states:
    // 0: Still stepping the "selected tile" highlight region around the screen.
    // 1: Have actually selected a tile (with one of my ghosts on it).
    // 2: Have indicated the (valid) direction in which to move that ghost.
    // The next step is to confirm the move, which puts us back into state 0.
    if (this.inputState == 0) {
        var d = Util.getVector(direction);
        this.highlightedTile = {
            x: Math.min(Math.max(0, this.highlightedTile.x + d.x), 5),
            y: Math.min(Math.max(0, this.highlightedTile.y + d.y), 5),
        };
    } else if (this.inputState == 1) {
        if (this.isLegalMoveForHuman(this.highlightedTile, direction)) {
            this.selectedDirection = direction;
            this.inputState = 2;
        } else {
            var d = Util.getVector(direction);
            this.highlightedTile = {
                x: Math.min(Math.max(0, this.highlightedTile.x + d.x), 5),
                y: Math.min(Math.max(0, this.highlightedTile.y + d.y), 5),
            };
            this.inputState = 0;
        }
    } else if (this.inputState == 2) {
        this.selectedDirection = null;
        this.inputState = 0;
    }
    this.actuate();
};

GameManager.prototype.enter = function (dummy) {
    if (this.isGameTerminated()) return; // Don't do anything if the game's over

    // Input UI states:
    // 0: Still stepping the "selected tile" highlight region around the screen.
    // 1: Have actually selected a tile (with one of my ghosts on it).
    // 2: Have indicated the (valid) direction in which to move that ghost.
    // The next step is to confirm the move, which puts us back into state 0.
    if (this.inputState === 0) {
        var tile = this.grid.at(this.highlightedTile);
        if (tile.owner === 'human') {
            this.inputState = 1;
        }
    } else if (this.inputState === 1) {
        this.inputState = 0;
    } else if (this.inputState === 2) {
        this.commitMoveForHuman(this.highlightedTile, this.selectedDirection);
    }
    this.actuate();
};

GameManager.prototype.click = function (position) {
    if (this.isGameTerminated()) return; // Don't do anything if the game's over

    if (this.inputState === 0) {
        var tile = this.grid.at(position);
        if (tile.owner === 'human') {
            this.highlightedTile = {x: position.x, y: position.y};
            this.inputState = 1;
        } else {
            this.highlightedTile = {x: position.x, y: position.y};
            this.inputState = 0;
        }
    } else if (this.inputState === 1) {
        var hx = this.highlightedTile.x;
        var hy = this.highlightedTile.y;
        if (Util.positionsEqual(position, {x: hx+1, y: hy})) {
            this.selectedDirection = 1;
        } else if (Util.positionsEqual(position, {x: hx-1, y: hy})) {
            this.selectedDirection = 3;
        } else if (Util.positionsEqual(position, {x: hx, y: hy+1})) {
            this.selectedDirection = 2;
        } else if (Util.positionsEqual(position, {x: hx, y: hy-1})) {
            this.selectedDirection = 0;
        } else {
            this.selectedDirection = null;
        }
        if (this.isLegalMoveForHuman(this.highlightedTile, this.selectedDirection)) {
            this.inputState = 2;
        } else if (this.grid.at(position).owner === 'human') {
            this.highlightedTile = position;
            this.selectedDirection = null;
            this.inputState = 1;
        } else {
            this.selectedDirection = null;
            this.inputState = 1;
        }
    } else if (this.inputState === 2) {
        var target = Util.addDirection(this.highlightedTile, this.selectedDirection);
        if (Util.positionsEqual(position, target)) {
            this.commitMoveForHuman(this.highlightedTile, this.selectedDirection);
        } else if (this.grid.at(position).owner === 'human') {
            this.highlightedTile = position;
            this.selectedDirection = null;
            this.inputState = 1;
        } else {
            this.selectedDirection = null;
            this.inputState = 1;
        }
    }
    this.actuate();
};

GameManager.prototype.swipe = function (position_and_direction) {
    if (this.isGameTerminated()) return; // Don't do anything if the game's over

    var source = position_and_direction.source;
    var direction = position_and_direction.direction;
    console.assert(Util.isWithinBounds(source));

    if (this.isLegalMoveForHuman(source, direction)) {
        this.commitMoveForHuman(source, direction);
    } else {
        this.highlightedTile = source;
    }

    this.actuate();
};

GameManager.prototype.isLegalMoveForHuman = function (source, direction) {
    if (this.grid.isAITurn) {
        return false;
    }

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
    var sourceTile = this.grid.at(source);
    var targetTile = this.grid.at(target);
    if (sourceTile.owner !== 'human' || targetTile.owner === 'human') {
        return false;
    }
    if (sourceTile.color === 'red' && targetTile.isExitForHuman()) {
        return false;
    }
    if (targetTile.isExitForAI()) {
        return false;
    }
    return true;
};

GameManager.prototype.isLegalMoveForAI = function (source, direction) {
    if (!this.grid.isAITurn) {
        return false;
    }

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
    var sourceTile = this.grid.at(source);
    var targetTile = this.grid.at(target);
    if (sourceTile.owner !== 'ai' || targetTile.owner === 'ai') {
        return false;
    }
    if (sourceTile.color === 'red' && targetTile.isExitForAI()) {
        return false;
    }
    if (targetTile.isExitForHuman()) {
        return false;
    }
    return true;
};

// Move tiles on the grid in the specified direction
GameManager.prototype.commitMoveForHuman = function (source, direction) {
    // 0: up, 1: right, 2: down, 3: left

    var target = Util.addDirection(source, direction);
    console.assert(Util.isWithinBounds(source));
    console.assert(Util.isWithinBounds(target));
    var sourceTile = this.grid.at(source);
    var targetTile = this.grid.at(target);
    console.assert(sourceTile.owner === 'human');
    console.assert(targetTile.owner !== 'human');
    if (targetTile.owner === 'ai') {
        this.grid.capturedByHuman.push(targetTile.color);
    }
    targetTile.color = sourceTile.color;
    targetTile.owner = sourceTile.owner;
    targetTile.previousPosition = sourceTile.position;
    sourceTile.owner = null;
    sourceTile.color = null;
    this.grid.isAITurn = true;

    this.won = this.grid.humanJustWon();
    this.lost = this.grid.humanJustLost();

    this.highlightedTile = target;
    this.selectedDirection = null;
    this.inputState = 0;

    if (!this.isGameTerminated()) {
        var self = this;
        self.aiPlayer.observeHumanMove(self, source, target);
        window.setTimeout(function () {
            var result = self.aiPlayer.chooseMove(self);
            self.commitMoveForAI(result.source, result.direction);
            self.actuate();
        }, 500);
    }
};

GameManager.prototype.commitMoveForAI = function (source, direction) {
    var target = Util.addDirection(source, direction);
    var sourceTile = this.grid.at(source);
    var targetTile = this.grid.at(target);
    console.assert(sourceTile.owner === 'ai');
    console.assert(targetTile.owner !== 'ai');
    if (targetTile.owner === 'human') {
        this.grid.capturedByAI.push(targetTile.color);
    }
    targetTile.color = sourceTile.color;
    targetTile.owner = sourceTile.owner;
    targetTile.previousPosition = sourceTile.position;
    sourceTile.owner = null;
    sourceTile.color = null;
    this.grid.isAITurn = false;

    this.won = this.grid.aiJustLost();
    this.lost = this.grid.aiJustWon();
};
